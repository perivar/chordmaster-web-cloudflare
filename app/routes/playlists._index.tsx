// app/routes/playlists._index.tsx

import { useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/cloudflare";
import { Link, useNavigate } from "@remix-run/react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  addOrUpdatePlaylistReducer,
  deletePlaylistReducer,
  useAppContext,
} from "~/context/AppContext";
import { useFirebase } from "~/context/FirebaseContext";
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
import { useConfirm } from "~/components/layout/confirm-provider";
import SortableList from "~/components/SortableList";
import { TextInputModal } from "~/components/TextInputModal";

export const meta: MetaFunction = () => [
  { title: "Playlists" },
  { name: "description", content: "View Playlists" },
];

export default function PlaylistsView() {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { state, dispatch } = useAppContext();
  const { user } = useFirebase();
  const allItems = state.playlists;
  const [playlists, setPlaylists] = useState<IPlaylist[]>(allItems);

  const [showAddPlaylistModal, setShowAddPlaylistModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deletePlaylist, addNewPlaylist } = useFirestore();

  const onFilterChange = useMemo(
    () => (itemFilter: string) => {
      if (itemFilter !== "") {
        const filteredItems = allItems.filter(s =>
          s.name.toLowerCase().includes(itemFilter)
        );
        setPlaylists(filteredItems);
      } else {
        // reset query
        setPlaylists(allItems);
      }
    },
    [allItems]
  );

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
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
    },
  });

  return (
    <div className="container mx-auto my-6">
      <div className="mb-2 flex w-full flex-row items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex-1 text-center text-xl">{t("playlists")}</div>
        <div className="ml-2 flex flex-1 flex-row items-center justify-end gap-2">
          <Button size="sm" onClick={() => setShowAddPlaylistModal(true)}>
            <PlusIcon className="size-4 " />
            <span className="ml-2 hidden sm:block">{t("add_playlist")}</span>
          </Button>
        </div>
      </div>

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
        onFilterChange={onFilterChange}
        placeholder={t("search")}
      />
    </div>
  );
}
