// app/routes/artists.$id.tsx

import { MetaFunction } from "@remix-run/cloudflare";
import { useParams } from "@remix-run/react";
import { useAppContext } from "~/context/AppContext";
import { useTranslation } from "react-i18next";

import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => [
  { title: "Artist" },
  { name: "description", content: "View Artist" },
];

export default function ArtistView() {
  const { t } = useTranslation();
  const params = useParams();
  const artistIdParam = params?.id;

  const { state } = useAppContext();
  const songs = state.songs;
  const artistSongs = songs.filter(s => s.artist.id === artistIdParam);

  return (
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-3 mt-7 flex w-full flex-row items-center">
        <div className="flex-1 text-center text-xl font-semibold">
          {t("songs_by_artist")}
        </div>
      </div>

      <SortableSongList allItems={artistSongs} />
    </div>
  );
}
