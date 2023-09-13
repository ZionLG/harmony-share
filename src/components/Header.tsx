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

  return (
    <header className="sticky top-0 flex flex-col items-center gap-5 bg-background p-5 text-foreground md:flex-row  md:gap-0">
      <div>
        <span className="mr-5 text-3xl tracking-widest">Harmony Share</span>
        <ThemeToggle />
      </div>
      <div className="flex items-center md:ml-auto ">
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
      </div>
    </header>
  );
};

export default Header;
