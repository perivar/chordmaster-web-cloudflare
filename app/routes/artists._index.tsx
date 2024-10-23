// app/routes/artists._index.tsx

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
import { useAppContext } from "~/context/AppContext";
import { type loader as parentLoader } from "~/root";
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
import Header from "~/components/Header";
import SortableList from "~/components/SortableList";

export const meta: MetaFunction = () => [
  { title: "Artists" },
  { name: "description", content: "View Artists" },
];

export default function ArtistsView() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const loaderData = useRouteLoaderData<typeof parentLoader>("root");
  const initialPage = loaderData?.initialPage || 0;
  const initialPageSize = loaderData?.initialPageSize || 10;
  const initialFilter = loaderData?.initialFilter || "";
  const initialSortBy = loaderData?.initialSortBy || "";
  const initialSortOrder = loaderData?.initialSortOrder || "asc";

  const { state } = useAppContext();

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
    data: state.artists,
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
