import { useRouter } from "next/router";

export default function PlaylistEditPage() {
  const router = useRouter();
  return <p>Playlist Edit Id: {router.query.slug}</p>;
}
