import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import PlaylistHeader from "~/components/PlaylistHeader";
import Track from "~/components/RowTrack";
import ProductSearch from "~/components/TrackSearch";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function PlaylistEditPage() {
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
      getPlaylist.data?.isCollaborator === false
    )
      void router.push("/");
  }, [
    session,
    router,
    getPlaylist.data?.playlist.owner.id,
    getPlaylist.data?.isCollaborator,
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
        <ProductSearch playlistId={router.query.slug as string} />
        <div className="p-5">
          <Table className=" text-lg">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {getPlaylist.data?.playlist.tracks.map((track, i) => {
                return <Track key={track.id} track={track} index={i} />;
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
