import { user } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";
import { getInitials } from "~/utils/helperFunctions";

const UserProfile = () => {
  const router = useRouter();
  const session = useSession();

  const getProfile = api.spotify.getUserData.useQuery(
    {
      userId: router.query.slug as string,
    },
    { enabled: router.query.slug != null }
  );
  if (session.status !== "authenticated") return null;

  if (getProfile.data)
    return (
      <main className="flex min-h-screen flex-col p-5">
        <div className="flex items-center justify-center gap-5">
          <Avatar className=" relative h-48 w-48 rounded-full text-7xl">
            <AvatarImage src={getProfile.data.appData.imageUrl ?? ""} />
            <AvatarFallback className="cursor-default">
              {getInitials(getProfile.data.appData.name ?? "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <span className="text-7xl font-bold">
              {getProfile.data.appData.name}
            </span>
            <a
              target="_blank"
              href={getProfile.data.spotifyData.externalLink}
              className="flex w-fit cursor-pointer items-center  gap-5 "
            >
              <svg
                className="ml-2 h-8 fill-[#1DB954]"
                fill="white"
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Spotify</title>
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <Avatar className=" relative h-16 w-16 rounded-full text-2xl outline outline-1">
                <AvatarImage src={getProfile.data.spotifyData.imageUrl ?? ""} />
                <AvatarFallback>
                  {getInitials(getProfile.data.spotifyData.name ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col ">
                <span className="text-2xl font-bold">
                  {getProfile.data.spotifyData.name}
                </span>
                <span className="text-sm ">
                  {getProfile.data.spotifyData.followerCount} Followers
                </span>
              </div>
            </a>
          </div>
        </div>
        <Separator className="my-5" />
        <div className="container flex items-center">
          <div className=" ">
            <Button variant={"outline"}>Follow</Button>
          </div>
          <div className="flex flex-1 flex-col gap-2 text-center">
            <p>Bio</p>
            <span className="center italic">&quot;qoute&quot;</span>
          </div>
          {router.query.slug === session.data.user.id && (
            <Button variant={"default"}>Edit</Button>
          )}
        </div>
        <Separator className="my-5" />
        <div className="flex h-96 gap-4">
          <div className="flex  flex-col rounded-lg border px-10 py-5">
            <span className="text-xl font-bold">User Stats</span>
            <Separator className="mb-5 mt-2" />
            <div className="flex flex-col gap-2">
              <span>Public Playlists:</span>
              <span>Following:</span>
              <span>Followers:</span>
            </div>
          </div>
          <div className="min-w-fit grow rounded-lg border  px-10 py-5">
            <span className="text-xl font-bold">User Feed</span>
            <Separator className="mb-5 mt-2" />
          </div>
        </div>
      </main>
    );

  return <></>;
};

export default UserProfile;
