import { type NextApiRequest, type NextApiResponse } from "next";
import { pusher } from "../../../server/pusher";
import { z } from "zod";

export default function pusherAuthUserEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { socket_id } = z.object({ socket_id: z.string() }).parse(req.body);
  const { user_id } = req.headers;

  if (!user_id || typeof user_id !== "string") {
    res.status(404).send("lol");
    return;
  }
  const auth = pusher.authenticateUser(socket_id, {
    id: user_id,
    name: "theo",
  });
  res.send(auth);
}
