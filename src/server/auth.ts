import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    error?: "RefreshAccessTokenError";
    user: DefaultSession["user"] & {
      id: string;
      providerId: string;
      // ...other properties
      // role: UserRole;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    access_token: string;
    expires_at: number;
    refresh_token: string;
    error?: "RefreshAccessTokenError";
  }
}

interface TokenSet {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

// interface TokenData {
//   access_token: string;
//   expires_in: number;
//   scope: string;
//   refresh_token: string;
//   token_type: string;
// }
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      const [spotify] = await prisma.account.findMany({
        where: {
          userId: user.id,
          provider: "spotify",
        },
      });
      if (spotify) {
        if (
          spotify?.expires_at == null ||
          spotify.expires_at * 1000 < Date.now()
        ) {
          // If the access token has expired, try to refresh it
          try {
            // https://accounts.google.com/.well-known/openid-configuration
            // We need the `token_endpoint`.
            const response = await fetch(
              "https://accounts.spotify.com/api/token",
              {
                headers: {
                  Authorization: `Basic ${Buffer.from(
                    `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
                  ).toString("base64")}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  grant_type: "refresh_token",
                  refresh_token: spotify.refresh_token!,
                }),
                method: "POST",
              }
            );

            const tokens: TokenSet = (await response.json()) as TokenSet;

            if (!response.ok) throw tokens;

            await prisma.account.update({
              data: {
                access_token: tokens.access_token,
                expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
              },
              where: {
                provider_providerAccountId: {
                  provider: "spotify",
                  providerAccountId: spotify.providerAccountId,
                },
              },
            });
          } catch (error) {
            console.error("Error refreshing access token", error);
            // The error property will be used client-side to handle the refresh token error
            session.error = "RefreshAccessTokenError";
          }
        }
      }
      return {
        ...session,
        user: {
          ...session.user,
          providerId: spotify!.providerAccountId,
          id: user.id,
        },
      };
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    SpotifyProvider({
      authorization: {
        params: {
          scope:
            "user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative",
        },
      },
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
