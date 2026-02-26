import { embed, embedMany } from "ai";
import { cosineDistance, desc, gt, sql, and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { chunks } from "@/server/db/schema";
import { embeddingModel } from "@/server/ai";

/**
 * Generate a single embedding vector for a text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const input = text.replaceAll("\n", " ").trim();
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
}

/**
 * Generate embeddings for multiple texts in a single batched call.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const cleaned = texts.map((t) => t.replaceAll("\n", " ").trim());
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: cleaned,
  });
  return embeddings;
}

/**
 * Hybrid retrieval: dense cosine similarity + curriculum metadata boost.
 *
 * Implements the scoring formula from the architecture:
 *   S_final = α·S_dense + β·S_sparse + γ·S_meta
 *
 * Since Postgres doesn't have native BM25, we skip the sparse component
 * and rely on dense + metadata alignment where γ > α (curriculum takes priority).
 *
 * Weights: α=0.4, γ=0.6 (when metadata filters provided)
 *          α=1.0 (no metadata filters → pure dense search)
 */
export async function findRelevantChunks(
  query: string,
  opts: {
    subject?: string | null;
    level?: string | null;
    limit?: number;
    threshold?: number;
  } = {},
) {
  const { subject, level, limit = 6, threshold = 0.25 } = opts;

  const queryEmbedding = await generateEmbedding(query);

  // Dense similarity score: 1 - cosine_distance
  const denseSimilarity = sql<number>`1 - (${cosineDistance(chunks.embedding, queryEmbedding)})`;

  // Curriculum metadata alignment score (0 or 1)
  const hasMetadataFilter = subject || level;
  const metaScore = hasMetadataFilter
    ? sql<number>`CASE
			WHEN ${subject ? sql`${chunks.subject} = ${subject}` : sql`TRUE`}
			AND ${level ? sql`${chunks.level} = ${level}` : sql`TRUE`}
			THEN 1.0 ELSE 0.0
		END`
    : sql<number>`0.0`;

  // Weighted final score: α·dense + γ·meta
  const alpha = hasMetadataFilter ? 0.4 : 1.0;
  const gamma = hasMetadataFilter ? 0.6 : 0.0;

  const finalScore = sql<number>`(${alpha} * (1 - (${cosineDistance(chunks.embedding, queryEmbedding)}))) + (${gamma} * ${metaScore})`;

  // Build WHERE conditions
  const conditions = [gt(denseSimilarity, threshold)];
  // We don't hard-filter by subject/level — instead the metadata boost
  // re-ranks results, allowing cross-topic discoveries while still
  // prioritizing curriculum-aligned content

  const results = await db
    .select({
      id: chunks.id,
      content: chunks.content,
      subject: chunks.subject,
      level: chunks.level,
      language: chunks.language,
      sourcePage: chunks.sourcePage,
      documentId: chunks.documentId,
      similarity: denseSimilarity,
      finalScore,
    })
    .from(chunks)
    .where(and(...conditions))
    .orderBy(desc(finalScore))
    .limit(limit);

  return results;
}
