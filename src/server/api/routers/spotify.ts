import { Track as PrismaTrack } from "@prisma/client";
import {
  type Page,
  type MaxInt,
  type PlaylistedTrack,
} from "@spotify/web-api-ts-sdk";
import { z } from "zod";
import {
  createTRPCRouter,
  spotifyProcedure,
  playlistSpotifyReadProcedure,
} from "~/server/api/trpc";
import { type Artist, type Track } from "~/utils/spotifyTypes";

export const spotifyRouter = createTRPCRouter({
  getMe: spotifyProcedure.query(async ({ ctx }) => {
    return ctx.spotifySdk.currentUser.profile();
  }),
  getUserData: spotifyProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
        include: { accounts: true },
      });
      const spotifyId = user!.accounts[0]!.providerAccountId;
      const spotifyUser = await ctx.spotifySdk.users.profile(spotifyId);
      console.log(spotifyUser);
      return {
        appData: {
          name: user!.name,
          bio: user?.bio,
          imageUrl: user?.image,
        },
        spotifyData: {
          name: spotifyUser.display_name,
          externalLink: spotifyUser.external_urls.spotify,
          imageUrl: spotifyUser.images[0]?.url,
          followerCount: spotifyUser.followers.total,
        },
      };
    }),
  getUserPlaylists: spotifyProcedure.query(async ({ ctx }) => {
    return ctx.spotifySdk.currentUser.playlists.playlists(50);
  }),
  addPlaylistToSpotify: playlistSpotifyReadProcedure.mutation(
    async ({ ctx }) => {
      const spotifyPlatlist = await ctx.spotifySdk.playlists.createPlaylist(
        (
          await ctx.spotifySdk.currentUser.profile()
        ).id,
        {
          name: ctx.playlist.name,
          description: ctx.playlist.description ?? undefined,
          public: ctx.playlist.readPrivacy === "public",
        }
      );
      const tracks = ctx.playlist.tracks;
      const spotifyTracks = tracks.map(
        (track) => `spotify:track:${track.spotifyId}`
      );
      console.log(spotifyTracks);
      await ctx.spotifySdk.playlists.addItemsToPlaylist(
        spotifyPlatlist.id,
        spotifyTracks
      );
      return spotifyPlatlist;
    }
  ),
  importSpotifyPlaylist: spotifyProcedure
    .input(z.object({ spotifyPlaylistId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.spotifySdk.playlists.getPlaylist(
        input.spotifyPlaylistId,
        ctx.session.user.spotifyMarket
      );
      const tracksPages = [] as Page<PlaylistedTrack>[];
      let tracks = await ctx.spotifySdk.playlists.getPlaylistItems(
        input.spotifyPlaylistId,
        ctx.session.user.spotifyMarket,
        undefined
      );
      tracksPages.push(tracks);

      while (tracks.next) {
        tracks = await ctx.spotifySdk.playlists.getPlaylistItems(
          input.spotifyPlaylistId,
          ctx.session.user.spotifyMarket,
          undefined,
          undefined,
          tracks.offset + 100
        );
        tracksPages.push(tracks);
      }
      const trackItemsMerge = [] as PlaylistedTrack[];

      tracksPages.forEach((item) => {
        item.items.forEach((track) => trackItemsMerge.push(track));
      });

      const createdPlaylist = await ctx.prisma.playlist.create({
        data: {
          name: playlist.name,
          readPrivacy: playlist.public ? "public" : "private",
          writePrivacy: "private",
          ownerId: ctx.session.user.id,
          image: playlist.images[1]?.url,
          description: playlist.description,
          tracks: {
            createMany: {
              data: trackItemsMerge.map((track, i) => {
                return {
                  position: i + 1,
                  spotifyId: track.track.id,
                };
              }),
            },
          },
        },
      });
      return { createdPlaylist };
    }),
  getSongSearch: spotifyProcedure
    .input(
      z.object({ name: z.string(), resultNumber: z.number().min(0).max(50) })
    )
    .query(async ({ ctx, input }) => {
      const trackResult = await ctx.spotifySdk.search(
        input.name,
        ["track"],
        ctx.session.user.spotifyMarket,
        input.resultNumber as MaxInt<50>
      );
      const data = { tracks: [] as Track[] };

      trackResult.tracks.items.forEach((track) => {
        const artists = [] as Artist[];
        track.artists.forEach((artist) => {
          artists.push({
            id: artist.id,
            name: artist.name,
            spotifyLink: artist.external_urls.spotify,
          });
        });
        data.tracks.push({
          name: track.name,
          id: track.id,
          duration_ms: track.duration_ms,
          artists: artists,
          explicit: track.explicit,
          spotifyLink: track.external_urls.spotify,
          previewUrl: track.preview_url,
          albumCover: track.album.images[0]?.url ?? null,
        });
      });

      return data;
    }),

  getSongById: spotifyProcedure
    .input(z.object({ songId: z.string() }))
    .query(async ({ ctx, input }) => {
      const trackResult = await ctx.spotifySdk.tracks.get(
        input.songId,
        ctx.session.user.spotifyMarket
      );
      const artists = [] as Artist[];
      trackResult.artists.forEach((artist) => {
        artists.push({
          id: artist.id,
          name: artist.name,
          spotifyLink: artist.external_urls.spotify,
        });
      });

      return {
        name: trackResult.name,
        id: trackResult.id,
        duration_ms: trackResult.duration_ms,
        artists: artists,
        explicit: trackResult.explicit,
        spotifyLink: trackResult.external_urls.spotify,
        previewUrl: trackResult.preview_url,
        albumCover: trackResult.album.images[0]?.url,
      } as Track;
    }),
});
