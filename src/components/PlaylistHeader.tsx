import React from "react";
import { Dot } from "lucide-react";
import { getInitials, getLocalizedPrivacyName } from "~/utils/helperFunctions";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
type PlaylistHeaderProps = {
  name: string;
  description: string;
  readPrivacy: string;
  image: string;
  owner: {
    name: string;
    image: string;
  };
};
const PlaylistHeader = ({
  name,
  description,
  readPrivacy,
  image,
  owner,
}: PlaylistHeaderProps) => {
  return (
    <div className="mb-3 flex items-center justify-center gap-5">
      <Avatar className="relative h-40 w-40 rounded-md text-6xl">
        <AvatarImage src={image} />

        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <div className="flex items-center">
          <span className="text-sm  text-primary">
            {getLocalizedPrivacyName(readPrivacy)} Playlist
          </span>
          <Dot />
          <Avatar className="relative h-8 w-8 rounded-full text-xs">
            <AvatarImage src={owner.image} />
            <AvatarFallback>{getInitials(owner.name ?? "")}</AvatarFallback>
          </Avatar>
          <span className="ml-2">{owner.name}</span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-6xl font-semibold text-primary">{name}</span>
          <span className="text-md text-gray-400 text-primary">
            {description}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
