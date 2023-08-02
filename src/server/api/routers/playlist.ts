import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const playlistRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(30),
        description: z.string().max(100).optional(),
        privacy: z.enum(["private", "public", "invite"]),
      })
    )
    .mutation(async ({ input: { name, description, privacy }, ctx }) => {
      const userId = ctx.session.user.id;
      const newPlaylist = await ctx.prisma.playlist.create({
        data: { name, description, privacy, trackIds: [], ownerId: userId },
      });
      return newPlaylist;
    }),

  getOwned: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.playlist.findMany({
      where: { ownerId: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        privacy: true,
        createdAt: true,
        updatedAt: true,
        collaborators: {
          select: {
            user: {
              select: {
                image: true,
              },
            },
          },
        },
      },
    });
  }),

  getCollaborated: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.playlist.findMany({});
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const deletedPlaylist = await ctx.prisma.playlist.delete({
        where: { id },
      });

      return deletedPlaylist;
    }),
});
