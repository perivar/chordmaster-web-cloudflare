// app/routes/playlists.$id.tsx

import { useState } from "react";
import { MetaFunction } from "@remix-run/cloudflare";
import {
  Link,
  useNavigate,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { deletePlaylistReducer, useAppContext } from "~/context/AppContext";
import { type loader as parentLoader } from "~/root";
import { Edit2Icon, PlusIcon, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ISong } from "~/lib/firestoreQueries";
import useFirestore from "~/hooks/useFirestore";
import { Button } from "~/components/ui/button";
import Header from "~/components/Header";
import { useConfirm } from "~/components/layout/confirm-provider";
import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => [
  { title: "Playlist" },
  { name: "description", content: "View Playlist" },
];

export default function PlaylistView() {
  const { t } = useTranslation();
  const params = useParams();
  const playlistIdParam = params?.id;

  const loaderData = useRouteLoaderData<typeof parentLoader>("root");

  const navigate = useNavigate();
  const confirm = useConfirm();

  const { state, dispatch } = useAppContext();
  const allSongs = state.songs;
  const allPlaylists = state.playlists;
  const playlist = allPlaylists.find(a => a.id === playlistIdParam);

  const { deletePlaylist } = useFirestore();

  // Use type guard to filter out undefined values
  const notUndefined = (anyValue: ISong | undefined): anyValue is ISong =>
    anyValue !== undefined;
  const playlistSongs = playlist?.songIds
    .map(id => allSongs.find(s => s.id === id))
    .filter(notUndefined);

  const [songs, _setSongs] = useState<ISong[]>(playlistSongs ?? []);

  const handleDelete = async (
    id: string | undefined,
    playlistName: string | undefined
  ) => {
    try {
      await confirm({
        title: `${t("playlist_delete")} (${playlistName})`,
        description: t("delete_permanently_are_you_sure"),
      });

      if (id) {
        await deletePlaylist(id);
        dispatch(deletePlaylistReducer(id));

        console.log(`Deleted playlist with id: ${id}`);
        navigate(`/playlists`);
      }
    } catch (_err) {
      // If the user cancels the confirmation, handle the rejection here
      console.log(`Delete operation was cancelled (id: ${id})`);
    }
  };

  if (!songs) return null;

  return (
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <Header
        title={playlist?.name}
        leftButtons={[
          <Button
            key="delete"
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(playlist?.id, playlist?.name)}>
            <Trash2 className="size-4" />
            <span className="ml-2 hidden sm:block">{t("playlist_delete")}</span>
          </Button>,
        ]}
        rightButtons={[
          <Button key="edit" asChild size="sm">
            <Link to={`/playlists/${playlist?.id}/edit`}>
              <Edit2Icon className="size-4" />
              <span className="ml-2 hidden sm:block">{t("playlist_edit")}</span>
            </Link>
          </Button>,
          <Button key="add-songs" asChild size="sm">
            <Link to={`/playlists/${playlist?.id}/addsongs`}>
              <PlusIcon className="size-4" />
              <span className="ml-2 hidden sm:block">{t("add_songs")}</span>
            </Link>
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
