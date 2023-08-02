import React from "react";
import Head from "next/head";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
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

import { Textarea } from "~/components/ui/textarea";
import { api } from "~/utils/api";

const Dashboard = () => {
  return (
    <>
      <Head>
        <title>Harmony Share - Dashboard</title>
        <meta name="description" content="Harmoney share's dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col p-5">
        <div>
          <div className="flex justify-between">
            <span className="text-3xl font-semibold text-primary">
              Dashboard
            </span>
            <PlaylistCreationDialog />
          </div>
          <Separator className="my-4" />
        </div>
        <div className="flex flex-col items-center gap-2"></div>
      </main>
    </>
  );
};
const PrivacyEnum = z.enum(["private", "public", "invite"], {
  invalid_type_error: "Invalid privacy type",
  required_error: "Privacy setting is required",
});
const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30),
  description: z
    .string()
    .max(100, {
      message: "Description must be less than 100 characters.",
    })
    .optional(),
  privacy: PrivacyEnum,
});

const PlaylistCreationDialog = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "private",
    },
  });
  const { mutate, isLoading } = api.playlist.create.useMutation();
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
              name="privacy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy</FormLabel>
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
                    This is your playlist privacy setting.
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
export default Dashboard;
