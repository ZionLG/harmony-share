import { Pause, Play } from "lucide-react";
import React from "react";
import type { useAudioReturnType } from "~/utils/useAudio";
import { type Track } from "~/utils/spotifyTypes";
import { api } from "~/utils/api";
import { millisToMinutesAndSeconds } from "~/utils/helperFunctions";
import Image from "next/image";
type SpotifyTrackProps = {
  track: Track;
  playlistId: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  audioState: useAudioReturnType;
};
const SpotifyTrack = ({
  track,
  playlistId,
  audioState,
  setSearchTerm,
}: SpotifyTrackProps) => {
  const utils = api.useContext();

  const { mutate, isLoading } = api.playlist.addTrack.useMutation({
    onSuccess: () => {
      void utils.playlist.getPlaylist.invalidate();
    },
  });

  const handleOnSelect = (trackId: string) => {
    if (isLoading) return;
    try {
      audioState.pause();
      setSearchTerm("");
      mutate({ trackId, playlistId });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="group flex cursor-pointer items-center p-2">
      <div className="flex grow items-center justify-between  rounded-md p-2 group-hover:bg-secondary">
        <div
          onClick={() => handleOnSelect(track.id)}
          className="flex w-5/6 shrink items-center gap-3"
        >
          <span className="text-sm ">
            {millisToMinutesAndSeconds(track.duration_ms)}
          </span>
          {track.albumCover && (
            <Image
              alt="cover image"
              src={track.albumCover}
              className="rounded-md border"
              width={50}
              height={50}
            />
          )}
          <div className="flex shrink flex-col gap-1">
            <a
              target="_blank"
              href={track.spotifyLink}
              className="  hover:underline "
            >
              {track.name}
            </a>
            {track.artists.map((artist) => (
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
        </div>
        {track.previewUrl != null &&
          (audioState.status === "playing" &&
          audioState.urlState === track.previewUrl ? (
            <Pause
              size={24}
              className="cursor-pointer  fill-primary-foreground"
              onClick={() => {
                audioState.pause();
              }}
            />
          ) : (
            <Play
              size={24}
              className="cursor-pointer fill-primary-foreground"
              onClick={() => {
                if (audioState.status !== "playing" && track.previewUrl) {
                  audioState.setUrlState(track.previewUrl);
                } else if (track.previewUrl) {
                  audioState.pause();
                  audioState.setUrlState(track.previewUrl);
                }
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default SpotifyTrack;
