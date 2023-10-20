import React, { useState } from "react";
import { Progress, user } from "@nextui-org/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getInitials } from "~/utils/helperFunctions";
import { useSession } from "next-auth/react";
import { Camera } from "lucide-react";
import { Button } from "~/components/ui/button";

const FirstSteps = () => {
  const [progress, setProgress] = useState(1);
  const session = useSession();

  if (session.status !== "authenticated") return null;

  const user = session.data.user;
  return (
    <main className="flex min-h-screen flex-col gap-16 p-5">
      <Progress color="default" value={progress} size="sm" label="Progress" />
      <div className="flex flex-col items-center justify-center gap-3">
        <span className="text-7xl">Welcome to Harmony Share</span>
        <span className="text-5xl">Let&apos;s customize your profile.</span>
      </div>
      <div className="group flex cursor-pointer items-center gap-5 self-center">
        <Avatar className=" h-48 w-48  rounded-full  text-5xl outline group-hover:hidden">
          <AvatarImage src={user.image ?? ""} />
          <AvatarFallback>{getInitials(user.name ?? "")}</AvatarFallback>
        </Avatar>
        <Avatar className="hidden h-48 w-48 rounded-full  text-5xl outline group-hover:inline-block">
          <AvatarFallback>
            <Camera size={64} />
          </AvatarFallback>
        </Avatar>
        <span className="text-2xl">Change Image</span>
      </div>
      <div className="flex justify-around gap-5">
        <div className="flex flex-col gap-2">
          <Button variant={"outline"}>Skip</Button>
          <span className="text-sm ">You can always change it later..</span>
        </div>
        <Button variant={"positive"}> Save and Continue</Button>
      </div>
    </main>
  );
};

export default FirstSteps;
