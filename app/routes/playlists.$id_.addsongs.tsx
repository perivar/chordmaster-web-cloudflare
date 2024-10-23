// app/routes/playlists.$id_edit.tsx

import { useMemo, useState } from "react";
import {
  Link,
  MetaFunction,
  useNavigate,
  useParams,
  useRouteLoaderData,
  useSearchParams,
} from "@remix-run/react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import { useAppContext } from "~/context/AppContext";
import { type loader as parentLoader } from "~/root";
import { Check, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ISong } from "~/lib/firestoreQueries";
import useFirestoreMethods from "~/hooks/useFirestoreMethods";
import { Button } from "~/components/ui/button";
import Header from "~/components/Header";
import SortableList from "~/components/SortableList";

export const meta: MetaFunction = () => [
  { title: "Edit Playlist" },
  { name: "description", content: "Edit Playlist" },
];

export default function PlaylistAddSongs() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const params = useParams();
  const playlistIdParam = params?.id;

  const loaderData = useRouteLoaderData<typeof parentLoader>("root");
  const initialPage = loaderData?.initialPage || 0;
  const initialPageSize = loaderData?.initialPageSize || 10;
  const initialFilter = loaderData?.initialFilter || "";
  const initialSortBy = loaderData?.initialSortBy || "";
  const initialSortOrder = loaderData?.initialSortOrder || "asc";

  const { state } = useAppContext();
  const allSongs = state.songs;
  const allPlaylists = state.playlists;
  const playlist = allPlaylists.find(a => a.id === playlistIdParam);

  const [error, setError] = useState<string | null>(null);

  const [songs, setSongs] = useState<ISong[]>(allSongs);

  const { hasPlaylistContainsSong, playlistAddSong, playlistRemoveSong } =
    useFirestoreMethods();

  // pagination, sorting and filtering support
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPage,
    pageSize: initialPageSize,
  });
  const [globalFilter, setGlobalFilter] = useState<string>(initialFilter);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: initialSortBy,
      desc: initialSortOrder === "desc",
    },
  ]);

  const updateSearchParams = (
    paginationState: PaginationState,
    sortingState: SortingState,
    filterState: string
  ) => {
    const params = new URLSearchParams(searchParams);

    // Pagination
    if (paginationState) {
      params.set("page", paginationState.pageIndex.toString());
      params.set("pageSize", paginationState.pageSize.toString());
    } else {
      params.delete("page");
      params.delete("pageSize");
    }

    // Sorting
    if (sortingState?.length > 0) {
      params.set("sortBy", sortingState[0].id);
      params.set("sortOrder", sortingState[0].desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }

    // Filter
    if (filterState) {
      params.set("filter", filterState);
    } else {
      params.delete("filter");
    }

    navigate(`?${params.toString()}`, { replace: true });
  };

  const doGlobalFilterChange = (filterValue: string) => {
    setGlobalFilter(filterValue);

    const currentPagination = table.getState().pagination;
    const currentSorting = table.getState().sorting;

    updateSearchParams(currentPagination, currentSorting, filterValue);
  };

  const doPaginationChange = (updater: Updater<unknown>) => {
    const newPagination =
      typeof updater === "function" ? updater(pagination) : updater;

    setPagination(newPagination);

    const currentSorting = table.getState().sorting;
    const currentFilter = table.getState().globalFilter;

    updateSearchParams(newPagination, currentSorting, currentFilter);
  };

  const doSortingChange = (updater: Updater<unknown>) => {
    const newSorting =
      typeof updater === "function" ? updater(sorting) : updater;

    setSorting(newSorting);

    const currentPagination = table.getState().pagination;
    const currentFilter = table.getState().globalFilter;

    updateSearchParams(currentPagination, newSorting, currentFilter);
  };

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

  const table = useReactTable({
    data: songs,
    columns,

    state: {
      pagination,
      globalFilter,
      sorting,
    },

    // call local methods to perform the changes
    onGlobalFilterChange: doGlobalFilterChange,
    onPaginationChange: doPaginationChange,
    onSortingChange: doSortingChange,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
