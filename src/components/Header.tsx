import React from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

import { ThemeToggle } from "./ThemeToggle";

import AuthAvatar from "./AuthAvatar";
import { Button } from "./ui/button";
import { Dot } from "lucide-react";
const Header = () => {
  const session = useSession();

  return (
    <header className="flex items-center bg-background p-5 text-foreground">
      <span className="mr-5 text-3xl tracking-widest">Harmony Share</span>
      <ThemeToggle />
      <nav className="ml-auto flex gap-5 text-lg text-foreground">
        <Link href="/">Home</Link>
        <Link href="/playlists">Explore</Link>
      </nav>
      {session.status !== "authenticated" ? (
        <div className="flex items-center">
          <Dot className="mx-2" />
          <Button
            onClick={() =>
              void signIn("spotify", { callbackUrl: "/dashboard" })
            }
          >
            Sign in
          </Button>
        </div>
      ) : (
        <div className="ml-5">
          <AuthAvatar />
        </div>
      )}
    </header>
  );
};

export default Header;
