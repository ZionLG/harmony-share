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
import { AvatarFallback } from "~/components/ui/avatar";
import { api } from "~/utils/api";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useRouter } from "next/router";
import Link from "next/link";

type PlaylistCardProps = {
  query: UseTRPCQueryResult<unknown, unknown>;
  playlist: {
    name: string;
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
  cardGroup?: string;
  width?: number;
};
const PlaylistCard = ({
  query,
  playlist,
  cardGroup,
  width,
}: PlaylistCardProps) => {
  const router = useRouter();

  const { mutate: deleteMutate, isLoading: deleteIsLoading } =
    api.playlist.delete.useMutation({ onSuccess: () => query.refetch() });
  return (
    <Card
      key={playlist.id}
      style={{ width: `${width ? `${width}px` : "fit-content"}` }}
      className={`${
        cardGroup ? `playlist-card-${cardGroup}` : ""
      } flex min-w-fit flex-col justify-between`}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-4">
            <Avatar className="relative h-16 w-16 rounded-full ">
              <AvatarFallback>{getInitials(playlist.name)}</AvatarFallback>
            </Avatar>
            <Link href={`/playlist/${playlist.id}`}>
              {playlist.name} - {getLocalizedPrivacyName(playlist.readPrivacy)}{" "}
              (Write: {getLocalizedPrivacyName(playlist.writePrivacy)})
            </Link>
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
