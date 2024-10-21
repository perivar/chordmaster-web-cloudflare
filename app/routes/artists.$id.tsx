// app/routes/artists.$id.tsx

import { MetaFunction } from "@remix-run/cloudflare";
import { useParams } from "@remix-run/react";
import { useAppContext } from "~/context/AppContext";

import Header from "~/components/Header";
import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => [
  { title: "Artist" },
  { name: "description", content: "View Artist" },
];

export default function ArtistView() {
  const params = useParams();
  const artistIdParam = params?.id;

  const { state } = useAppContext();
  const allSongs = state.songs;
  const allArtists = state.artists;
  const artist = allArtists.find(a => a.id === artistIdParam);

  const artistSongs = allSongs.filter(s => s.artist.id === artistIdParam);

  return (
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <Header title={artist?.name} />

      <SortableSongList allItems={artistSongs} />
    </div>
  );
}
