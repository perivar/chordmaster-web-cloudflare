// app/routes/online._index.tsx

import { useEffect, useMemo, useState } from "react";
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
import { useFirebase } from "~/context/FirebaseContext";
import { type loader as parentLoader } from "~/root";
import { useTranslation } from "react-i18next";

import { ISong } from "~/lib/firestoreQueries";
import useFirestore from "~/hooks/useFirestore";
import EmptyListMessage from "~/components/EmptyListMessage";
import Header from "~/components/Header";
import LoadingIndicator from "~/components/LoadingIndicator";
import SortableList from "~/components/SortableList";

export const meta: MetaFunction = () => [
  { title: "Online Search" },
  { name: "description", content: "Online Search" },
];

export default function OnlineSearchView() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const loaderData = useRouteLoaderData<typeof parentLoader>("root");
  const initialPage = loaderData?.initialPage || 0;
  const initialPageSize = loaderData?.initialPageSize || 10;
  const initialFilter = loaderData?.initialFilter || "";
  const initialSortBy = loaderData?.initialSortBy || "";
  const initialSortOrder = loaderData?.initialSortOrder || "asc";

  const [limitCount] = useState<number | undefined>(undefined); // 20
  const [invertOwner] = useState(true); // change the behavior to the exact opposite, only get songs that the userId does not own
  const [onlyPublished] = useState(true); // only include published songs
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useFirebase();

  const [allSongs, setAllSongs] = useState<ISong[]>();

  const { getSongsByUserId } = useFirestore();

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

  useEffect(() => {
    const loadSongs = async () => {
      if (!user || !user.uid) return;

      try {
        setIsLoading(true);
        console.log(`Loading ${limitCount ?? "all"} songs ...`);

        const data = await getSongsByUserId(
          user.uid,
          limitCount,
          undefined,
          invertOwner,
          onlyPublished
        );

        console.log(`Found ${data.songs.length} songs ...`);

        if (data.songs.length > 0) {
          setAllSongs(data.songs);
        }
      } catch (error) {
        console.error("Error loading songs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSongs();
  }, []);

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
    return [
      {
        accessorKey: "title",
        header: t("song_title"),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              <Link to={`/songspreview/${row.original.id}`}>
                {row.original.title}
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
          <div>
            <div className="font-medium">{row.original.artist.name}</div>
          </div>
        ),
      },
    ];
  }, []);

  const table = useReactTable({
    data: allSongs ?? [],
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

  if (!allSongs) {
    return <EmptyListMessage message={t("artist_or_song_not_found")} />;
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <Header title={t("community_songs")} />

      <SortableList
        table={table}
        filterValue={globalFilter}
        onFilterChange={doGlobalFilterChange}
        placeholder={t("search")}
      />
    </div>
  );
}
