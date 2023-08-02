import React from "react";
import Head from "next/head";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";
import PlaylistCreationDialog from "~/components/PlaylistCreationDialog";

import PlaylistCards from "~/components/PlaylistCards";

const Dashboard = () => {
  const getOwnedPlaylists = api.playlist.getOwned.useQuery();

  return (
    <>
      <Head>
        <title>Harmony Share - Dashboard</title>
        <meta name="description" content="Harmoney share's dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col p-5">
        <div>
          <div className="flex justify-between">
            <span className="text-3xl font-semibold text-primary">
              Dashboard
            </span>
            <PlaylistCreationDialog />
          </div>
          <Separator className="my-4 h-1" />
        </div>
        <div className="flex flex-col gap-10">
          <div>
            <span className="text-2xl font-semibold text-primary">
              Owned Playlists
            </span>
            <Separator className="my-4" />
            <PlaylistCards query={getOwnedPlaylists} />
          </div>
          <div>
            <span className="text-2xl font-semibold text-primary">
              Collaboration Playlists
            </span>
            <Separator className="my-4" />
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
