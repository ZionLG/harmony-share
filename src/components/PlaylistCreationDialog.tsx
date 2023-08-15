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
import { detailsFormSchema, PrivacyEnum } from "~/utils/formSchemas";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/utils/api";
import { AlertCircle } from "lucide-react";

const PlaylistCreationDialog = () => {
  const form = useForm<z.infer<typeof detailsFormSchema>>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues: {
      name: "",
      description: "",
      readPrivacy: "private",
      writePrivacy: "private",
    },
  });
  const utils = api.useContext();

  const { mutate, isLoading } = api.playlist.create.useMutation({
    onSuccess: () => {
      void utils.playlist.getOwned.invalidate();
    },
  });
  const dialogClose = () => {
    document.getElementById("closeDialog")?.click();
  };
  const onSubmit = form.handleSubmit(
    (values: z.infer<typeof detailsFormSchema>) => {
      if (isLoading) return;

      try {
        form.reset();
        console.log(values);
        mutate(values);
        dialogClose();
      } catch (error) {
        console.error({ error }, "Failed to add playlist");
      }
    }
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Playlist</Button>
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

export default PlaylistCreationDialog;
