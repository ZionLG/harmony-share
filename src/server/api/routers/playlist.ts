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

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
