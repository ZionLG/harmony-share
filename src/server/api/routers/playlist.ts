import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  playlistReadProcedure,
  spotifyProcedure,
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
  getMe: spotifyProcedure.query(async ({ ctx }) => {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
    console.log("user token get me", ctx.token);
    console.log(await result.json());
    return result;
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
