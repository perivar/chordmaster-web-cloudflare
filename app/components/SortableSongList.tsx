// https://v0.dev/chat/RVaUfCf5axe

import { useMemo, useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { deleteSongReducer, useAppContext } from "~/context/AppContext";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ISong } from "~/lib/firestoreQueries";
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

import { useConfirm } from "./layout/confirm-provider";
import SortableList from "./SortableList";
import { useToast } from "./ui/use-toast";

interface ListProps {
  allItems: ISong[];
}

export default function SortableSongList({ allItems }: ListProps) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [songs, setSongs] = useState<ISong[]>(allItems);
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteSong } = useFirestore();
  const { dispatch } = useAppContext();

  const onFilterChange = useMemo(
    () => (itemFilter: string) => {
      if (itemFilter !== "") {
        const filteredItems = allItems.filter(
          s =>
            s.title.toLowerCase().includes(itemFilter.toLowerCase()) ||
            s.artist.name.toLowerCase().includes(itemFilter.toLowerCase())
        );
        setSongs(filteredItems);
      } else {
        // reset query
        setSongs(allItems);
      }
    },
    [allItems]
  );

  const columns = useMemo<ColumnDef<ISong>[]>(() => {
    const handleEdit = async (id: string | undefined) => {
      return navigate(`/songs/${id}/edit`);
    };

    const handleDelete = async (
      id: string | undefined,
      songTitle: string | undefined
    ) => {
      try {
        await confirm({
          title: `${t("song_delete")} (${songTitle})`,
          description: t("delete_permanently_are_you_sure"),
        });

        if (id) {
          await deleteSong(id);
          dispatch(deleteSongReducer(id));

          toast({
            title: t("info"),
            description: `${t("deleted_item_with_id")}: ${id}`,
            duration: 4000,
          });

          // reset query
          setSongs(allItems);
          return navigate(`/songs`);
        }
      } catch (_err) {
        // If the user cancels the confirmation, handle the rejection here
        console.log(`Delete operation was cancelled (id: ${id})`);
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
        cell: ({ row }) => (
          <div className="hidden md:table-cell">
            <Link to={`/artists/${row.original.artist.id}`}>
              {row.original.artist.name}
            </Link>
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
                    <Link to={`/artists/${row.original.artist.id}`}>
                      {t("go_to_artist")}
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
                      handleDelete(row.original.id, row.original.title)
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
    data: songs,
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
    <SortableList
      table={table}
      onFilterChange={onFilterChange}
      placeholder={t("search")}
    />
  );
}
