// app/routes/playlists.$id_edit.tsx

import { useMemo, useState } from "react";
import {
  Link,
  MetaFunction,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { useAppContext } from "~/context/AppContext";
import { type loader as parentLoader } from "~/root";
import { Check, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ISong } from "~/lib/firestoreQueries";
import useFirestoreMethods from "~/hooks/useFirestoreMethods";
import { useSortableTable } from "~/hooks/useSortableTable";
import { Button } from "~/components/ui/button";
import Header from "~/components/Header";
import SortableList from "~/components/SortableList";

export const meta: MetaFunction = () => [
  { title: "Edit Playlist" },
  { name: "description", content: "Edit Playlist" },
];

export default function PlaylistAddSongs() {
  const { t } = useTranslation();

  const params = useParams();
  const playlistIdParam = params?.id;

  const loaderData = useRouteLoaderData<typeof parentLoader>("root");

  const { state } = useAppContext();
  const allSongs = state.songs;
  const allPlaylists = state.playlists;
  const playlist = allPlaylists.find(a => a.id === playlistIdParam);

  const [error, setError] = useState<string | null>(null);

  const { hasPlaylistContainsSong, playlistAddSong, playlistRemoveSong } =
    useFirestoreMethods();

  const columns = useMemo<ColumnDef<ISong>[]>(() => {
    const onSelectSong = async (id: string, _title: string) => {
      // console.log("Selecting song:", title);
      const song = allSongs.find(s => s.id === id);
      if (song && song.id && playlist && playlist.id) {
        if (hasPlaylistContainsSong(playlist.id, song.id)) {
          try {
            await playlistRemoveSong(playlist.id, song.id);
          } catch (e) {
            if (e instanceof Error) {
              setError(e.message);
            } else {
              throw e;
            }
          }
        } else {
          try {
            await playlistAddSong(playlist.id, song.id);
          } catch (e) {
            if (e instanceof Error) {
              setError(e.message);
            } else {
              throw e;
            }
          }
        }
      }
    };

    return [
      {
        accessorKey: "title",
        header: t("song_title"),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              <Link to={`/songs/${row.original.id}`}>{row.original.title}</Link>
            </div>
            <div className="text-sm text-muted-foreground md:hidden">
              <Link to={`/artists/${row.original.artist.id}`}>
                {row.original.artist.name}
              </Link>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "artist.name",
        header: t("artist_name"),
        hideOnMobile: true, // Custom field to hide this column on mobile
        cell: ({ row }) => (
          <div className="hidden md:table-cell">
            <Link to={`/artists/${row.original.artist.id}`}>
              {row.original.artist.name}
            </Link>
          </div>
        ),
      },
      {
        // Last column for the icon
        id: "action", // Add an id for custom columns without accessorKey
        header: t("add_to_playlist"),
        cell: ({ row }) => {
          if (
            !playlist ||
            !playlist.id ||
            !playlist.songIds ||
            !row.original.id
          ) {
            return null; // Handle undefined playlist or songIds safely
          }

          const isInPlaylist = hasPlaylistContainsSong(
            playlist.id,
            row.original.id
          );

          return (
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  onSelectSong(row.original.id!, row.original.title)
                }>
                {isInPlaylist ? (
                  <Check className="text-green-500" />
                ) : (
                  <Plus className="text-blue-500" />
                )}
              </Button>
            </div>
          );
        },
      },
    ];
  }, [
    allSongs,
    hasPlaylistContainsSong,
    playlist,
    playlistAddSong,
    playlistRemoveSong,
    t,
  ]);

  const { table, globalFilter, doGlobalFilterChange } = useSortableTable<ISong>(
    {
      columns,
      initialData: state.songs || [],
      initialPage: loaderData?.initialPage,
      initialPageSize: loaderData?.initialPageSize,
      initialFilter: loaderData?.initialFilter,
      initialSortBy: loaderData?.initialSortBy,
      initialSortOrder: loaderData?.initialSortOrder,
    }
  );

  if (!playlist) return null;

  return (
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      {error && <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>}
      <Header title={playlist?.name} />

      <SortableList
        table={table}
        filterValue={globalFilter}
        onFilterChange={doGlobalFilterChange}
        placeholder={t("search")}
      />
    </div>
  );
}
