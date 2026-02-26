import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";

export const authRouter = createTRPCRouter({
  /**
   * Register a new user with email and hashed password.
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .regex(/\d/, "Password must contain at least one number"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check for existing user
      const existing = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists.",
        });
      }

      const passwordHash = await hash(input.password, 12);

      await ctx.db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
      });

      return { success: true };
    }),
});
