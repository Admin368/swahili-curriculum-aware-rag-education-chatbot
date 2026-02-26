/**
 * Seed script — loads pre-chunked curriculum data from semantic_chunks.json,
 * generates embeddings via OpenAI text-embedding-3-small, and inserts into
 * the `chunks` + `documents` tables.
 *
 * Usage:
 *   pnpm db:seed
 *   (or: npx tsx src/scripts/seed-chunks.ts)
 */
import "dotenv/config";

import { readFileSync } from "fs";
import { resolve } from "path";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { documents, chunks } from "@/server/db/schema";
import { generateEmbeddings } from "@/server/ai/embedding";

interface SemanticChunk {
  chunk_id: string;
  source: string;
  filename: string;
  content_length: number;
  text: string;
  metadata: {
    subject: string;
    level: string;
    language: string;
    source_page: string;
  };
}

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1500; // rate-limit protection

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function inferLevelFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("f1") || lower.includes("_f1")) return "Form 1";
  if (lower.includes("f2") || lower.includes("_f2")) return "Form 2";
  if (lower.includes("f3") || lower.includes("_f3")) return "Form 3";
  if (lower.includes("f4") || lower.includes("_f4")) return "Form 4";
  return "Form 1";
}

async function main() {
  console.log("🌱 Starting seed script...");

  // Load chunks JSON
  const dataPath = resolve(
    process.cwd(),
    "..",
    "Data",
    "semantic_chunks (1).json",
  );
  console.log(`📂 Loading data from: ${dataPath}`);

  const raw = readFileSync(dataPath, "utf-8");
  const allChunks: SemanticChunk[] = JSON.parse(raw);
  console.log(`📊 Loaded ${allChunks.length} chunks`);

  // Group chunks by source filename
  const byFile = new Map<string, SemanticChunk[]>();
  for (const chunk of allChunks) {
    const key = chunk.filename;
    if (!byFile.has(key)) byFile.set(key, []);
    byFile.get(key)!.push(chunk);
  }
  console.log(`📁 Found ${byFile.size} source files`);

  // Process each file
  for (const [filename, fileChunks] of byFile) {
    console.log(`\n📄 Processing: ${filename} (${fileChunks.length} chunks)`);

    const firstChunk = fileChunks[0]!;
    const subject = firstChunk.metadata.subject || "History";
    const level = firstChunk.metadata.level || inferLevelFromFilename(filename);
    const language = firstChunk.metadata.language || "sw";

    // Check if document already exists
    const existing = await db
      .select()
      .from(documents)
      .where(eq(documents.filename, filename))
      .limit(1);

    let docId: string;

    if (existing.length > 0) {
      docId = existing[0]!.id;
      console.log(
        `  ⏭️  Document already exists (id: ${docId}), skipping insert`,
      );

      // Check if chunks already exist for this document
      const existingChunks = await db
        .select({ id: chunks.id })
        .from(chunks)
        .where(eq(chunks.documentId, docId))
        .limit(1);

      if (existingChunks.length > 0) {
        console.log(`  ⏭️  Chunks already seeded, skipping`);
        continue;
      }
    } else {
      // Create document record
      const [doc] = await db
        .insert(documents)
        .values({
          title: filename.replace(/\.[^.]+$/, ""),
          filename,
          blobUrl: firstChunk.source,
          fileSize: 0,
          mimeType: "application/pdf",
          subject,
          level,
          language,
          status: "processing",
          uploadedById: null, // seeded, not uploaded by a user
        })
        .returning({ id: documents.id });

      docId = doc!.id;
      console.log(`  ✅ Created document (id: ${docId})`);
    }

    // Embed and insert chunks in batches
    let totalInserted = 0;

    for (let i = 0; i < fileChunks.length; i += BATCH_SIZE) {
      const batch = fileChunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((c) => c.text);

      try {
        const embeddings = await generateEmbeddings(texts);

        const values = batch.map((chunk, idx) => ({
          documentId: docId,
          chunkIndex: i + idx,
          content: chunk.text,
          contentLength: chunk.content_length || chunk.text.length,
          embedding: embeddings[idx]!,
          subject: chunk.metadata.subject || subject,
          level: chunk.metadata.level || level,
          language: chunk.metadata.language || language,
          sourcePage: chunk.metadata.source_page || null,
        }));

        await db.insert(chunks).values(values);
        totalInserted += batch.length;

        console.log(
          `  📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}: embedded & inserted ${batch.length} chunks (${totalInserted}/${fileChunks.length})`,
        );
      } catch (error) {
        console.error(
          `  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`,
          error,
        );
        // Continue with next batch
      }

      // Rate-limit delay between batches
      if (i + BATCH_SIZE < fileChunks.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    // Update document status
    await db
      .update(documents)
      .set({
        status: "ready",
        chunkCount: totalInserted,
      })
      .where(eq(documents.id, docId));

    console.log(`  ✅ ${filename}: ${totalInserted} chunks indexed`);
  }

  console.log("\n🎉 Seed complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
