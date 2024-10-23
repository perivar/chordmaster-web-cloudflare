// app/routes/playlists._index.tsx

import { useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/cloudflare";
import {
  Link,
  useNavigate,
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
import {
  addOrUpdatePlaylistReducer,
  deletePlaylistReducer,
  useAppContext,
} from "~/context/AppContext";
import { useFirebase } from "~/context/FirebaseContext";
import { type loader as parentLoader } from "~/root";
import { Edit, MoreHorizontal, PlusIcon, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IPlaylist } from "~/lib/firestoreQueries";
import useFirestore from "~/hooks/useFirestore";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Header from "~/components/Header";
import { useConfirm } from "~/components/layout/confirm-provider";
import SortableList from "~/components/SortableList";
import { TextInputModal } from "~/components/TextInputModal";

export const meta: MetaFunction = () => [
  { title: "Playlists" },
  { name: "description", content: "View Playlists" },
];

export default function PlaylistsView() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const loaderData = useRouteLoaderData<typeof parentLoader>("root");
  const initialPage = loaderData?.initialPage || 0;
  const initialPageSize = loaderData?.initialPageSize || 10;
  const initialFilter = loaderData?.initialFilter || "";
  const initialSortBy = loaderData?.initialSortBy || "";
  const initialSortOrder = loaderData?.initialSortOrder || "asc";

  const confirm = useConfirm();
  const { state, dispatch } = useAppContext();
  const { user } = useFirebase();
  const allItems = state.playlists;
  const [playlists, _setPlaylists] = useState<IPlaylist[]>(allItems);

  const [showAddPlaylistModal, setShowAddPlaylistModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deletePlaylist, addNewPlaylist } = useFirestore();

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

  const onSubmit = async (playlistName: string) => {
    try {
      if (playlistName === "") {
        throw new Error(t("empty_name_not_allowed"));
      }

      if (user && user.uid) {
        const playlist = await addNewPlaylist(
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
          playlistName,
          []
        );

        console.log("onSubmit -> addNewPlaylist:", playlist.id);

        await dispatch(addOrUpdatePlaylistReducer(playlist));

        setShowAddPlaylistModal(false);
        // setPlaylists(Playlist.getAll());
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        throw e;
      }
    }
  };

  const columns = useMemo<ColumnDef<IPlaylist>[]>(() => {
    const handleEdit = async (id: string | undefined) => {
      return navigate(`/playlists/${id}/edit`);
    };

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

          console.log(`Deleted item with id: ${id}`);

          navigate(`/playlists`);
        }
      } catch (_err) {
        // If the user cancels the confirmation, handle the rejection here
        console.log(`Delete operation was cancelled (id: ${id})`);
      }
    };

    return [
      {
        accessorKey: "name",
        header: t("playlist_name"),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              <Link to={`/playlists/${row.original.id}`}>
                {row.original.name}
              </Link>
            </div>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="size-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link to={`/playlists/${row.original.id}`}>
                      {t("go_to_playlist")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
                    <Edit className="mr-2 size-4" />
                    {t("edit")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      handleDelete(row.original.id, row.original.name)
                    }>
                    <Trash2 className="mr-2 size-4" />
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ];
  }, []);

  const table = useReactTable({
    data: playlists,
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

  return (
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <Header
        title={t("playlists")}
        rightButtons={[
          <Button
            key="add_playlist"
            size="sm"
            onClick={() => setShowAddPlaylistModal(true)}>
            <PlusIcon className="size-4" />
            <span className="ml-2 hidden sm:block">{t("add_playlist")}</span>
          </Button>,
        ]}
      />

      <TextInputModal
        error={error}
        enabled={showAddPlaylistModal}
        dialogTitle={t("add_playlist")}
        onDismiss={() => {
          setError(null);
          setShowAddPlaylistModal(false);
        }}
        dismissButtonTitle={t("permission_button_negative")}
        onSubmit={onSubmit}
        submitButtonTitle={t("permission_button_positive")}
        placeholder={t("playlist_name")}
      />

      <SortableList
        table={table}
        filterValue={globalFilter}
        onFilterChange={doGlobalFilterChange}
        placeholder={t("search")}
      />
    </div>
  );
}
