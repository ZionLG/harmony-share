import { MaxInt } from "@spotify/web-api-ts-sdk";
import { z } from "zod";
import { createTRPCRouter, spotifyProcedure } from "~/server/api/trpc";
import { type Artist, type Track } from "~/server/spotifyTypes";

export const spotifyRouter = createTRPCRouter({
  getMe: spotifyProcedure.query(async ({ ctx }) => {
    return ctx.spotifySdk.currentUser.profile();
  }),
  getSong: spotifyProcedure
    .input(
      z.object({ name: z.string(), resultNumber: z.number().min(0).max(50) })
    )
    .query(async ({ ctx, input }) => {
      const trackResult = await ctx.spotifySdk.search(
        input.name,
        ["track"],
        undefined,
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
          previewUrl: track.preview_url ?? "",
        });
      });

      return data;
    }),
});
