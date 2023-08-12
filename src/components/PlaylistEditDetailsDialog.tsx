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
import { AlertCircle } from "lucide-react";
import { Separator } from "./ui/separator";
import { detailsFormSchema, PrivacyEnum } from "~/utils/formSchemas";
import { type z } from "zod";
import UserSearch from "./UserSearch";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { type TRPCClientErrorLike } from "@trpc/react-query";

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

  const { mutate, isLoading } = api.playlist.edit.useMutation({
    onSuccess: () => {
      void utils.playlist.getOwned.invalidate();
      void utils.playlist.getPlaylist.invalidate();
    },
  });

  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null
  );

  const dialogClose = () => {
    document.getElementById("closeDialog")?.click();
  };
  const onSubmitDetails = detailsForm.handleSubmit(
    (values: z.infer<typeof detailsFormSchema>) => {
      if (isLoading) return;
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
        mutate({ ...values, id: playlistData.id });
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
              <Button disabled={isLoading} type="submit">
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

          <UserSearch
            playlistId={playlist.playlist.id}
            setSelectedUserId={setSelectedUserId}
          />

          <span>{selectedUserId}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistEditDetailsDialog;
