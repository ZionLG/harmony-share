import React from "react";
import { Button } from "~/components/ui/button";

import { getInitials, getLocalizedPrivacyName } from "~/utils/helperFunctions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/utils/api";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useRouter } from "next/router";
import Link from "next/link";

type PlaylistCardProps = {
  query: UseTRPCQueryResult<unknown, unknown>;
  playlist: {
    name: string;
    image: string | null;
    description: string | null;
    readPrivacy: string;
    writePrivacy: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    collaborators: {
      user: {
        image: string | null;
      };
    }[];
  };
};
const PlaylistCard = ({ query, playlist }: PlaylistCardProps) => {
  const router = useRouter();

  const { mutate: deleteMutate, isLoading: deleteIsLoading } =
    api.playlist.delete.useMutation({ onSuccess: () => query.refetch() });
  return (
    <Card
      key={playlist.id}
      className={`
      
       flex min-w-fit  flex-col justify-between `}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-4">
            <Avatar className="relative h-16 w-16 rounded-full ">
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
          {getLocalizedPrivacyName(playlist.readPrivacy)} (Write:{" "}
          {getLocalizedPrivacyName(playlist.writePrivacy)})
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-md">{playlist.description}</CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant={"destructive"}
          disabled={deleteIsLoading}
          onClick={() => deleteMutate({ id: playlist.id })}
        >
          Delete
        </Button>
        <Button
          variant={"default"}
          onClick={() => router.push(`/playlist/edit/${playlist.id}`)}
        >
          Edit
        </Button>
        {playlist.readPrivacy !== "private" && (
          <Button variant={"secondary"}>Share</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlaylistCard;
