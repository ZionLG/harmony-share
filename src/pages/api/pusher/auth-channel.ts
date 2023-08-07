import { type NextApiRequest, type NextApiResponse } from "next";
import { pusher } from "../../../server/pusher";
import { z } from "zod";
import { prisma } from "~/server/db";

export default function pusherAuthEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { channel_name, socket_id, userInfo } = z
    .object({
      channel_name: z.string(),
      socket_id: z.string(),
      userInfo: z.object({
        user_id: z.string(),
        user_name: z.string(),
        user_image: z.string(),
      }),
    })
    .required()
    .parse(req.body);

  if (!userInfo.user_id || typeof userInfo.user_id !== "string") {
    res.status(404).send("User Id required");
    return;
  }
  const auth = pusher.authorizeChannel(socket_id, channel_name, {
    user_id: userInfo.user_id,
    user_info: {
      name: userInfo.user_name,
      image: userInfo.user_image,
    },
  });
  res.send(auth);
}
