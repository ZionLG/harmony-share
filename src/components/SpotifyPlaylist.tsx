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
  return (
    <Card
      key={id}
      className={`
      
       flex min-w-fit flex-col  justify-between `}
    >
      <CardHeader>
        <CardTitle className="flex gap-2">
          <Image
            alt="cover image"
            src={imageUrl}
            className="rounded-md border"
            width={60}
            height={60}
          />
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
        <Button>Preview</Button>
        <Button variant={"positive"}>Import</Button>
      </CardFooter>
    </Card>
  );
};

export default SpotifyPlaylist;
