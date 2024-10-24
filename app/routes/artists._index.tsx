// app/routes/artists._index.tsx

import { useMemo } from "react";
import { MetaFunction } from "@remix-run/cloudflare";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { useAppContext } from "~/context/AppContext";
import { type loader as parentLoader } from "~/root";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IArtist } from "~/lib/firestoreQueries";
import { useSortableTable } from "~/hooks/useSortableTable";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Header from "~/components/Header";
import SortableList from "~/components/SortableList";

export const meta: MetaFunction = () => [
  { title: "Artists" },
  { name: "description", content: "View Artists" },
];

export default function ArtistsView() {
  const { t } = useTranslation();

  const loaderData = useRouteLoaderData<typeof parentLoader>("root");

  const { state } = useAppContext();

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

  const { table, globalFilter, doGlobalFilterChange } =
    useSortableTable<IArtist>({
      columns,
      initialData: state.artists,
      initialPage: loaderData?.initialPage,
      initialPageSize: loaderData?.initialPageSize,
      initialFilter: loaderData?.initialFilter,
      initialSortBy: loaderData?.initialSortBy,
      initialSortOrder: loaderData?.initialSortOrder,
    });

  return (
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <Header title={t("artists")} />

      <SortableList
        table={table}
        filterValue={globalFilter}
        onFilterChange={doGlobalFilterChange}
        placeholder={t("search")}
      />
    </div>
  );
}
