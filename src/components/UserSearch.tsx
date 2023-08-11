import React, { useState } from "react";
import { X } from "lucide-react";
import { api } from "~/utils/api";
import { useDebounce } from "usehooks-ts";
import { type Track } from "~/utils/spotifyTypes";
import SpotifyTrack from "./SpotifyTrack";
import { Input } from "./ui/input";
import Image from "next/image";
import type { useAudioReturnType } from "~/utils/useAudio";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { getInitials } from "~/utils/helperFunctions";
type SearchProps = {
  maxResults?: number;
  playlistId: string;
  setSelectedUserId: React.Dispatch<React.SetStateAction<string | null>>;
};

const UserSearch = ({
  maxResults = 5,
  playlistId,
  setSelectedUserId,
}: SearchProps) => {
  const [searchUser, setSearchUser] = useState<string>("");

  const debouncedFilter = useDebounce(searchUser, 150);
  const getUsers = api.users.getUsersByName.useQuery(
    { username: debouncedFilter, resultNumber: maxResults },
    {
      refetchOnWindowFocus: false,

      enabled: debouncedFilter != "",
    }
  );
  const formatResult = (user: {
    name: string | null;
    id: string;
    image: string | null;
  }) => {
    return (
      <div
        key={user.id}
        className="group m-2 flex items-center gap-2 rounded-md p-2 hover:bg-secondary"
        onClick={() => {
          setSelectedUserId(user.id);
          setSearchUser("");
        }}
      >
        <Avatar className=" h-12 w-12 cursor-pointer rounded-md text-2xl">
          <AvatarImage src={user.image ?? ""} />
          <AvatarFallback className="group-hover:bg-primary-foreground">
            {getInitials(user.name ?? "")}
          </AvatarFallback>
        </Avatar>
        <span>{user.name}</span>
      </div>
    );
  };
  return (
    <div className="relative flex h-fit flex-col">
      <div
        className={`flex border ${
          searchUser !== "" ? " rounded-t-md" : " rounded-md"
        } items-center gap-2 p-2`} //filtered.length > 0
      >
        <Input
          type="text"
          className="w-52 text-lg"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <X
          size={25}
          onClick={() => setSearchUser("")}
          className="cursor-pointer"
        />
      </div>

      {(getUsers.data?.length ?? 0) > 0 ? (
        <div className="absolute top-full z-50 w-full rounded-b border-x border-b  py-2">
          {getUsers.data?.map((v) => formatResult(v))}
        </div>
      ) : (
        searchUser !== "" &&
        !getUsers.isLoading && (
          <div className="absolute top-full z-50 w-full rounded-b border-x border-b py-4 text-center">
            No results found
          </div>
        )
      )}
    </div>
  );
};

export default UserSearch;
