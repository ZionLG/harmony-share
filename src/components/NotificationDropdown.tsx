import { useSession } from "next-auth/react";

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
import { Bell } from "lucide-react";
import { api } from "~/utils/api";
import InviteNotification from "./InviteNotification";
import React from "react";

const NotificationDropdown = () => {
  const session = useSession();

  if (session.status !== "authenticated") return null;
  const getUserNotifications =
    api.notifications.getUserNotifications.useQuery();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Bell
          className="mr-3 cursor-pointer rounded-full border p-2"
          size={36}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mt-2 w-96" align="end" forceMount>
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {getUserNotifications.data?.map((notification, i) => {
          return (
            <React.Fragment key={notification.id}>
              <InviteNotification notification={notification} />
              {i !== getUserNotifications.data?.length - 1 && (
                <DropdownMenuSeparator />
              )}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
