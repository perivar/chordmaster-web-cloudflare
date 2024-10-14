// app/routes/artists.$id.tsx

import { MetaFunction } from "@remix-run/cloudflare";
import { useParams } from "@remix-run/react";
import { useAppContext } from "~/context/AppContext";

import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => [
  { title: "Artist" },
  { name: "description", content: "View Artist" },
];

export default function ArtistView() {
  const params = useParams();
  const artistIdParam = params?.id;

  const { state } = useAppContext();
  const songs = state.songs;
  const artistSongs = songs.filter(s => s.artist.id === artistIdParam);

  return (
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <SortableSongList allItems={artistSongs} />
    </div>
  );
}
