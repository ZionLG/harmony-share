import React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { Textarea } from "~/components/ui/textarea";
import { api } from "~/utils/api";
import { AlertCircle, RotateCw } from "lucide-react";
import { Separator } from "./ui/separator";
import { detailsFormSchema, PrivacyEnum } from "~/utils/formSchemas";
import { type z } from "zod";
import UserSearch from "./UserSearch";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { type TRPCClientErrorLike } from "@trpc/react-query";
import { ScrollArea } from "./ui/scroll-area";

type playlistOutputData = UseTRPCQueryResult<
  inferRouterOutputs<AppRouter>["playlist"]["getPlaylist"],
  TRPCClientErrorLike<AppRouter>["data"]
>["data"];

const PlaylistEditDetailsDialog = (playlist: playlistOutputData) => {
  const detailsForm = useForm<z.infer<typeof detailsFormSchema>>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues: {
      name: playlist?.playlist.name,
      description: playlist?.playlist.description ?? "",
      readPrivacy: playlist?.playlist.readPrivacy,
      writePrivacy: playlist?.playlist.writePrivacy,
    },
  });

  const utils = api.useContext();

  const { mutate: editPlaylistMutate, isLoading: isLoadingPlaylistEdit } =
    api.playlist.edit.useMutation({
      onSuccess: () => {
        void utils.playlist.getOwned.invalidate();
        void utils.playlist.getPlaylist.invalidate();
      },
    });

  const { mutate: inviteUserMutate, isLoading: isLoadingInvite } =
    api.notifications.inviteToPlaylist.useMutation({
      onSuccess: () => {
        void utils.playlist.getPlaylist.invalidate();
      },
    });

  const dialogClose = () => {
    document.getElementById("closeDialog")?.click();
  };
  const onSubmitDetails = detailsForm.handleSubmit(
    (values: z.infer<typeof detailsFormSchema>) => {
      if (isLoadingPlaylistEdit) return;
      if (!playlist) return;
      const playlistData = playlist.playlist;
      // Nothing is changed - don't submit
      if (
        values.name === playlistData.name &&
        values.description === playlistData.description &&
        values.readPrivacy === playlistData.readPrivacy &&
        values.writePrivacy === playlistData.writePrivacy
      ) {
        detailsForm.setError("root", { message: "No changes made" });
        return;
      }
      try {
        detailsForm.reset();
        console.log(values);
        editPlaylistMutate({ ...values, id: playlistData.id });
        dialogClose();
      } catch (error) {
        console.error({ error }, "Failed to add playlist");
      }
    }
  );
  if (!playlist) return null;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="w-fit">
          Edit Playlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Playist</DialogTitle>
          <DialogDescription>
            Edit a playlist. Click Edit when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-5">
          <Form {...detailsForm}>
            <form onSubmit={onSubmitDetails} className="w-60 space-y-8">
              <FormField
                control={detailsForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your playlist display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailsForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your playlist description.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailsForm.control}
                name="readPrivacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Read Privacy</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PrivacyEnum.enum.private}>
                          Private
                        </SelectItem>
                        <SelectItem value={PrivacyEnum.enum.public}>
                          Public
                        </SelectItem>
                        <SelectItem value={PrivacyEnum.enum.invite}>
                          Invite-Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This is your playlist read privacy setting. It determines
                      who can view your playlist.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailsForm.control}
                name="writePrivacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Write Privacy</FormLabel>
                    <div className="flex items-center gap-3">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PrivacyEnum.enum.private}>
                            Private
                          </SelectItem>
                          <SelectItem value={PrivacyEnum.enum.public}>
                            Public
                          </SelectItem>
                          <SelectItem value={PrivacyEnum.enum.invite}>
                            Invite-Only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {detailsForm.getValues("writePrivacy") === "public" && (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle color="#ebce3d" size={28} />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                This allows any registered user to add and
                                remove tracks from your playlist.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <FormDescription>
                      This is your playlist write privacy setting. It determines
                      who can edit your playlist.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isLoadingPlaylistEdit} type="submit">
                Edit
              </Button>
              {detailsForm.formState.errors.root && (
                <span className="ml-2 text-destructive">
                  {detailsForm.formState.errors.root.message ?? ""}
                </span>
              )}
            </form>
          </Form>
          <Separator orientation="vertical" />
          <div className="flex flex-col items-center gap-5">
            <ScrollArea className="h-24 w-48 rounded-md border">
              <div className="p-4">
                <h4 className="mb-4 text-sm font-medium leading-none">
                  Collaborators
                </h4>
                <Separator className="my-2" />

                {playlist.playlist.collaborators.map((collab) => {
                  const status = collab.status;
                  const color =
                    status === "accepted"
                      ? "text-green-300"
                      : status === "declined"
                      ? "text-red-300"
                      : "text-yellow-300";
                  return (
                    <React.Fragment key={collab.id}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm" key={collab.id}>
                          {collab.user.name} -{" "}
                          <span className={color}>{status}</span>
                        </div>
                        {status === "declined" && (
                          <RotateCw
                            size={16}
                            className="cursor-pointer text-muted-foreground"
                            onClick={() => {
                              if (collab.user.id && !isLoadingInvite) {
                                try {
                                  inviteUserMutate({
                                    playlistId: playlist.playlist.id,
                                    invitedId: collab.user.id,
                                  });
                                } catch (error) {}
                              }
                            }}
                          />
                        )}
                      </div>
                      <Separator className="my-2" />
                    </React.Fragment>
                  );
                })}
              </div>
            </ScrollArea>
            <UserSearch
              playlistId={playlist.playlist.id}
              onClickResult={(userId) => {
                if (userId && !isLoadingInvite) {
                  try {
                    inviteUserMutate({
                      playlistId: playlist.playlist.id,
                      invitedId: userId,
                    });
                  } catch (error) {}
                }
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistEditDetailsDialog;
