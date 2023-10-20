import { getInitials } from "~/utils/helperFunctions";
import { signOut, useSession } from "next-auth/react";

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
import { useRouter } from "next/router";
const AuthAvatar = () => {
  const router = useRouter();
  const session = useSession();

  if (session.status !== "authenticated") return null;

  const user = session.data.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className=" relative h-12 w-12 cursor-pointer rounded-full text-xl">
          <AvatarImage src={user.image ?? ""} />
          <AvatarFallback>{getInitials(user.name ?? "")}</AvatarFallback>
        </Avatar>
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
          <DropdownMenuItem
            onClick={() => void router.push(`/user/${user.id}`)}
          >
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

export default AuthAvatar;
