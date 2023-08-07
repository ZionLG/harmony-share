import React from "react";
import { Track } from "@prisma/client";
import { api } from "~/utils/api";
import Image from "next/image";
import { TableCell, TableRow } from "~/components/ui/table";
import { millisToMinutesAndSeconds } from "~/utils/helperFunctions";
import type { useAudioReturnType } from "~/utils/useAudio";
import { Pause, Play, X } from "lucide-react";

type TrackProps = {
  track: Track;
  index: number;
  audioState: useAudioReturnType;
  playlistId: string;
  isEditTrack?: boolean;
};
const Track = ({
  track,
  index,
  audioState,
  playlistId,
  isEditTrack = false,
}: TrackProps) => {
  const getTrack = api.spotify.getSongById.useQuery({
    songId: track.spotifyId,
  });
  const utils = api.useContext();

  const { mutate: deleteMutate, isLoading: deleteIsLoading } =
    api.playlist.deleteSong.useMutation({
      onSuccess: () => utils.playlist.getPlaylist.invalidate(),
    });
  if (!getTrack.data) return null;
  return (
    <TableRow className=" group items-center gap-3 p-3">
      <TableCell>{index}</TableCell>
      <TableCell className="flex items-center gap-3">
        {getTrack.data.albumCover && (
          <Image
            src={getTrack.data.albumCover}
            alt="Track cover"
            className="h-14 rounded-md border"
            width={56}
            height={56}
          />
        )}
        <div className="flex flex-col gap-1">
          <a
            target="_blank"
            href={getTrack.data.spotifyLink}
            className="  hover:underline "
          >
            {getTrack.data.name}
          </a>
          {getTrack.data.artists.map((artist) => (
            <a
              target="_blank"
              key={artist.id}
              href={artist.spotifyLink}
              className="text-xs  hover:underline"
            >
              {artist.name}
            </a>
          ))}
        </div>
      </TableCell>
      <TableCell>
        {millisToMinutesAndSeconds(getTrack.data.duration_ms)}
      </TableCell>
      <TableCell>
        {getTrack.data.previewUrl != null &&
          (audioState.status === "playing" &&
          audioState.urlState === getTrack.data.previewUrl ? (
            <Pause
              size={24}
              className="cursor-pointer fill-primary-foreground"
              onClick={() => {
                audioState.pause();
              }}
            />
          ) : (
            <Play
              size={24}
              className="cursor-pointer fill-primary-foreground"
              onClick={() => {
                if (
                  audioState.status !== "playing" &&
                  getTrack.data.previewUrl
                ) {
                  audioState.setUrlState(getTrack.data.previewUrl);
                } else if (getTrack.data.previewUrl) {
                  audioState.pause();
                  audioState.setUrlState(getTrack.data.previewUrl);
                }
              }}
            />
          ))}
      </TableCell>
      {isEditTrack && (
        <TableCell>
          <X
            className="text-background hover:cursor-pointer group-hover:text-primary"
            onClick={() => {
              if (!deleteIsLoading) {
                deleteMutate({ playlistId, trackId: track.id });
              }
            }}
          />
        </TableCell>
      )}
    </TableRow>
  );
};

export default Track;
