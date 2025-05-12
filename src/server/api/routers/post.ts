import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.file.create({
        data: {
          name: input.name,
          url: "default-url", // Replace with actual URL logic
          size: 0, // Replace with actual size logic
          extension: "txt", // Replace with actual extension logic
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.file.findFirst({
      orderBy: { uploadDate: "desc" }, // Replace 'createdAt' with the correct field name from your schema
      where: { uploadedById: ctx.session.user.id },
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
