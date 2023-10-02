import React from "react";

import { HorizontalScrollArea } from "~/components/ui/scroll-area";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import PlaylistCard from "./PlaylistDashboardCard";

type PlaylistCardsProps = {
  query: UseTRPCQueryResult<
    {
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
    }[],
    unknown
  >;
};
const PlaylistCards = ({ query }: PlaylistCardsProps) => {
  return (
    <HorizontalScrollArea className="h-72 w-full  ">
      <div className="flex h-auto gap-5">
        {query.data?.map((playlist) => (
          <PlaylistCard playlist={playlist} query={query} key={playlist.id} />
        ))}
      </div>
    </HorizontalScrollArea>
  );
};

export default PlaylistCards;
