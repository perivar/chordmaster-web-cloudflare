import { Table as TanTable } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DataTablePaginationProps<TData> {
  table: TanTable<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-between px-4 md:flex-row">
      <div className="w-full flex-1 text-sm text-muted-foreground md:w-auto">
        {/* Display row count or selection details */}
        {/* {table.getFilteredSelectedRowModel().rows.length} of
        {table.getFilteredRowModel().rows.length} row(s) selected. */}
      </div>
      <div className="flex w-full flex-wrap items-center justify-between space-x-5 md:mr-5 md:w-auto">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap text-sm font-medium">
            {t("rows_per_page")}
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={value => {
              table.setPageSize(Number(value));
            }}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map(pageSize => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center text-sm font-medium">
          {t("page")} {table.getState().pagination.pageIndex + 1} {t("of")}{" "}
          {table.getPageCount()}
        </div>
      </div>
      <div className="mt-4 flex items-center space-x-2 md:mt-0">
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}>
          <span className="sr-only">{t("go_to_first_page")}</span>
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          <span className="sr-only">{t("go_to_previous_page")}</span>
          <ChevronLeftIcon className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          <span className="sr-only">{t("go_to_next_page")}</span>
          <ChevronRightIcon className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}>
          <span className="sr-only">{t("go_to_last_page")}</span>
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
