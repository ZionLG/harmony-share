import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  playlistReadProcedure,
} from "~/server/api/trpc";

export const playlistRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(30),
        description: z.string().max(100).optional(),
        writePrivacy: z.enum(["private", "public", "invite"]),
        readPrivacy: z.enum(["private", "public", "invite"]),
      })
    )
    .mutation(
      async ({
        input: { name, description, readPrivacy, writePrivacy },
        ctx,
      }) => {
        const userId = ctx.session.user.id;
        const newPlaylist = await ctx.prisma.playlist.create({
          data: {
            name,
            description,
            readPrivacy,
            writePrivacy,
            trackIds: [],
            ownerId: userId,
          },
        });
        return newPlaylist;
      }
    ),

  getOwned: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.playlist.findMany({
      where: { ownerId: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        readPrivacy: true,
        writePrivacy: true,
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
  getPlaylist: playlistReadProcedure.query(({ ctx }) => {
    return {
      playlist: ctx.playlist,
      isCollaborator: ctx.isCollaborator,
    };
  }),
});
