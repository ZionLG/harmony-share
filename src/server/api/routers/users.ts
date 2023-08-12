import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  getUsersByName: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        resultNumber: z.number().min(1).max(10),
        playlistIdNoCollabs: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          name: { contains: input.username },
        },
        take: input.resultNumber,
        select: { id: true, name: true, image: true },
      });
      if (input.playlistIdNoCollabs) {
        const playlistId = input.playlistIdNoCollabs;
        const resultUsers = users.filter(async (user) => {
          const hasCollab = await ctx.prisma.collaborator.findUnique({
            where: {
              playlistId_userId: {
                playlistId,
                userId: user.id,
              },
            },
          });
          console.log(!hasCollab && user.id !== ctx.session.user.id);
          return !hasCollab && user.id !== ctx.session.user.id;
        });
        return resultUsers;
      }

      return users;
    }),
});
