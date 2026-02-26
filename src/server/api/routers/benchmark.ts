import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { benchmarks, conversations } from "@/server/db/schema";

export const benchmarkRouter = createTRPCRouter({
  /**
   * Create a new benchmark session with two conversations.
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().optional().default("New Benchmark"),
        modelLeft: z.string(),
        modelRight: z.string(),
        subject: z.string().optional(),
        level: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create two conversations of type "benchmark"
      const [convLeft] = await ctx.db
        .insert(conversations)
        .values({
          userId: ctx.session.user.id,
          title: `[Benchmark] ${input.modelLeft}`,
          subject: input.subject ?? null,
          level: input.level ?? null,
          type: "benchmark",
        })
        .returning();

      const [convRight] = await ctx.db
        .insert(conversations)
        .values({
          userId: ctx.session.user.id,
          title: `[Benchmark] ${input.modelRight}`,
          subject: input.subject ?? null,
          level: input.level ?? null,
          type: "benchmark",
        })
        .returning();

      // Create the benchmark record
      const [bench] = await ctx.db
        .insert(benchmarks)
        .values({
          userId: ctx.session.user.id,
          title: input.title,
          modelLeft: input.modelLeft,
          modelRight: input.modelRight,
          conversationLeftId: convLeft!.id,
          conversationRightId: convRight!.id,
          subject: input.subject ?? null,
          level: input.level ?? null,
        })
        .returning();

      return bench;
    }),

  /**
   * List all non-deleted benchmarks for the current user.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        id: benchmarks.id,
        title: benchmarks.title,
        modelLeft: benchmarks.modelLeft,
        modelRight: benchmarks.modelRight,
        conversationLeftId: benchmarks.conversationLeftId,
        conversationRightId: benchmarks.conversationRightId,
        subject: benchmarks.subject,
        level: benchmarks.level,
        createdAt: benchmarks.createdAt,
        updatedAt: benchmarks.updatedAt,
      })
      .from(benchmarks)
      .where(
        and(
          eq(benchmarks.userId, ctx.session.user.id),
          eq(benchmarks.isDeleted, false),
        ),
      )
      .orderBy(desc(benchmarks.updatedAt));

    return result;
  }),

  /**
   * Get the latest benchmark for the current user.
   */
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const [bench] = await ctx.db
      .select()
      .from(benchmarks)
      .where(
        and(
          eq(benchmarks.userId, ctx.session.user.id),
          eq(benchmarks.isDeleted, false),
        ),
      )
      .orderBy(desc(benchmarks.updatedAt))
      .limit(1);

    return bench ?? null;
  }),

  /**
   * Get a specific benchmark by ID.
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bench = await ctx.db.query.benchmarks.findFirst({
        where: and(
          eq(benchmarks.id, input.id),
          eq(benchmarks.userId, ctx.session.user.id),
          eq(benchmarks.isDeleted, false),
        ),
      });

      if (!bench) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Benchmark not found.",
        });
      }

      return bench;
    }),

  /**
   * Soft-delete a benchmark.
   */
  softDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const bench = await ctx.db.query.benchmarks.findFirst({
        where: and(
          eq(benchmarks.id, input.id),
          eq(benchmarks.userId, ctx.session.user.id),
        ),
      });

      if (!bench) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .update(benchmarks)
        .set({ isDeleted: true })
        .where(eq(benchmarks.id, input.id));

      return { success: true };
    }),
});
