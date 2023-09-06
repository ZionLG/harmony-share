import { useSession } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Bell } from "lucide-react";
import { api } from "~/utils/api";
import InviteNotification from "./InviteNotification";
import React, { useEffect, useState } from "react";

const NotificationDropdown = () => {
  const session = useSession();
  const utils = api.useContext();
  const [unreadCount, setUnreadCount] = useState(0);

  const { mutate, isLoading } =
    api.notifications.setAllNotificationsRead.useMutation({
      onSuccess: () => {
        void utils.notifications.getUserNotifications.invalidate();
      },
    });
  const getUserNotifications =
    api.notifications.getUserNotifications.useQuery();

  useEffect(() => {
    // Calculate unread count when notifications change
    if (getUserNotifications.data) {
      const newUnreadCount = getUserNotifications.data.reduce((acc, noti) => {
        return acc + (noti.read ? 0 : 1);
      }, 0);
      setUnreadCount(newUnreadCount);
    }
  }, [getUserNotifications.data]);

  if (session.status !== "authenticated") return null;

  return (
    <DropdownMenu
      onOpenChange={(e) => {
        if (!isLoading && e) mutate();
      }}
    >
      <DropdownMenuTrigger asChild>
        {unreadCount > 0 ? (
          <div className="-mr-2">
            <Bell
              className=" inline-block cursor-pointer rounded-full border p-2"
              size={36}
            />
            <span className="relative right-4  top-4  inline-block h-5 w-5 rounded-full bg-red-500 text-center text-sm">
              {unreadCount}
            </span>
          </div>
        ) : (
          <Bell
            className="  mr-2 cursor-pointer rounded-full border p-2"
            size={36}
          />
        )}
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
