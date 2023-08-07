import React, { useState } from "react";
import { X } from "lucide-react";
import { api } from "~/utils/api";
import { useDebounce } from "usehooks-ts";
import { type Track } from "~/utils/spotifyTypes";
import SpotifyTrack from "./SpotifyTrack";
import { Input } from "./ui/input";
type SearchProps = {
  maxResults?: number;
  playlistId: string;
};

const TrackSearch = ({ maxResults = 5, playlistId }: SearchProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const debouncedFilter = useDebounce(searchTerm, 300);
  const getSong = api.spotify.getSongSearch.useQuery(
    { name: debouncedFilter, resultNumber: maxResults },
    {
      refetchOnWindowFocus: false,

      enabled: debouncedFilter != "",
    }
  );
  const formatResult = (track: Track) => {
    return (
      <SpotifyTrack
        isPlayingPreview={isPlayingPreview}
        setIsPlayingPreview={setIsPlayingPreview}
        track={track}
        playlistId={playlistId}
        key={track.id}
        setSearchTerm={setSearchTerm}
      />
    );
  };
  return (
    <div className="relative  flex h-fit flex-col">
      <div
        className={`flex border ${
          (getSong.data?.tracks.length ?? 0) > 0
            ? " rounded-t-md"
            : " rounded-md"
        } items-center gap-2 p-2`} //filtered.length > 0
      >
        <svg
          className="ml-2 h-8 fill-[#1DB954]"
          fill="white"
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Spotify</title>
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        <Input
          type="text"
          className="min-w-[16rem] text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <X
          size={25}
          onClick={() => setSearchTerm("")}
          className="cursor-pointer"
        />
      </div>

      {(getSong.data?.tracks.length ?? 0) > 0 && (
        <div className="absolute top-full z-50 w-full rounded-b border-x border-b  py-2">
          {getSong.data?.tracks.map((v) => formatResult(v))}
        </div>
      )}
    </div>
  );
};

export default TrackSearch;
