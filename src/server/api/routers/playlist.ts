import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  playlistReadProcedure,
  playlistEditProcedure,
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
        image: true,
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

  addTrack: playlistEditProcedure
    .input(z.object({ trackId: z.string() }))
    .mutation(async ({ input: { trackId }, ctx }) => {
      const playlistTracks = await ctx.prisma.playlist.findUnique({
        where: {
          id: ctx.playlist.id,
          AND: { tracks: { some: { spotifyId: trackId } } },
        },
      });
      if (playlistTracks === null) {
        const addTrack = await ctx.prisma.playlist.update({
          where: {
            id: ctx.playlist.id,
          },
          data: {
            tracks: { create: { spotifyId: trackId } },
          },
        });
        return addTrack;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Song already exists in playlist.",
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const playlistOwnerId = await ctx.prisma.playlist.findUnique({
        where: { id },
        select: { ownerId: true },
      });
      if (playlistOwnerId?.ownerId === ctx.session.user.id) {
        const deletedPlaylist = await ctx.prisma.playlist.delete({
          where: { id },
        });

        return deletedPlaylist;
      }

      if (playlistOwnerId?.ownerId !== ctx.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this playlist.",
        });

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The server cannot find the requested resource.",
      });
    }),
  getPlaylist: playlistReadProcedure.query(({ ctx }) => {
    return {
      playlist: ctx.playlist,
      isCollaborator: ctx.isCollaborator,
    };
  }),

  getPublicPlaylists: publicProcedure.query(async ({ ctx }) => {
    const playlists = await ctx.prisma.playlist.findMany({
      where: { readPrivacy: "public" },
      select: {
        id: true,
        name: true,
        image: true,
        description: true,
        updatedAt: true,
        writePrivacy: true,
        owner: {
          select: {
            image: true,
            name: true,
          },
        },
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
    return playlists;
  }),
});
