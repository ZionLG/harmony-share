import React, { useEffect } from "react";
import Head from "next/head";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";

import PlaylistCards from "~/components/PlaylistCards";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Tabs, Tab } from "@nextui-org/react";
import SpotifyPlaylists from "~/components/SpotifyPlaylists";

const DynamicPlaylistCreator = dynamic(
  () => import("~/components/PlaylistCreationDialog"),
  {
    loading: () => <p>Loading...</p>,
  }
);
type DashboardTabs = "owned" | "collaboration" | "spotify_import";
const Dashboard = () => {
  const [selected, setSelected] = React.useState("owned" as DashboardTabs);

  const getOwnedPlaylists = api.playlist.getOwned.useQuery();
  const getCollabPlaylists = api.playlist.getCollaborated.useQuery();
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
          <Tabs
            variant={"underlined"}
            selectedKey={selected}
            onSelectionChange={(key) => {
              setSelected(key as DashboardTabs);
            }}
          >
            <Tab key="owned" title="Owned Playlists">
              <PlaylistCards query={getOwnedPlaylists} />
            </Tab>
            <Tab key="collaboration" title="Collaboration Playlists">
              <PlaylistCards query={getCollabPlaylists} />
            </Tab>
            <Tab key="spotify_import" title="Spotify Playlists">
              <SpotifyPlaylists />
            </Tab>
          </Tabs>

          <div>
            <span className="text-2xl font-semibold text-primary"></span>
            <Separator className="my-4" />
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
