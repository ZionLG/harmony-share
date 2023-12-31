/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import {
  type AccessToken,
  SpotifyApi,
  type Market,
} from "@spotify/web-api-ts-sdk";
import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import superjson from "superjson";
import { z, ZodError } from "zod";
import { env } from "~/env.mjs";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  session: Session | null;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const addTokenToContext = enforceUserIsAuthed.unstable_pipe(
  async ({ ctx, next }) => {
    const token = await ctx.prisma.account.findFirst({
      where: { userId: ctx.session.user.id },
      select: {
        access_token: true,
        expires_at: true,
        refresh_token: true,
        token_type: true,
      },
    });
    if (token == null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "The server cannot find the user token, please try to sign in again.",
      });
    }
    const tokenSet = {
      access_token: token.access_token,
      expires_in: token.expires_at,
      refresh_token: token.refresh_token,
      token_type: token.token_type,
    } as AccessToken;
    const sdk = SpotifyApi.withAccessToken(env.SPOTIFY_CLIENT_ID, tokenSet);
    const profile = await sdk.currentUser.profile();
    return next({
      ctx: {
        session: {
          ...ctx.session,
          user: {
            ...ctx.session.user,
            spotifyMarket: profile.country as Market,
          },
        },
        spotifySdk: sdk,
      },
    });
  }
);
export const spotifyProcedure = t.procedure.use(addTokenToContext);
export const playlistSpotifyReadProcedure = spotifyProcedure
  .input(z.object({ playlistId: z.string() }))
  .use(async ({ ctx, next, input }) => {
    const currentUserId = ctx.session?.user?.id;
    const playlistReq = ctx.prisma.playlist.findUnique({
      where: { id: input.playlistId },
      include: {
        tracks: true,
        collaborators: {
          select: {
            id: true,
            joinedAt: true,
            user: { select: { image: true, name: true, id: true } },
            status: true,
          },
        },
        _count: { select: { likes: true } },
        likes:
          currentUserId == null ? false : { where: { userId: currentUserId } },
        owner: {
          select: { image: true, name: true, id: true },
        },
      },
    });
    const playlist = await playlistReq;
    if (playlist == null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The server cannot find the requested resource.",
      });
    }
    const isCollaborator = playlist.collaborators.some((collaborator) => {
      return (
        collaborator.user.id === ctx.session?.user?.id &&
        collaborator.status === "accepted"
      );
    });

    if (
      playlist.readPrivacy === "public" ||
      playlist.ownerId === ctx.session?.user?.id ||
      (playlist.readPrivacy === "invite" && isCollaborator)
    ) {
      return next({ ctx: { playlist, playlistReq, isCollaborator } });
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to access this resource.",
    });
  });

export const playlistReadProcedure = protectedProcedure
  .input(z.object({ playlistId: z.string() }))
  .use(async ({ ctx, next, input }) => {
    const currentUserId = ctx.session?.user?.id;
    const playlistReq = ctx.prisma.playlist.findUnique({
      where: { id: input.playlistId },
      include: {
        tracks: { orderBy: { position: "asc" } },
        collaborators: {
          select: {
            id: true,
            joinedAt: true,
            user: { select: { image: true, name: true, id: true } },
            status: true,
          },
        },
        _count: { select: { likes: true } },
        likes:
          currentUserId == null ? false : { where: { userId: currentUserId } },
        owner: {
          select: { image: true, name: true, id: true },
        },
      },
    });
    const playlist = await playlistReq;
    if (playlist == null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The server cannot find the requested resource.",
      });
    }
    const isCollaborator = playlist.collaborators.some((collaborator) => {
      return (
        collaborator.user.id === ctx.session?.user?.id &&
        collaborator.status === "accepted"
      );
    });

    if (
      playlist.readPrivacy === "public" ||
      playlist.ownerId === ctx.session?.user?.id ||
      (playlist.readPrivacy === "invite" && isCollaborator)
    ) {
      return next({ ctx: { playlist, playlistReq, isCollaborator } });
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to access this resource.",
    });
  });

export const playlistEditProcedure = protectedProcedure
  .input(z.object({ playlistId: z.string() }))
  .use(async ({ ctx, next, input }) => {
    const playlistReq = ctx.prisma.playlist.findUnique({
      where: { id: input.playlistId },
      include: {
        _count: {
          select: {
            tracks: true,
          },
        },
        collaborators: {
          select: {
            id: true,
            joinedAt: true,
            user: { select: { image: true, name: true, id: true } },
            status: true,
          },
        },
        owner: {
          select: { image: true, name: true, id: true },
        },
      },
    });
    const playlist = await playlistReq;
    if (playlist == null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The server cannot find the requested resource.",
      });
    }
    const isCollaborator = playlist.collaborators.some((collaborator) => {
      return (
        collaborator.user.id === ctx.session?.user?.id &&
        collaborator.status === "accepted"
      );
    });

    if (
      playlist.writePrivacy === "public" ||
      playlist.ownerId === ctx.session?.user?.id ||
      (playlist.writePrivacy === "invite" && isCollaborator)
    ) {
      return next({ ctx: { playlist, playlistReq, isCollaborator } });
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to access this resource.",
    });
  });
