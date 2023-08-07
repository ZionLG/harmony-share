import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import PlaylistHeader from "~/components/PlaylistHeader";
import Track from "~/components/RowTrack";
import TrackSearch from "~/components/TrackSearch";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import useAudio from "~/utils/useAudio";

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
  useEffect(() => {
    if (session.status === "unauthenticated") void router.push("/");
    if (
      getPlaylist.data?.playlist.owner.id !== session.data?.user.id &&
      getPlaylist.data?.isCollaborator === false &&
      getPlaylist.data?.playlist.writePrivacy !== "public"
    )
      void router.push("/");
  }, [
    session,
    router,
    getPlaylist.data?.playlist.owner.id,
    getPlaylist.data?.isCollaborator,
    getPlaylist.data?.playlist.writePrivacy,
  ]);

  useEffect(() => {
    if (getPlaylist.status === "error") void router.push("/");
  }, [getPlaylist.status, router]);

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
      <Separator className="my-5" />
      <div className=" container flex justify-around ">
        <TrackSearch
          playlistId={router.query.slug as string}
          audioState={audioState}
        />
        <div className="p-5">
          <Table className=" text-lg">
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
              {getPlaylist.data?.playlist.tracks.map((track, i) => {
                return (
                  <Track
                    isEditTrack={true}
                    playlistId={router.query.slug as string}
                    audioState={audioState}
                    key={track.id}
                    track={track}
                    index={i + 1}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
