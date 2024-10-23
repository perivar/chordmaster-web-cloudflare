import { ChangeEvent } from "react";
import { flexRender, Table as TanTable } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import { ISong } from "~/lib/firestoreQueries";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { DataTablePagination } from "./DataTablePagination";
import { CustomColumnDef } from "./SortableSongList";

interface ListItem {
  id?: string;
}

interface ListProps<T extends ListItem> {
  table: TanTable<T>;
  filterValue: string;
  onFilterChange: (filterValue: string) => void;
  placeholder?: string;
}

export default function SortableList<T extends ListItem>({
  table,
  filterValue,
  onFilterChange,
  placeholder = "Search",
}: ListProps<T>) {
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const filterQuery = e.target.value;
    onFilterChange(filterQuery);
  };

  return (
    <>
      <div className="flex justify-center">
        <div className="relative w-full max-w-md py-2">
          <Input
            placeholder={placeholder}
            value={filterValue}
            onChange={handleFilterChange}
            className="w-full pr-10"
          />
          {filterValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0"
              onClick={_ => onFilterChange("")}>
              <X className="size-4 text-muted-foreground" />
              <span className="sr-only">Clear filter</span>
            </Button>
          )}
        </div>
      </div>
      <Table className="w-full">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className={
                    (header.column.columnDef as CustomColumnDef<ISong, unknown>)
                      .hideOnMobile
                      ? "hidden md:table-cell"
                      : ""
                  }>
                  {header.isPlaceholder ? null : (
                    <div
                      className={`flex items-center space-x-2 ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={header.column.getToggleSortingHandler()}
                      onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronUp className="ml-2 size-4" />,
                        desc: <ChevronDown className="ml-2 size-4" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DataTablePagination table={table} />
    </>
  );
}
