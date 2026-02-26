import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { conversations, messages } from "@/server/db/schema";

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
});
