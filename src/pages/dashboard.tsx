import React, { useEffect } from "react";
import Head from "next/head";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";
import dynamic from "next/dynamic";

import PlaylistCards from "~/components/PlaylistCards";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
const DynamicPlaylistCreator = dynamic(
  () => import("~/components/PlaylistCreationDialog"),
  {
    loading: () => <p>Loading...</p>,
  }
);
const Dashboard = () => {
  const getOwnedPlaylists = api.playlist.getOwned.useQuery();
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status === "unauthenticated") void router.push("/");
  }, [router, session]);

  if (session.status !== "authenticated") return;
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
            <DynamicPlaylistCreator />
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
