import React from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

import { ThemeToggle } from "./ThemeToggle";

import AuthAvatar from "./AuthAvatar";
import { Button } from "./ui/button";
import { Dot } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
const Header = () => {
  const session = useSession();
  const navUser = (
    <>
      <nav className=" flex gap-5 text-lg text-foreground">
        <Link href="/">Home</Link>
        <Link href="/playlists">Explore</Link>
      </nav>
      <div className="flex items-center">
        <Dot className="mx-2" />
        {session.status !== "authenticated" ? (
          <Button
            onClick={() =>
              void signIn("spotify", { callbackUrl: "/dashboard" })
            }
          >
            Sign in
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <NotificationDropdown />
            <AuthAvatar />
          </div>
        )}
      </div>
    </>
  );
  return (
    <>
      <div className="pt-4 text-center">
        <span> Demo Spotify account</span>
        <div className="mt-2 flex justify-center gap-5">
          <span>Username: 315a7fcxer7mif2wtkwiphe45tqm</span>
          <span>Password: HarmonyTest123!</span>
        </div>
      </div>
      <header className=" top-0 z-50 flex flex-col items-center gap-5 bg-background p-5 text-foreground md:sticky md:flex-row  md:gap-0">
        <div>
          <span className="mr-5 text-3xl tracking-widest">Harmony Share</span>
          <ThemeToggle />
        </div>
        <div className="  hidden md:static md:ml-auto md:flex md:items-center">
          {navUser}
        </div>
      </header>
      <div className="sticky top-0 z-50 flex  items-center justify-center bg-background p-3 md:hidden ">
        {navUser}
      </div>
    </>
  );
};

export default Header;
