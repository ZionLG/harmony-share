import { Pause, Play } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAudioWizard } from "react-audio-wizard";
import { type Track } from "~/server/spotifyTypes";
import { millisToMinutesAndSeconds } from "~/utils/helperFunctions";

const SpotifyTrack = ({
  artists,
  duration_ms,
  explicit,
  id,
  name,
  spotifyLink,
  previewUrl,
}: Track) => {
  const { status, play, pause } = useAudioWizard({
    url: previewUrl,
  });
  return (
    <div
      //onClick={() => handleOnSelect(item.id)}
      className="group flex cursor-pointer items-center  gap-10  px-4 py-1"
    >
      {/* <Image alt={item.name} src={item.} width={50} height={50} /> */}
      <div className="flex grow items-center justify-between  rounded-md p-2 group-hover:bg-secondary">
        <div className="flex shrink items-center gap-3">
          <span className="text-sm ">
            {millisToMinutesAndSeconds(duration_ms)}
          </span>
          <div className="flex shrink flex-col gap-1">
            <Link href={spotifyLink} className="  hover:underline ">
              {name}
            </Link>
            {artists.map((artist) => (
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
        {status === "playing" ? (
          <Pause
            size={24}
            className="fill-primary-foreground"
            onClick={pause}
          />
        ) : (
          <Play size={24} className="fill-primary-foreground" onClick={play} />
        )}
      </div>
    </div>
  );
};

export default SpotifyTrack;
