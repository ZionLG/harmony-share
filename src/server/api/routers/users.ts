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
      if (!!input.playlistIdNoCollabs) {
        const playlistId = input.playlistIdNoCollabs;
        const resultUsers = await Promise.all(
          users.map(async (user) => {
            const hasCollab = await ctx.prisma.collaborator.findUnique({
              where: {
                playlistId_userId: {
                  playlistId,
                  userId: user.id,
                },
              },
            });

            const shouldInclude = !hasCollab && user.id !== ctx.session.user.id;
            return shouldInclude ? user : null;
          })
        );

        // Filter out the null values (users that should not be included)
        return resultUsers.filter((user) => user !== null) as {
          name: string | null;
          id: string;
          image: string | null;
        }[];
      }

      return users;
    }),
});
