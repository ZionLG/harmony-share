import React from "react";
import { api } from "~/utils/api";
import SpotifyPlaylist from "./SpotifyPlaylist";

const SpotifyPlaylists = () => {
  const getSong = api.spotify.getUserPlaylists.useQuery();

  return (
    <>
      <div className="grid h-auto grid-cols-1 gap-5 sm:grid-cols-2  lg:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6">
        {getSong.data?.items.map((playlist) => (
          <SpotifyPlaylist
            key={playlist.id}
            description={playlist.description}
            id={playlist.id}
            imageUrl={playlist.images[1]?.url ?? ""}
            isPublic={playlist.public}
            name={playlist.name}
            spotifyUrl={playlist.external_urls.spotify}
            tracksCount={playlist.tracks?.total ?? 0}
          />
        ))}
      </div>
    </>
  );
};

export default SpotifyPlaylists;
