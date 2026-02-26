import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";

export const userRouter = createTRPCRouter({
  /**
   * Get the current user's profile.
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isAdmin: user.isAdmin,
    };
  }),

  /**
   * Update profile (name, email).
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set(input)
        .where(eq(users.id, ctx.session.user.id));
      return { success: true };
    }),

  /**
   * Quick check if the current user is an admin.
   */
  checkIsAdmin: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: { isAdmin: true },
    });
    return user?.isAdmin ?? false;
  }),
});
