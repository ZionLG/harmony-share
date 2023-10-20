import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { api } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getInitials } from "~/utils/helperFunctions";

type SpotifyPlaylistProps = {
  imageUrl: string; // 60x60
  id: string;
  spotifyUrl: string;
  name: string;
  description: string;
  isPublic: boolean;
  tracksCount: number;
};
const SpotifyPlaylist = ({
  description,
  id,
  imageUrl,
  isPublic,
  name,
  spotifyUrl,
  tracksCount,
}: SpotifyPlaylistProps) => {
  const { mutate, isLoading } = api.spotify.importSpotifyPlaylist.useMutation();
  return (
    <Card
      key={id}
      className={`
      
       flex min-w-fit flex-col  justify-between `}
    >
      <CardHeader>
        <CardTitle className="flex gap-2">
          <Avatar className=" h-[60px] w-[60px] rounded-md   ">
            <AvatarImage src={imageUrl} />
            <AvatarFallback className="rounded-md  ">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-2">
            <a target="_blank" href={spotifyUrl} className=" w-fit underline ">
              {name}
            </a>
            <span className="text-lg font-thin">
              {isPublic ? "Public Playlist" : "Private Playlist"}
            </span>
          </div>
        </CardTitle>
        <CardDescription>
          <p>{description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>Track count: {tracksCount}</CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button
          variant={"positive"}
          onClick={() => {
            mutate({ spotifyPlaylistId: id });
          }}
        >
          Import
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpotifyPlaylist;
