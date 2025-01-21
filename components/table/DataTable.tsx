"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilterInput from "../FilterTable";

import { useRouter } from "next/navigation";
import CreateEventPage from "@/app/create-event/page";
import { DateTimePicker } from "../DateTimePicker";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setSelectedRows: (rows: TData[]) => void;
  mutate: () => void;
}

export function CalendarEventTable<TData, TValue>({
  columns,
  data,
  setSelectedRows,
  mutate,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [filterDate, setFilterDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() - 40))
  );
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "date",
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "date",
      value: filterDate,
    },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [perPageCount, setPerPageCount] = useState(5);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: perPageCount, //custom default page size
      },
    },
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    table.setPageSize(perPageCount);
  }, [perPageCount]);

  useEffect(() => {
    setSelectedRows(
      table.getSelectedRowModel().rows.map((row) => row.original)
    );
  }, [rowSelection]);

  useEffect(() => {
    setColumnFilters([{ id: "date", value: filterDate }]);
  }, [filterDate]);

  return (
    <div className="h-full w-full">
      <div
        className="w-full md:w-full flex
      flex-col md:flex-row
      items-center justify-between mb-5"
      >
        <FilterInput table={table} />

        <div className="w-min flex items-center gap-2 md:gap-5 mt-3 md:mt-0">
          {/* <input
            type="date"
            value={filterDate.toString()}
            onChange={(e) => {
              setColumnFilters([
                { id: "date", value: new Date(e.target.value) },
              ]);
            }}
            className="w-36 md:w-40 h-9 px-3 md:px-4 rounded-md border text-black font-semibold text-sm cursor-pointer"
          /> */}

          <DateTimePicker setDate={setFilterDate} date={filterDate} />
          <CreateEventPage mutate={mutate} />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2 flex items-center">
          <Select
            value={perPageCount.toString()}
            onValueChange={(value) => setPerPageCount(Number(value))}
          >
            <SelectTrigger className="bg-[var(--bg)] text-[var(--textColor)] select">
              <SelectValue placeholder="value" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg)] text-[var(--textColor)]">
              <SelectItem value={"5"}>5</SelectItem>
              <SelectItem value={"10"}>10</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
