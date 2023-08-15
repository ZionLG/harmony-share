import { getInitials, getLocalizedPrivacyName } from "~/utils/helperFunctions";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { DropdownMenuLabel } from "./ui/dropdown-menu";
import { Check, Dot, X } from "lucide-react";
import { api } from "~/utils/api";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";
import Link from "next/link";
import { Button } from "./ui/button";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { type TRPCClientErrorLike } from "@trpc/react-query";

type playlistOutputData = UseTRPCQueryResult<
  inferRouterOutputs<AppRouter>["notifications"]["getUserNotifications"][number],
  TRPCClientErrorLike<AppRouter>["data"]
>["data"];

type InviteNotificationProps = {
  notification: playlistOutputData;
};

const InviteNotification = ({ notification }: InviteNotificationProps) => {
  if (!notification) return;

  if (!notification.inviteNotification) return null;

  const collab = notification.inviteNotification.collab;

  const playlist = collab.playlist;

  const owner = playlist.owner;
  const utils = api.useContext();

  const { mutate: inviteStatusMutate, isLoading: isLoadingInviteStatus } =
    api.notifications.changeInviteStatus.useMutation({
      onSuccess: () => {
        void utils.notifications.getUserNotifications.invalidate();
      },
    });

  const playlistOwner = (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline font-medium underline">{owner.name}</span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-3">
            <Avatar className=" h-12 w-12 cursor-pointer rounded-full text-xl">
              <AvatarImage src={owner.image ?? ""} />
              <AvatarFallback>{getInitials(owner.name ?? "")}</AvatarFallback>
            </Avatar>
            <Link className="text-md" href={`user/${owner.id}`}>
              {owner.name}
            </Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const playlistOfOwner = (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline font-medium underline">
            &apos;
            {playlist.name}&apos;
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-3">
            <Avatar className=" h-12 w-12 cursor-pointer rounded-full text-xl">
              <AvatarImage src={playlist.image ?? ""} />
              <AvatarFallback>
                {getInitials(playlist.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="text-md flex flex-col gap-1">
              <Link href={`playlist/${playlist.id}`}>{playlist.name}</Link>
              <span className="text-sm text-muted-foreground">
                {getLocalizedPrivacyName(playlist.readPrivacy)} (Write:{" "}
                {getLocalizedPrivacyName(playlist.writePrivacy)})
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const text = () => {
    if (collab.status === "pending") {
      return (
        <span>
          You have been <span className="text-yellow-300">invited</span> to
          collaborate on the playlist {playlistOfOwner} by {playlistOwner}
        </span>
      );
    }

    if (collab.status === "accepted") {
      return (
        <span>
          You have <span className="text-green-300">accepted</span> the
          invitation to collaborate on the playlist {playlistOfOwner} by{" "}
          {playlistOwner}
        </span>
      );
    }

    if (collab.status === "declined") {
      return (
        <span>
          You have <span className="text-red-300">declined</span> the invitation
          to collaborate on the playlist {playlistOfOwner} by {playlistOwner}
        </span>
      );
    }
  };

  return (
    <>
      <DropdownMenuLabel key={notification.id}>
        <div className="flex flex-col gap-3 font-normal">
          <div> {text()} </div>
          {collab.status === "pending" && (
            <div className="flex items-center justify-center">
              <Button
                size={"icon"}
                disabled={isLoadingInviteStatus}
                className="rounded-full "
                variant={"positive"}
                onClick={() => {
                  inviteStatusMutate({
                    status: "accepted",
                    collabId: collab.id,
                  });
                }}
              >
                <Check />
              </Button>
              <Dot className="mx-2" />
              <Button
                disabled={isLoadingInviteStatus}
                onClick={() => {
                  inviteStatusMutate({
                    status: "declined",
                    collabId: collab.id,
                  });
                }}
                variant={"destructive"}
                size={"icon"}
                className="rounded-full "
              >
                <X />
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuLabel>
    </>
  );
};

export default InviteNotification;
