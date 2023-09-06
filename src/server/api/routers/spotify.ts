import { type UserResponse, type MaxInt } from "@spotify/web-api-ts-sdk";
import { z } from "zod";
import { createTRPCRouter, spotifyProcedure } from "~/server/api/trpc";
import { type Artist, type Track } from "~/utils/spotifyTypes";

export const spotifyRouter = createTRPCRouter({
  getMe: spotifyProcedure.query(async ({ ctx }) => {
    return ctx.spotifySdk.currentUser.profile() as Promise<UserResponse>;
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
