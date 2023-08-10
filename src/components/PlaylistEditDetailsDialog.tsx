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
import * as z from "zod";
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

const PrivacyEnum = z.enum(["private", "public", "invite"], {
  invalid_type_error: "Invalid privacy type",
  required_error: "Privacy setting is required",
});
const formSchema = z
  .object({
    name: z
      .string()
      .min(2, {
        message: "name must be at least 2 characters.",
      })
      .max(30),
    description: z
      .string()
      .max(100, {
        message: "Description must be less than 100 characters.",
      })
      .optional(),
    writePrivacy: PrivacyEnum,
    readPrivacy: PrivacyEnum,
  })
  .superRefine((data, ctx) => {
    if (data.readPrivacy === "invite" && data.writePrivacy === "public") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "You can't have a public write privacy with an invite read privacy.",
        path: ["writePrivacy"],
      });
      return false;
    } else if (
      data.readPrivacy === "private" &&
      data.writePrivacy !== "private"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "You can't have a non-private write privacy with a private read privacy.",
        path: ["writePrivacy"],
      });
      return false;
    }
  });

type PlaylistEditDetailsDialogProps = {
  name: string;
  description: string | null;
  writePrivacy: "private" | "public" | "invite";
  readPrivacy: "private" | "public" | "invite";
};
const PlaylistEditDetailsDialog = ({
  description,
  name,
  readPrivacy,
  writePrivacy,
}: PlaylistEditDetailsDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name,
      description: description ?? "",
      readPrivacy: readPrivacy,
      writePrivacy: writePrivacy,
    },
  });
  const utils = api.useContext();

  const { mutate, isLoading } = api.playlist.edit.useMutation({
    onSuccess: () => {
      void utils.playlist.getOwned.invalidate();
      void utils.playlist.getPlaylist.invalidate();
    },
  });
  const dialogClose = () => {
    document.getElementById("closeDialog")?.click();
  };
  const onSubmit = form.handleSubmit((values: z.infer<typeof formSchema>) => {
    if (isLoading) return;

    try {
      form.reset();
      console.log(values);
      mutate(values);
      dialogClose();
    } catch (error) {
      console.error({ error }, "Failed to add playlist");
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="w-fit">
          Edit Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Playist</DialogTitle>
          <DialogDescription>
            Create a new playlist. Click create when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8">
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
              name="readPrivacy"
              rules={{
                validate: {
                  required: () => {
                    console.log("Running validation");
                    if (
                      form.getValues("readPrivacy") === "invite" &&
                      form.getValues("writePrivacy") === "public"
                    ) {
                      return "You cannot have a public write privacy with an invite-only read privacy";
                    } else if (
                      form.getValues("readPrivacy") === "private" &&
                      form.getValues("writePrivacy") !== "private"
                    ) {
                      return "You cannot have a private read privacy with a non-private write privacy";
                    }
                    return true;
                  },
                },
              }}
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
              control={form.control}
              name="writePrivacy"
              rules={{
                validate: () => {
                  console.log("Running validation");
                  if (
                    form.getValues("readPrivacy") === "invite" &&
                    form.getValues("writePrivacy") === "public"
                  ) {
                    return false;
                  } else if (
                    form.getValues("readPrivacy") === "private" &&
                    form.getValues("writePrivacy") !== "private"
                  ) {
                    return false;
                  }
                  return true;
                },
              }}
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
                    {form.getValues("writePrivacy") === "public" && (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle color="#ebce3d" size={28} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              This allows any registered user to add and remove
                              tracks from your playlist.
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
              Create
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistEditDetailsDialog;
