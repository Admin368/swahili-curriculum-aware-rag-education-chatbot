import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { del } from "@vercel/blob";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { documents, chunks, users } from "@/server/db/schema";
import { generateEmbeddings } from "@/server/ai/embedding";
import { splitTextIntoChunks } from "@/lib/chunker";
import "pdf-parse/worker"; // Import this before importing "pdf-parse"
import { PDFParse } from "pdf-parse";

// ---------------------------------------------------------------------------
// Admin guard middleware
// ---------------------------------------------------------------------------

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await ctx.db.query.users.findFirst({
    where: eq(users.id, ctx.session.user.id),
  });
  if (!user?.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required.",
    });
  }
  return next({ ctx: { ...ctx, user } });
});

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const documentRouter = createTRPCRouter({
  /**
   * List all documents with optional search/filter.
   */
  list: adminProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          status: z
            .enum(["pending", "processing", "ready", "error"])
            .optional(),
          subject: z.string().optional(),
          level: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input?.status) {
        conditions.push(eq(documents.status, input.status));
      }
      if (input?.subject) {
        conditions.push(eq(documents.subject, input.subject));
      }
      if (input?.level) {
        conditions.push(eq(documents.level, input.level));
      }
      if (input?.search) {
        conditions.push(
          sql`(${documents.title} ILIKE ${"%" + input.search + "%"} OR ${documents.filename} ILIKE ${"%" + input.search + "%"})`,
        );
      }

      const result = await ctx.db
        .select()
        .from(documents)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(documents.createdAt));

      return result;
    }),

  /**
   * Get a single document by ID.
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.db.query.documents.findFirst({
        where: eq(documents.id, input.id),
      });
      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found.",
        });
      }
      return doc;
    }),

  /**
   * Create a document record after blob upload.
   */
  create: adminProcedure
    .input(
      z.object({
        blobUrl: z.string().url(),
        filename: z.string(),
        title: z.string(),
        subject: z.string().optional(),
        level: z.string().optional(),
        language: z.string().default("sw"),
        mimeType: z.string().default("application/pdf"),
        fileSize: z.number().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [doc] = await ctx.db
        .insert(documents)
        .values({
          ...input,
          uploadedById: ctx.session.user.id,
          status: "pending",
        })
        .returning();
      return doc;
    }),

  /**
   * Process a document: extract text → chunk → embed → store vectors.
   * Called after document record is created.
   */
  processDocument: adminProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.db.query.documents.findFirst({
        where: eq(documents.id, input.documentId),
      });
      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Mark as processing
      await ctx.db
        .update(documents)
        .set({ status: "processing" })
        .where(eq(documents.id, doc.id));

      try {
        // 1. Fetch file from Blob storage
        let fullText = "";
        if (doc.blobUrl) {
          const response = await fetch(doc.blobUrl);
          const buffer = Buffer.from(await response.arrayBuffer());

          if (
            doc.mimeType === "application/pdf" ||
            doc.filename.endsWith(".pdf")
          ) {
            const pdfDoc = new PDFParse({ data: buffer });
            const result = await pdfDoc.getText();
            fullText = result.text;
          } else {
            // Plain text / other
            fullText = buffer.toString("utf-8");
          }
        }

        if (!fullText.trim()) {
          throw new Error("No text could be extracted from the document.");
        }

        // 2. Split into chunks
        const textChunks = splitTextIntoChunks(fullText, {
          chunkSize: 500,
          chunkOverlap: 50,
        });

        // 3. Generate embeddings in batches of 50
        const BATCH_SIZE = 50;
        const allChunkRecords: Array<{
          documentId: string;
          chunkIndex: number;
          content: string;
          contentLength: number;
          embedding: number[];
          subject: string | null;
          level: string | null;
          language: string | null;
        }> = [];

        for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
          const batch = textChunks.slice(i, i + BATCH_SIZE);
          const embeddings = await generateEmbeddings(batch);

          for (let j = 0; j < batch.length; j++) {
            allChunkRecords.push({
              documentId: doc.id,
              chunkIndex: i + j,
              content: batch[j]!,
              contentLength: batch[j]!.length,
              embedding: embeddings[j]!,
              subject: doc.subject ?? null,
              level: doc.level ?? null,
              language: doc.language ?? null,
            });
          }

          // Small delay to respect rate limits
          if (i + BATCH_SIZE < textChunks.length) {
            await new Promise((r) => setTimeout(r, 500));
          }
        }

        // 4. Insert chunks in batches
        const INSERT_BATCH = 100;
        for (let i = 0; i < allChunkRecords.length; i += INSERT_BATCH) {
          const insertBatch = allChunkRecords.slice(i, i + INSERT_BATCH);
          await ctx.db.insert(chunks).values(insertBatch);
        }

        // 5. Update document status
        await ctx.db
          .update(documents)
          .set({
            status: "ready",
            chunkCount: allChunkRecords.length,
          })
          .where(eq(documents.id, doc.id));

        return {
          success: true,
          chunkCount: allChunkRecords.length,
        };
      } catch (error) {
        await ctx.db
          .update(documents)
          .set({ status: "error" })
          .where(eq(documents.id, doc.id));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to process document.",
        });
      }
    }),

  /**
   * Delete a document, its chunks, and the blob file.
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.db.query.documents.findFirst({
        where: eq(documents.id, input.id),
      });
      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Delete blob file if exists
      if (doc.blobUrl) {
        try {
          await del(doc.blobUrl);
        } catch {
          // Ignore blob deletion errors
        }
      }

      // Cascading delete removes chunks too
      await ctx.db.delete(documents).where(eq(documents.id, input.id));

      return { success: true };
    }),

  /**
   * Aggregate stats for the documents dashboard.
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const allDocs = await ctx.db.select().from(documents);
    const totalChunks = await ctx.db.select({ value: count() }).from(chunks);

    return {
      total: allDocs.length,
      indexed: allDocs.filter((d) => d.status === "ready").length,
      processing: allDocs.filter((d) => d.status === "processing").length,
      errors: allDocs.filter((d) => d.status === "error").length,
      totalChunks: totalChunks[0]?.value ?? 0,
    };
  }),
});
