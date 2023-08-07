import React, { useState } from "react";
import { Track } from "@prisma/client";
import { api } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import { TableCell, TableRow } from "~/components/ui/table";
import { millisToMinutesAndSeconds } from "~/utils/helperFunctions";

type TrackProps = {
  track: Track;
  index: number;
};
const Track = ({ track, index }: TrackProps) => {
  const getTrack = api.spotify.getSongById.useQuery({
    songId: track.spotifyId,
  });
  if (!getTrack.data) return null;
  return (
    <TableRow className=" items-center gap-3 p-3">
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
          <Link href={getTrack.data.spotifyLink} className="  hover:underline ">
            {getTrack.data.name}
          </Link>
          {getTrack.data.artists.map((artist) => (
            <Link
              key={artist.id}
              href={artist.spotifyLink}
              className="text-xs  hover:underline"
            >
              {artist.name}
            </Link>
          ))}
        </div>
      </TableCell>
      <TableCell>
        {millisToMinutesAndSeconds(getTrack.data.duration_ms)}
      </TableCell>
    </TableRow>
  );
};

export default Track;
