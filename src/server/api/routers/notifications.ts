import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const notificationsRouter = createTRPCRouter({
  changeInviteStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(["accepted", "declined"]),
        collabId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const collab = await ctx.prisma.collaborator.findUnique({
        where: { id: input.collabId },
      });

      if (collab === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collaberation not found.",
        });
      }

      if (collab.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User can only chanage his own collaberation status.",
        });
      }

      if (collab.status !== "pending") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User can only chanage pending collab.",
        });
      }
      const collabUpdated = await ctx.prisma.collaborator.update({
        where: { id: input.collabId },
        data: { status: input.status },
      });

      return collabUpdated;
    }),
  getUserNotifications: protectedProcedure.query(async ({ ctx }) => {
    const notificationResults = [];
    const notifications = await ctx.prisma.notification.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        id: true,
        type: true,
        createdAt: true,
        notificationTypeId: true,
      },
    });

    for (const notification of notifications) {
      if (notification.type === "invite") {
        const inviteNotification =
          await ctx.prisma.inviteNotification.findUnique({
            where: { id: notification.notificationTypeId },
            select: {
              id: true,
              collab: {
                select: {
                  id: true,
                  status: true,
                  playlist: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                      readPrivacy: true,
                      writePrivacy: true,
                      owner: {
                        select: {
                          name: true,
                          id: true,
                          image: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

        notificationResults.push({
          ...notification,
          inviteNotification,
        });
      }
    }

    return notificationResults;
  }),
  inviteToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        invitedId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.prisma.playlist.findUnique({
        where: { id: input.playlistId },
        include: { collaborators: true },
      });

      if (playlist === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found.",
        });
      }

      if (playlist.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not own this playlist.",
        });
      }

      if (playlist.ownerId === input.invitedId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot be a collaborator of your own playlist.",
        });
      }

      const alreadyInvited = playlist.collaborators.find((collaborator) => {
        return collaborator.userId === input.invitedId;
      });

      if (alreadyInvited && alreadyInvited.status !== "declined") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already invited to playlist.",
        });
      } else if (alreadyInvited && alreadyInvited?.status === "declined") {
        return await ctx.prisma.collaborator.update({
          where: { id: alreadyInvited.id },
          data: {
            status: "pending",
          },
        });
      }

      const collab = await ctx.prisma.collaborator.create({
        data: {
          playlistId: input.playlistId,
          userId: input.invitedId,
        },
      });

      const inviteNotification = await ctx.prisma.inviteNotification.create({
        data: {
          collabId: collab.id,
        },
      });

      const notification = await ctx.prisma.notification.create({
        data: {
          type: "invite",
          userId: input.invitedId,
          notificationTypeId: inviteNotification.id,
        },
      });

      return notification;
    }),
});
