import { useEffect, useState } from "react";
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
import { useNavigate, useSearchParams } from "react-router-dom";

interface UseSortableTableProps<T> {
  columns: ColumnDef<T>[];
  initialData: T[];
  initialPage?: number;
  initialPageSize?: number;
  initialFilter?: string;
  initialSortBy?: string;
  initialSortOrder?: string;
}

export function useSortableTable<T>({
  columns,
  initialData,
  initialPage = 0,
  initialPageSize = 10,
  initialFilter = "",
  initialSortBy = "",
  initialSortOrder = "asc",
}: UseSortableTableProps<T>) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Pagination, sorting, and filtering support
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
    updateSearchParams(pagination, sorting, globalFilter);
  }, [pagination, sorting, globalFilter]);

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
    if (sortingState.length > 0) {
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
  };

  const doPaginationChange = (updater: Updater<PaginationState>) => {
    const newPagination =
      typeof updater === "function" ? updater(pagination) : updater;

    setPagination(newPagination);
  };

  const doSortingChange = (updater: Updater<SortingState>) => {
    const newSorting =
      typeof updater === "function" ? updater(sorting) : updater;

    setSorting(newSorting);
  };

  const table = useReactTable({
    data: initialData,
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

  return {
    table,
    pagination,
    globalFilter,
    sorting,
    doGlobalFilterChange,
    doPaginationChange,
    doSortingChange,
  };
}
