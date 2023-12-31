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
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).max(30),
        description: z.string().max(100).optional(),
        writePrivacy: z.enum(["private", "public", "invite"]),
        readPrivacy: z.enum(["private", "public", "invite"]),
      })
    )
    .mutation(
      async ({
        input: { id, name, description, readPrivacy, writePrivacy },
        ctx,
      }) => {
        const userId = ctx.session.user.id;
        const playlist = await ctx.prisma.playlist.findUnique({
          where: { id },
        });
        if (playlist === null) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Playlist not found.",
          });
        }

        if (playlist.ownerId !== userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You do not own this playlist.",
          });
        }

        if (
          playlist.name === name &&
          playlist.description === description &&
          playlist.readPrivacy === readPrivacy &&
          playlist.writePrivacy === writePrivacy
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No changes made.",
          });
        }

        const newPlaylist = await ctx.prisma.playlist.update({
          where: { id: id },
          data: {
            name,
            description,
            readPrivacy,
            writePrivacy,
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
    return ctx.prisma.playlist.findMany({
      where: {
        collaborators: {
          some: { userId: ctx.session.user.id },
        },
      },
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
  changeTrackPosition: playlistEditProcedure
    .input(z.object({ trackId: z.string(), newPosition: z.number() }))
    .mutation(async ({ input: { trackId, newPosition }, ctx }) => {
      if (newPosition < 1 || newPosition > ctx.playlist._count.tracks) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "track position must be between 1 to length of playlist",
        });
      }
      const track = await ctx.prisma.track.findUnique({
        where: {
          id: trackId,
        },
      });

      if (track === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "track doesn't exist.",
        });
      }

      const trackCurrentPosition = track.position;

      if (trackCurrentPosition < newPosition) {
        const [affectedTracks, mainTrack] = await ctx.prisma.$transaction([
          ctx.prisma.track.updateMany({
            where: {
              playlistId: ctx.playlist.id,
              position: { gt: trackCurrentPosition, lte: newPosition },
            },
            data: {
              position: { decrement: 1 },
            },
          }),
          ctx.prisma.track.update({
            where: {
              id: trackId,
            },
            data: {
              position: newPosition,
            },
          }),
        ]);
        return { affectedTracks, mainTrack };
      } else if (trackCurrentPosition > newPosition) {
        const [affectedTracks, mainTrack] = await ctx.prisma.$transaction([
          ctx.prisma.track.updateMany({
            where: {
              playlistId: ctx.playlist.id,
              position: { gte: newPosition, lt: trackCurrentPosition },
            },
            data: {
              position: { increment: 1 },
            },
          }),
          ctx.prisma.track.update({
            where: {
              id: trackId,
            },
            data: {
              position: newPosition,
            },
          }),
        ]);
        return { affectedTracks, mainTrack };
      }
    }),
  addTrack: playlistEditProcedure
    .input(z.object({ trackId: z.string(), position: z.number().optional() }))
    .mutation(async ({ input: { trackId, position }, ctx }) => {
      const playlistTracks = await ctx.prisma.playlist.findUnique({
        where: {
          id: ctx.playlist.id,
          AND: { tracks: { some: { spotifyId: trackId } } },
        },
      });
      if (playlistTracks === null) {
        const playlist = await ctx.prisma.playlist.findUnique({
          where: { id: ctx.playlist.id },
          include: {
            _count: {
              select: {
                tracks: true,
              },
            },
          },
        });
        if (playlist === null) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Playlist not found.",
          });
        }
        if (position) {
          const [updatePositions, insertedTrack] =
            await ctx.prisma.$transaction([
              ctx.prisma.track.updateMany({
                where: {
                  playlistId: ctx.playlist.id,
                  position: { gte: position },
                },
                data: {
                  position: { increment: 1 },
                },
              }),
              ctx.prisma.playlist.update({
                where: {
                  id: ctx.playlist.id,
                },
                data: {
                  tracks: {
                    create: {
                      spotifyId: trackId,
                      position: position,
                    },
                  },
                },
              }),
            ]);

          return { updatePositions, insertedTrack };
        }

        const addTrack = await ctx.prisma.playlist.update({
          where: {
            id: ctx.playlist.id,
          },
          data: {
            tracks: {
              create: {
                spotifyId: trackId,
                position: playlist._count.tracks + 1,
              },
            },
          },
        });
        return addTrack;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Song already exists in playlist.",
      });
    }),
  deleteSong: playlistEditProcedure
    .input(z.object({ trackId: z.string() }))
    .mutation(async ({ input: { trackId }, ctx }) => {
      const track = await ctx.prisma.track.findUnique({
        where: {
          id: trackId,
        },
      });

      if (track === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "track doesn't exist.",
        });
      }

      const trackCurrentPosition = track.position;
      const [affectedTracks, deletedTrack] = await ctx.prisma.$transaction([
        ctx.prisma.track.updateMany({
          where: {
            playlistId: ctx.playlist.id,
            position: { gt: trackCurrentPosition },
          },
          data: {
            position: { decrement: 1 },
          },
        }),
        ctx.prisma.track.delete({
          where: {
            id: trackId,
          },
        }),
      ]);
      return { affectedTracks, deletedTrack };
    }),
  toggleLikePlaylist: playlistReadProcedure.mutation(async ({ ctx }) => {
    const data = {
      playlistId: ctx.playlist.id,
      userId: ctx.session.user.id,
    };
    const getLike = await ctx.prisma.likePlaylist.findUnique({
      where: {
        userId_playlistId: data,
      },
    });

    if (getLike == null) {
      await ctx.prisma.likePlaylist.create({
        data: data,
      });
      return { addedLike: true };
    } else {
      await ctx.prisma.likePlaylist.delete({
        where: {
          userId_playlistId: data,
        },
      });
      return { addedLike: false };
    }
  }),
  deleteCollaborator: protectedProcedure
    .input(z.object({ collaborationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const playlistOwnerId = await ctx.prisma.collaborator.findUnique({
        where: { id: input.collaborationId },
        select: { playlist: true },
      });
      if (playlistOwnerId?.playlist.ownerId === ctx.session.user.id) {
        const removedCollab = await ctx.prisma.collaborator.delete({
          where: { id: input.collaborationId },
          include: {
            InviteNotification: true,
          },
        });
        if (removedCollab.InviteNotification) {
          await ctx.prisma.notification.delete({
            where: { notificationTypeId: removedCollab.InviteNotification.id },
          });
        }

        return removedCollab;
      }

      if (playlistOwnerId?.playlist.ownerId !== ctx.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this collaborator.",
        });

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The server cannot find the requested resource.",
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
