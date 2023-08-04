import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import React from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { api } from "~/utils/api";
import { getInitials, getLocalizedPrivacyName } from "~/utils/helperFunctions";
import Link from "next/link";
import { Dot } from "lucide-react";

const Playlists = () => {
  const getPublicPlaylists = api.playlist.getPublicPlaylists.useQuery();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 p-5">
      {getPublicPlaylists.data?.map((playlist) => (
        <Card key={playlist.id} className={` flex flex-col justify-between`}>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-4">
                <Avatar className="relative h-16 w-16 rounded-md ">
                  <AvatarImage src={playlist.image ?? ""} />
                  <AvatarFallback className="rounded-md">
                    {getInitials(playlist.name)}
                  </AvatarFallback>
                </Avatar>
                <Link href={`/playlist/${playlist.id}`}>{playlist.name}</Link>
              </div>
            </CardTitle>
            <CardDescription>
              Last Updated - {playlist.updatedAt.toLocaleString()} -{" "}
              {getLocalizedPrivacyName("public")} (Write:{" "}
              {getLocalizedPrivacyName(playlist.writePrivacy)})
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-md">{playlist.description}</CardContent>
          <CardFooter className="flex">
            <Avatar className="relative h-8 w-8 rounded-full text-xs">
              <AvatarImage src={playlist.owner.image ?? ""} />
              <AvatarFallback>
                {getInitials(playlist.owner.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <span className="ml-2">{playlist.owner.name}</span>

            <Dot />
            <Button variant={"secondary"}>Share</Button>
          </CardFooter>
        </Card>
      ))}
    </main>
  );
};

export default Playlists;
