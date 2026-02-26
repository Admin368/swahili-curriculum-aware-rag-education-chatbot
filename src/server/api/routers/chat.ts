import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { generateObject } from "ai";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { conversations, messages } from "@/server/db/schema";
import { chatModel } from "@/server/ai";
import { findRelevantChunks } from "@/server/ai/embedding";

export const chatRouter = createTRPCRouter({
  /**
   * List the current user's conversations, ordered by most recently updated.
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        id: conversations.id,
        title: conversations.title,
        subject: conversations.subject,
        level: conversations.level,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(eq(conversations.userId, ctx.session.user.id))
      .orderBy(desc(conversations.updatedAt));

    return result;
  }),

  /**
   * Get a single conversation with all its messages.
   */
  getConversation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const conv = await ctx.db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, input.id),
          eq(conversations.userId, ctx.session.user.id),
        ),
        with: {
          messages: {
            orderBy: (m, { asc }) => [asc(m.createdAt)],
          },
        },
      });

      if (!conv) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found.",
        });
      }
      return conv;
    }),

  /**
   * Create a new conversation.
   */
  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().optional().default("New Chat"),
        subject: z.string().optional(),
        level: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [conv] = await ctx.db
        .insert(conversations)
        .values({
          userId: ctx.session.user.id,
          title: input.title,
          subject: input.subject ?? null,
          level: input.level ?? null,
        })
        .returning();
      return conv;
    }),

  /**
   * Add a message to a conversation.
   */
  addMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
        references: z
          .array(
            z.object({
              chunkId: z.string(),
              content: z.string(),
              subject: z.string().optional(),
              level: z.string().optional(),
              similarity: z.number().optional(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify conversation belongs to user
      const conv = await ctx.db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, input.conversationId),
          eq(conversations.userId, ctx.session.user.id),
        ),
      });

      if (!conv) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [msg] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          role: input.role,
          content: input.content,
          references: input.references ?? null,
        })
        .returning();

      // Touch conversation updatedAt
      await ctx.db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      return msg;
    }),

  /**
   * Rename a conversation.
   */
  renameConversation: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const conv = await ctx.db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, input.id),
          eq(conversations.userId, ctx.session.user.id),
        ),
      });
      if (!conv) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .update(conversations)
        .set({ title: input.title })
        .where(eq(conversations.id, input.id));

      return { success: true };
    }),

  /**
   * Delete a conversation and all its messages (cascade).
   */
  deleteConversation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const conv = await ctx.db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, input.id),
          eq(conversations.userId, ctx.session.user.id),
        ),
      });
      if (!conv) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.delete(conversations).where(eq(conversations.id, input.id));

      return { success: true };
    }),

  /**
   * Auto-generate a title from the first user message.
   */
  autoTitle: protectedProcedure
    .input(z.object({ id: z.string(), firstMessage: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Truncate to first 80 chars as title
      const title =
        input.firstMessage.length > 80
          ? input.firstMessage.slice(0, 77) + "..."
          : input.firstMessage;

      await ctx.db
        .update(conversations)
        .set({ title })
        .where(
          and(
            eq(conversations.id, input.id),
            eq(conversations.userId, ctx.session.user.id),
          ),
        );
      return { title };
    }),

  // ---------------------------------------------------------------------------
  // AI Generation: Flashcards
  // ---------------------------------------------------------------------------

  generateFlashcards: protectedProcedure
    .input(
      z.object({
        subject: z.string(),
        level: z.string(),
        topic: z.string().min(1),
        count: z.number().min(1).max(20).default(6),
      }),
    )
    .mutation(async ({ input }) => {
      // 1. Retrieve relevant curriculum chunks
      const relevantChunks = await findRelevantChunks(input.topic, {
        subject: input.subject,
        level: input.level,
        limit: 8,
      });

      const context = relevantChunks
        .map(
          (c, i) =>
            `[Source ${i + 1} — ${c.subject ?? "General"}, ${c.level ?? ""}]\n${c.content}`,
        )
        .join("\n\n");

      // 2. Generate flashcards with AI
      const { object } = await generateObject({
        model: chatModel,
        system: `You are a Tanzanian curriculum education expert (Elimu AI). Create high-quality flashcards for secondary school students.
Use ONLY the provided curriculum context to create flashcards. If the context is insufficient, create as many cards as possible from what is available.
Each flashcard should have a clear question on the front and a comprehensive answer on the back.
Write in the same language as the curriculum context (Swahili or English or mixed).
Include the source reference for each card when available.`,
        schema: z.object({
          cards: z
            .array(
              z.object({
                id: z.string(),
                front: z.string().describe("Question or prompt"),
                back: z
                  .string()
                  .describe("Comprehensive answer or explanation"),
                source: z
                  .string()
                  .describe("Source reference (subject, level, topic)"),
              }),
            )
            .describe("Array of flashcards"),
        }),
        prompt: `Create ${input.count} flashcards about "${input.topic}" for ${input.level} ${input.subject} students.

Curriculum context:
${context || "No specific curriculum content found. Create general educational flashcards about the topic."}`,
      });

      return object.cards;
    }),

  // ---------------------------------------------------------------------------
  // AI Generation: Quiz
  // ---------------------------------------------------------------------------

  generateQuiz: protectedProcedure
    .input(
      z.object({
        subject: z.string(),
        level: z.string(),
        topic: z.string().min(1),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        count: z.number().min(1).max(20).default(4),
      }),
    )
    .mutation(async ({ input }) => {
      // 1. Retrieve relevant curriculum chunks
      const relevantChunks = await findRelevantChunks(input.topic, {
        subject: input.subject,
        level: input.level,
        limit: 8,
      });

      const context = relevantChunks
        .map(
          (c, i) =>
            `[Source ${i + 1} — ${c.subject ?? "General"}, ${c.level ?? ""}]\n${c.content}`,
        )
        .join("\n\n");

      // 2. Generate quiz questions with AI
      const { object } = await generateObject({
        model: chatModel,
        system: `You are a Tanzanian curriculum education expert (Elimu AI). Create multiple-choice quiz questions for secondary school students.
Use ONLY the provided curriculum context. Each question must have exactly 4 options with one correct answer.
Difficulty level: ${input.difficulty} — adjust question complexity accordingly.
Easy: recall/definition questions. Medium: understanding/application. Hard: analysis/evaluation.
Write in the same language as the curriculum context (Swahili or English or mixed).
Provide a clear explanation for each correct answer and cite the source.`,
        schema: z.object({
          questions: z
            .array(
              z.object({
                id: z.string(),
                question: z.string(),
                options: z
                  .array(z.string())
                  .length(4)
                  .describe("Exactly 4 answer options"),
                correctIndex: z
                  .number()
                  .min(0)
                  .max(3)
                  .describe("Index of the correct option (0-3)"),
                explanation: z
                  .string()
                  .describe("Explanation of why the correct answer is right"),
                source: z
                  .string()
                  .describe("Source reference (subject, level, topic)"),
              }),
            )
            .describe("Array of quiz questions"),
        }),
        prompt: `Create ${input.count} ${input.difficulty}-difficulty multiple-choice questions about "${input.topic}" for ${input.level} ${input.subject} students.

Curriculum context:
${context || "No specific curriculum content found. Create general educational questions about the topic."}`,
      });

      return object.questions;
    }),

  // ---------------------------------------------------------------------------
  // AI Generation: Summarizer
  // ---------------------------------------------------------------------------

  generateSummary: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1),
        style: z.enum(["structured", "paragraph"]).default("structured"),
        focusArea: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const focusInstruction = input.focusArea
        ? `\nFocus area: ${input.focusArea}`
        : "";

      if (input.style === "structured") {
        const { object } = await generateObject({
          model: chatModel,
          system: `You are a Tanzanian curriculum education assistant (Elimu AI). Summarize the provided text into a structured format with clear headings and concise content.
Keep the summary educational and clear for secondary school students.
Write in the same language as the input text (Swahili, English, or mixed).${focusInstruction}`,
          schema: z.object({
            title: z.string().describe("A concise title for the summary"),
            sections: z
              .array(
                z.object({
                  heading: z.string().describe("Section heading"),
                  content: z
                    .string()
                    .describe("Section content — concise but complete"),
                }),
              )
              .describe("Structured summary sections"),
          }),
          prompt: `Summarize the following text in a structured format with headings:\n\n${input.text}`,
        });

        return { style: "structured" as const, ...object };
      } else {
        const { object } = await generateObject({
          model: chatModel,
          system: `You are a Tanzanian curriculum education assistant (Elimu AI). Summarize the provided text into a clear, concise paragraph.
Keep the summary educational and clear for secondary school students.
Write in the same language as the input text (Swahili, English, or mixed).${focusInstruction}`,
          schema: z.object({
            title: z.string().describe("A concise title for the summary"),
            summary: z
              .string()
              .describe("A comprehensive paragraph summary of the text"),
          }),
          prompt: `Summarize the following text into a clear paragraph:\n\n${input.text}`,
        });

        return { style: "paragraph" as const, ...object };
      }
    }),
});
