import React, { useEffect, useMemo, useState } from "react";

import { ScrollArea } from "~/components/ui/scroll-area";
import { v4 as uuidv4 } from "uuid";
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
  const [maxWidth, setMaxWidth] = useState(0);

  const playlistGroupId: string = useMemo(() => uuidv4(), []);

  useEffect(() => {
    const calculateMaxWidth = () => {
      const cards = document.querySelectorAll(
        `.playlist-card-${playlistGroupId}`
      );
      let maxWidth = 0;

      cards.forEach((card) => {
        const cardWidth = (card as HTMLElement).offsetWidth;
        if (cardWidth > maxWidth) {
          maxWidth = cardWidth;
        }
      });

      return maxWidth;
    };

    const newMaxWidth = calculateMaxWidth();
    setMaxWidth(newMaxWidth);
  }, [playlistGroupId, query]);

  return (
    <ScrollArea className="p-6">
      <div className="flex h-auto gap-5">
        {query.data?.map((playlist) => (
          <PlaylistCard
            cardGroup={playlistGroupId}
            playlist={playlist}
            query={query}
            width={maxWidth}
            key={playlist.id}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default PlaylistCards;
