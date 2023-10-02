import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import PlaylistHeader from "~/components/PlaylistHeader";
import Track from "~/components/RowTrack";
import TrackSearch from "~/components/TrackSearch";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";
import {
  DragDropContext,
  Droppable,
  type DropResult,
  type ResponderProvided,
} from "@hello-pangea/dnd";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import useAudio from "~/utils/useAudio";
import dynamic from "next/dynamic";

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
    onSuccess: () => {
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
    if (result.destination) {
      mutate({
        trackId: result.draggableId,
        newPosition: result.destination.index,
        playlistId: router.query.slug as string,
      });
    }
    console.log(result, provided);
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
      {getPlaylist.data.playlist.ownerId === session.data?.user?.id && (
        <div className="self-center">
          <DynamicPlaylistEdit
            playlist={getPlaylist.data.playlist}
            isCollaborator={getPlaylist.data.isCollaborator}
          />
        </div>
      )}
      <Separator className="my-5" />

      <div className=" container flex justify-around ">
        <TrackSearch
          playlistId={router.query.slug as string}
          audioState={audioState}
        />
        <div className="p-5">
          <DragDropContext onDragEnd={onDragEnd}>
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
