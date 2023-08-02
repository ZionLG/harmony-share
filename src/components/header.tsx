import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useRouter } from "next/router";
import { ThemeToggle } from "./themeToggle";
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
const AuthAvatar = () => {
  const router = useRouter();
  const session = useSession();

  if (session.status !== "authenticated") return null;

  const user = session.data.user;
  const getInitials = (name: string) => {
    const names = name.split(" ");
    let initials = "";
    names.forEach((n) => {
      initials += n[0];
    });
    return initials;
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar>
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback>{getInitials(user.name ?? "")}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2 w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => void router.push("/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void router.push("/dashboard")}>
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void router.push("/settings")}>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => void signOut()}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default Header;
