import { createTRPCRouter } from "~/server/api/trpc";
import { playlistRouter } from "~/server/api/routers/playlist";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  playlist: playlistRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
