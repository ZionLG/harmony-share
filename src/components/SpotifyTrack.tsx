import { Pause, Play } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAudioWizard } from "react-audio-wizard";
import { type Track } from "~/utils/spotifyTypes";
import { api } from "~/utils/api";
import { millisToMinutesAndSeconds } from "~/utils/helperFunctions";
import Image from "next/image";
type SpotifyTrackProps = {
  track: Track;
  playlistId: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  isPlayingPreview: boolean;
  setIsPlayingPreview: React.Dispatch<React.SetStateAction<boolean>>;
};
const SpotifyTrack = ({
  track,
  playlistId,
  isPlayingPreview,
  setIsPlayingPreview,
  setSearchTerm,
}: SpotifyTrackProps) => {
  const { status, play, pause, handleSeek } = useAudioWizard({
    url: track.previewUrl ?? "",
  });
  const utils = api.useContext();

  const { mutate, isLoading } = api.playlist.addTrack.useMutation({
    onSuccess: () => {
      void utils.playlist.getPlaylist.invalidate();
    },
  });

  const handleOnSelect = (trackId: string) => {
    if (isLoading) return;
    try {
      pause();
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
          className="flex w-5/6 shrink items-center gap-3"
          onClick={() => handleOnSelect(track.id)}
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
            <Link href={track.spotifyLink} className="  hover:underline ">
              {track.name}
            </Link>
            {track.artists.map((artist) => (
              <Link
                key={artist.id}
                href={artist.spotifyLink}
                className="text-xs  hover:underline"
              >
                {artist.name}
              </Link>
            ))}
          </div>
        </div>
        {track.previewUrl != null &&
          (status === "playing" ? (
            <Pause
              size={24}
              className="fill-primary-foreground"
              onClick={() => {
                pause();
                setIsPlayingPreview(false);
                handleSeek({ seekTime: 0 });
              }}
            />
          ) : (
            <Play
              size={24}
              className="fill-primary-foreground"
              onClick={() => {
                if (!isPlayingPreview) {
                  play();
                  setIsPlayingPreview(true);
                }
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default SpotifyTrack;
