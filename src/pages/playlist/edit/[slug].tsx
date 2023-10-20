import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import PlaylistHeader from "~/components/PlaylistHeader";
import Track from "~/components/RowTrack";
import TrackSearch from "~/components/TrackSearch";
import { Separator } from "~/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import { api } from "~/utils/api";
import {
  DragDropContext,
  type DragUpdate,
  Droppable,
  type DropResult,
  type ResponderProvided,
} from "@hello-pangea/dnd";
import cloneObject from "lodash.clonedeep";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import useAudio from "~/utils/useAudio";
import dynamic from "next/dynamic";
import Link from "next/link";
import { cn } from "@nextui-org/react";
import { buttonVariants } from "~/components/ui/button";

const DynamicPlaylistEdit = dynamic(
  () => import("~/components/PlaylistEditDetailsDialog"),
  {
    loading: () => <p>Loading...</p>,
  }
);
export default function PlaylistEditPage() {
  const audioState = useAudio({
    url: "",
    playOnLoad: true,
  });
  const router = useRouter();
  const session = useSession();

  const getPlaylist = api.playlist.getPlaylist.useQuery(
    {
      playlistId: router.query.slug as string,
    },
    { enabled: router.query.slug != null }
  );

  const utils = api.useContext();

  const { mutate, isLoading } = api.playlist.changeTrackPosition.useMutation({
    async onMutate(data) {
      await utils.playlist.getPlaylist.cancel();

      const prevData = utils.playlist.getPlaylist.getData({
        playlistId: router.query.slug as string,
      });
      const optimisticPlaylist = cloneObject(prevData);
      if (optimisticPlaylist === undefined) return;
      const tracks = optimisticPlaylist.playlist.tracks;
      const newPosition = data.newPosition;
      const selectedTrack = tracks.find((d) => {
        return d.id === data.trackId;
      });

      if (selectedTrack === undefined) return;

      if (selectedTrack.position < newPosition) {
        tracks.forEach((track) => {
          if (
            track.position > selectedTrack.position &&
            track.position <= newPosition
          ) {
            track.position--;
          }
        });
      } else if (selectedTrack.position > newPosition) {
        tracks.forEach((track) => {
          if (
            track.position >= newPosition &&
            track.position < selectedTrack.position
          ) {
            track.position++;
          }
        });
      }
      selectedTrack.position = newPosition;
      tracks.sort(({ position: a }, { position: b }) => a - b);

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
  useEffect(() => {
    if (session.status === "unauthenticated") void router.push("/");
    const ownerOrPublicOrCollabWrite =
      getPlaylist.data?.playlist.owner.id === session.data?.user.id ||
      getPlaylist.data?.playlist.writePrivacy === "public" ||
      (getPlaylist.data?.isCollaborator === true &&
        getPlaylist.data?.playlist.writePrivacy === "invite");
    if (getPlaylist.data && !ownerOrPublicOrCollabWrite) void router.push("/");
  }, [
    session,
    router,
    getPlaylist.data?.playlist.owner.id,
    getPlaylist.data?.isCollaborator,
    getPlaylist.data?.playlist.writePrivacy,
    getPlaylist.data,
  ]);

  useEffect(() => {
    if (getPlaylist.status === "error") void router.push("/");
  }, [getPlaylist.status, router]);

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    if (result.destination?.index === result.source.index) return;
    if (result.destination && !isLoading) {
      mutate({
        trackId: result.draggableId,
        newPosition: result.destination.index,
        playlistId: router.query.slug as string,
      });
    }
    console.log(result, provided);
  };
  const onDragUpdate = (update: DragUpdate, provided: ResponderProvided) => {
    if (isLoading) return;
    console.log(update, provided);
    const prevData = utils.playlist.getPlaylist.getData({
      playlistId: router.query.slug as string,
    });
    const optimisticPlaylist = cloneObject(prevData);
    if (optimisticPlaylist === undefined) return;
    if (update.destination == undefined) return;
    const tracks = optimisticPlaylist.playlist.tracks;
    const newPosition = update.destination.index;
    const selectedTrack = tracks.find((d) => {
      return d.id === update.draggableId;
    });

    if (selectedTrack === undefined) return;

    if (selectedTrack.position < newPosition) {
      tracks.forEach((track) => {
        if (
          track.position > selectedTrack.position &&
          track.position <= newPosition
        ) {
          track.position--;
        }
      });
    } else if (selectedTrack.position > newPosition) {
      tracks.forEach((track) => {
        if (
          track.position >= newPosition &&
          track.position < selectedTrack.position
        ) {
          track.position++;
        }
      });
    }
    selectedTrack.position = newPosition;
    tracks.sort(({ position: a }, { position: b }) => a - b);

    utils.playlist.getPlaylist.setData(
      { playlistId: optimisticPlaylist.playlist.id },
      (old) => optimisticPlaylist ?? old
    ); // Use updater function
  };
  if (getPlaylist.status === "loading" || getPlaylist.data == null)
    return <p>Loading...</p>;
  return (
    <main className="gap flex min-h-screen flex-col p-5">
      <PlaylistHeader
        description={getPlaylist.data.playlist.description ?? ""}
        name={getPlaylist.data.playlist.name}
        readPrivacy={getPlaylist.data.playlist.readPrivacy}
        image={getPlaylist.data.playlist.image ?? ""}
        owner={{
          image: getPlaylist.data.playlist.owner.image ?? "",
          name: getPlaylist.data.playlist.owner.name ?? "",
        }}
      />
      <div className="flex justify-center">
        <Link
          href={`/playlist/${router.query.slug as string}`}
          className={`${cn(buttonVariants({ variant: "link" }))} `}
        >
          <div className="flex">
            <ChevronLeft />
            <span>Back To View</span>
          </div>
        </Link>
        {getPlaylist.data.playlist.ownerId === session.data?.user?.id && (
          <div>
            <DynamicPlaylistEdit
              playlist={getPlaylist.data.playlist}
              isCollaborator={getPlaylist.data.isCollaborator}
            />
          </div>
        )}
      </div>
      <Separator className="my-5" />

      <div className=" container flex justify-around ">
        <TrackSearch
          playlistId={router.query.slug as string}
          audioState={audioState}
        />
        <div className="p-5">
          <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => {
                return (
                  <Table className=" text-lg" ref={provided.innerRef}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Preview</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {getPlaylist.data?.playlist.tracks.map((track) => {
                        return (
                          <Track
                            isEditTrack={true}
                            playlistId={router.query.slug as string}
                            audioState={audioState}
                            key={track.id}
                            track={track}
                            index={track.position}
                            isDragDisabled={isLoading}
                          />
                        );
                      })}
                      {provided.placeholder}
                    </TableBody>
                  </Table>
                );
              }}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </main>
  );
}
