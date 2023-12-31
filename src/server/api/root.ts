import { createTRPCRouter } from "~/server/api/trpc";
import { playlistRouter } from "~/server/api/routers/playlist";
import { spotifyRouter } from "~/server/api/routers/spotify";
import { usersRouter } from "~/server/api/routers/users";
import { notificationsRouter } from "~/server/api/routers/notifications";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  notifications: notificationsRouter,
  users: usersRouter,
  playlist: playlistRouter,
  spotify: spotifyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
