import React from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

import { ThemeToggle } from "./ThemeToggle";

import AuthAvatar from "./AuthAvatar";
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
      <div className="ml-5">
        {session.status !== "authenticated" ? (
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-gray-600 no-underline transition hover:bg-white/20"
            onClick={() =>
              void signIn("spotify", { callbackUrl: "/dashboard" })
            }
          >
            Sign in
          </button>
        ) : (
          <AuthAvatar />
        )}
      </div>
    </header>
  );
};

export default Header;
