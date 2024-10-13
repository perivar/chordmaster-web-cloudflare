// app/routes/songs._index.tsx

import type { MetaFunction } from "@remix-run/cloudflare";
import { useNavigate } from "@remix-run/react";
import { useAppContext } from "~/context/AppContext";
import { EarthIcon, PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => {
  return [{ title: "Songs" }, { name: "description", content: "View Songs" }];
};

export default function SongsView() {
  const { t } = useTranslation();

  const { state } = useAppContext();
  const songs = state.songs;

  const navigate = useNavigate();

  const handleAddNewSongUsingUrl = () => {
    return navigate(`/songs/addurl`);
  };

  const handleAddNewSong = () => {
    return navigate(`/songs/new/edit`);
  };

  return (
    <div className="container mx-auto my-6">
      <div className="mb-2 flex w-full flex-row items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex-1 text-center text-xl">{t("songs")}</div>
        <div className="ml-2 flex flex-1 flex-row items-center justify-end gap-2">
          <Button size="sm" onClick={handleAddNewSongUsingUrl}>
            <EarthIcon className="size-4 " />
            <span className="ml-2 hidden sm:block">
              {t("add_song_using_url")}
            </span>
          </Button>
          <Button size="sm" onClick={handleAddNewSong}>
            <PlusIcon className="size-4 " />
            <span className="ml-2 hidden sm:block">{t("add_song")}</span>
          </Button>
        </div>
      </div>
      <SortableSongList allItems={songs} />
    </div>
  );
}
