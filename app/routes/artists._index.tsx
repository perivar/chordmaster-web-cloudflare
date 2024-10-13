// app/routes/artists._index.tsx

import { useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useAppContext } from "~/context/AppContext";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IArtist } from "~/lib/firestoreQueries";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import SortableList from "~/components/SortableList";

export const meta: MetaFunction = () => [
  { title: "Artists" },
  { name: "description", content: "View Artists" },
];

export default function ArtistsView() {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);

  const { state } = useAppContext();
  const allItems = state.artists;
  const [artists, setArtists] = useState<IArtist[]>(allItems);

  const onFilterChange = useMemo(
    () => (itemFilter: string) => {
      if (itemFilter !== "") {
        const filteredItems = allItems.filter(s =>
          s.name.toLowerCase().includes(itemFilter)
        );
        setArtists(filteredItems);
      } else {
        // reset query
        setArtists(allItems);
      }
    },
    [allItems]
  );

  const columns = useMemo<ColumnDef<IArtist>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("artist_name"),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              <Link to={`/artists/${row.original.id}`}>
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
                    <Link to={`/artists/${row.original.id}`}>
                      {t("go_to_artist")}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: artists,
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
      <div className="mb-3 mt-7 flex w-full flex-row items-center">
        <div className="flex-1 text-center text-xl">{t("artists")}</div>
      </div>

      <SortableList
        table={table}
        onFilterChange={onFilterChange}
        placeholder={t("search")}
      />
    </div>
  );
}
