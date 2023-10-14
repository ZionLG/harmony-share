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
    <div className=" grid h-auto  min-w-max max-w-max grid-cols-1 gap-5   lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
      {query.data?.map((playlist) => (
        <PlaylistCard playlist={playlist} query={query} key={playlist.id} />
      ))}
    </div>
  );
};

export default PlaylistCards;
