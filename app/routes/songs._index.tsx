// app/routes/songs._index.tsx

import type { MetaFunction } from "@remix-run/cloudflare";
import { useNavigate, useRouteLoaderData } from "@remix-run/react";
import { useAppContext } from "~/context/AppContext";
import { type loader as parentLoader } from "~/root";
import { EarthIcon, PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import Header from "~/components/Header";
import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => {
  return [{ title: "Songs" }, { name: "description", content: "View Songs" }];
};

export default function SongsView() {
  const { t } = useTranslation();
  const loaderData = useRouteLoaderData<typeof parentLoader>("root");

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
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <Header
        title={t("songs")}
        rightButtons={[
          <Button
            key="add_song_url"
            size="sm"
            onClick={handleAddNewSongUsingUrl}>
            <EarthIcon className="size-4" />
            <span className="ml-2 hidden sm:block">
              {t("add_song_using_url")}
            </span>
          </Button>,
          <Button key="add_song" size="sm" onClick={handleAddNewSong}>
            <PlusIcon className="size-4" />
            <span className="ml-2 hidden sm:block">{t("add_song")}</span>
          </Button>,
        ]}
      />

      <SortableSongList
        initialData={songs}
        initialPage={loaderData?.initialPage}
        initialPageSize={loaderData?.initialPageSize}
        initialFilter={loaderData?.initialFilter}
        initialSortBy={loaderData?.initialSortBy}
        initialSortOrder={loaderData?.initialSortOrder}
      />
    </div>
  );
}
