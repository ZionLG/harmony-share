import React from "react";
import { Track } from "@prisma/client";
import { api } from "~/utils/api";
import Image from "next/image";
import { TableCell, TableRow } from "~/components/ui/table";
import { millisToMinutesAndSeconds } from "~/utils/helperFunctions";
import type { useAudioReturnType } from "~/utils/useAudio";
import { Pause, Play, X } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import cloneObject from "lodash.clonedeep";

type TrackProps = {
  track: Track;
  index: number;
  audioState: useAudioReturnType;
  playlistId: string;
  isEditTrack?: boolean;
  isDragDisabled?: boolean;
};
const Track = ({
  track,
  index,
  audioState,
  playlistId,
  isEditTrack = false,
  isDragDisabled = false,
}: TrackProps) => {
  const getTrack = api.spotify.getSongById.useQuery({
    songId: track.spotifyId,
  });
  const utils = api.useContext();

  const { mutate: deleteMutate, isLoading: deleteIsLoading } =
    api.playlist.deleteSong.useMutation({
      async onMutate(data) {
        await utils.playlist.getPlaylist.cancel();

        const prevData = utils.playlist.getPlaylist.getData({
          playlistId: playlistId,
        });
        const optimisticPlaylist = cloneObject(prevData);
        if (optimisticPlaylist === undefined) return;
        const tracks = optimisticPlaylist.playlist.tracks;
        const selectedTrack = tracks.find((d) => {
          return d.id === data.trackId;
        });

        if (selectedTrack === undefined) return;
        const newTracks: {
          id: string;
          spotifyId: string;
          playlistId: string;
          AddedAt: Date;
          position: number;
        }[] = [];
        tracks.forEach((track) => {
          if (track.position > selectedTrack.position) {
            track.position--;
          }
          if (track.id !== data.trackId) {
            newTracks.push(track);
          }
        });
        optimisticPlaylist.playlist.tracks = newTracks;
        utils.playlist.getPlaylist.setData(
          { playlistId: optimisticPlaylist.playlist.id },
          (old) => optimisticPlaylist ?? old
        ); // Use updater function

        return { prevData };
      },
      onError(err, newPlaylist, ctx) {
        // If the mutation fails, use the context-value from onMutate
        utils.playlist.getPlaylist.setData(
          { playlistId: newPlaylist.playlistId },
          (old) => ctx?.prevData ?? old
        );
      },
      onSettled() {
        // Sync with server once mutation has settled
        void utils.playlist.getPlaylist.invalidate();
      },
    });
  if (!getTrack.data) return null;

  const rowData = (
    <>
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
    </>
  );
  if (isEditTrack)
    return (
      <Draggable
        key={track.id}
        draggableId={track.id}
        index={index}
        isDragDisabled={isDragDisabled}
      >
        {(provided, snapshot) => {
          return (
            <TableRow
              className={`group items-center  gap-3 p-3 ${
                snapshot.isDragging ? "table border-b-0" : ""
              }`}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              {rowData}
            </TableRow>
          );
        }}
      </Draggable>
    );
  return (
    <TableRow className=" group items-center gap-3 p-3">{rowData}</TableRow>
  );
};

export default Track;
