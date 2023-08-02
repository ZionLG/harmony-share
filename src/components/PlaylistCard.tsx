import React from "react";
import { Button } from "~/components/ui/button";

import { getInitials } from "~/utils/helperFunctions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback } from "~/components/ui/avatar";
import { api } from "~/utils/api";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";

type PlaylistCardProps = {
  query: UseTRPCQueryResult<unknown, unknown>;
  playlist: {
    name: string;
    description: string | null;
    privacy: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    collaborators: {
      user: {
        image: string | null;
      };
    }[];
  };
  cardGroup: string;
  width: number;
};
const PlaylistCard = ({
  query,
  playlist,
  cardGroup,
  width,
}: PlaylistCardProps) => {
  const getLocalizedPrivacyName = (privacy: string) => {
    switch (privacy) {
      case "private":
        return "Private";
      case "public":
        return "Public";
      case "invite":
        return "Invite Only";
      default:
        return "Unknown";
    }
  };

  const { mutate: deleteMutate, isLoading: deleteIsLoading } =
    api.playlist.delete.useMutation({ onSuccess: () => query.refetch() });
  return (
    <Card
      key={playlist.id}
      style={{ width: `${width}px` }}
      className={`playlist-card-${cardGroup} flex min-w-fit flex-col justify-between`}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-4">
            <Avatar className="relative h-16 w-16 rounded-full ">
              <AvatarFallback>{getInitials(playlist.name)}</AvatarFallback>
            </Avatar>
            {playlist.name} - {getLocalizedPrivacyName(playlist.privacy)}
          </div>
        </CardTitle>
        <CardDescription>
          Last Updated - {playlist.updatedAt.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>{playlist.description}</CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant={"destructive"}
          disabled={deleteIsLoading}
          onClick={() => deleteMutate({ id: playlist.id })}
        >
          Delete
        </Button>
        <Button variant={"default"}>Edit</Button>
        {playlist.privacy !== "private" && (
          <Button variant={"secondary"}>Share</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlaylistCard;
