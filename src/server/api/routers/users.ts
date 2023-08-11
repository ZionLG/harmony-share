import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  getUsersByName: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        resultNumber: z.number().min(1).max(10),
        exception: z.string().array().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          name: { contains: input.username },
          id: { notIn: input.exception },
        },
        take: input.resultNumber,
        select: { id: true, name: true, image: true },
      });
    }),
});
