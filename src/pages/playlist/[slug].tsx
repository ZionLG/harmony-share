import { Separator } from "~/components/ui/separator";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "~/utils/api";
import { getInitials, getLocalizedPrivacyName } from "~/utils/helperFunctions";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Dot } from "lucide-react";

export default function PlaylistPage() {
  const router = useRouter();
  const getPlaylist = api.playlist.getPlaylist.useQuery({
    playlistId: router.query.slug as string,
  });
  const session = useSession();

  useEffect(() => {
    if (getPlaylist.status === "error") void router.push("/");
  }, [getPlaylist.status, router]);

  if (getPlaylist.status === "loading" || getPlaylist.data == null)
    return <p>Loading...</p>;
  return (
    <main className="gap flex min-h-screen flex-col p-5">
      <div className="mb-3 flex items-center justify-center gap-5">
        <Avatar className="relative h-32 w-32 text-4xl ">
          <AvatarFallback>
            {getInitials(getPlaylist.data.playlist.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            <span className="text-sm  text-primary">
              {getLocalizedPrivacyName(
                getPlaylist.data.playlist.readPrivacy as string
              )}{" "}
              Playlist
            </span>
            <Dot />
            <Avatar className="relative h-8 w-8 text-xs ">
              <AvatarImage src={getPlaylist.data.playlist.owner.image ?? ""} />
              <AvatarFallback>
                {getInitials(getPlaylist.data.playlist.owner.name ?? "")}
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="text-6xl font-semibold text-primary">
            {getPlaylist.data.playlist.name}
          </span>
          <span className="text-md text-gray-400 text-primary">
            {getPlaylist.data.playlist.description}
          </span>
        </div>
      </div>
      <div className="flex gap-5">
        {(getPlaylist.data.isCollaborator ||
          getPlaylist.data.playlist.ownerId === session.data?.user?.id) && (
          <Link href={`/playlist/edit/${router.query.slug as string}`}>
            <Button>Edit</Button>
          </Link>
        )}
        <Button className="group bg-[#1DB954] text-foreground hover:text-primary-foreground">
          Add to Spotify
          <svg
            className="ml-2 h-8 group-hover:fill-[#1DB954]"
            fill="white"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Spotify</title>
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </Button>
      </div>

      <Separator className="my-5" />
    </main>
  );
}