import React from 'react';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ListFilter, Search } from 'lucide-react';

import { Input } from './input';
import { Button } from './button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

interface TableListProps {
  showLegend : boolean;
  data: any[];
  columns: any[];
  isInputEnd?: boolean;
  showFilter?: boolean;
  inputPlaceholder?: string;
  rightElements?: React.ReactNode;
  onRowClick?: (rowData: any) => void;
}

export default function TableList({
  showLegend= true, 
  data,
  columns,
  isInputEnd = false,
  showFilter = false,
  rightElements,
  inputPlaceholder = 'Search by Grievance Subject',
  onRowClick,
}: TableListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const hasCheckboxColumn = columns.some((column) => column.id === 'select');
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const totalPages = table.getPageCount();
  const currentRangeStart = pageIndex * pageSize + 1;
  const currentRangeEnd = Math.min((pageIndex + 1) * pageSize, totalRows);
  const user = useSelector((state: RootState) => state.user);

  // Generate Pagination Buttons with Ellipses Logic
  const getPaginationButtons = () => {
    const maxVisibleButtons = 5;
    const buttons = [];

    if (totalPages <= maxVisibleButtons) {
      // If total pages are less than or equal to max visible buttons, show all
      for (let i = 0; i < totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Show the first, last, current, and surrounding pages
      const start = Math.max(0, pageIndex - 2);
      const end = Math.min(totalPages - 1, pageIndex + 2);

      if (start > 0) buttons.push(0); // Always show the first page
      if (start > 1) buttons.push('ellipsis-start'); // Show ellipsis before the range

      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }

      if (end < totalPages - 2) buttons.push('ellipsis-end'); // Show ellipsis after the range
      if (end < totalPages - 1) buttons.push(totalPages - 1); // Always show the last page
    }

    return buttons;
  };

  const paginationButtons = getPaginationButtons();

  return (
    <div className="w-full">
      <div className={`flex ${isInputEnd ? 'justify-end' : 'justify-start'} w-full`}>
        <div className="flex flex-col sm:flex-row w-full mb-6 sm:justify-between sm:items-center gap-2">
          <Input
            prefix={
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            }
            placeholder={inputPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full placeholder:text-gray-400 sm:w-72"
            type="text"
          />

          {showFilter && (
            <Button variant="outline" size="icon" className="p-4">
              <ListFilter className="h-4 w-4 text-secondary-foreground" />
            </Button>
          )}
          {rightElements}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="text-white ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-3 py-2 text-white">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick && onRowClick(row.original)} // <-- Trigger onRowClick here
                  className={`cursor-pointer ${
                    row.original?.isVisited === false &&
                    row.original?.modifiedBy?.toString() === user?.EmpCode?.toString()
                      ? 'bg-red-200 hover:bg-red-400'
                      : ''
                  } ${
                    row.original?.isTransferred &&
                    row.original?.statusId !== 3 &&
                    row.original?.assignedUserCode?.toString() === user?.EmpCode.toString()
                      ? 'bg-yellow-200 hover:bg-yellow-300'
                      : ''
                  }  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Color Legend */}
   {showLegend &&   <div className="flex gap-4 mt-2 mb-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-300 rounded"></div>
          <span>Transferred Cases</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-300 rounded"></div>
          <span>Closed Cases</span>
        </div>
      </div>}

      {/* Pagination */}
      <div className="flex flex-row justify-between items-center py-4">
        <div className="text-sm text-muted-foreground w-1/2">
          {hasCheckboxColumn
            ? `${table.getSelectedRowModel().flatRows.length} of ${totalRows} row(s) selected.`
            : `Showing ${currentRangeStart}-${currentRangeEnd} of ${totalRows}`}
        </div>
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationPrevious disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} />
              {paginationButtons.map((button, index) => {
                if (button === 'ellipsis-start' || button === 'ellipsis-end') {
                  return (
                    <PaginationEllipsis key={index} className="text-gray-400">
                      ...
                    </PaginationEllipsis>
                  );
                }
                return (
                  <PaginationItem key={button}>
                    <PaginationLink isActive={button === pageIndex} onClick={() => table.setPageIndex(button)}>
                      {button + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationNext disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} />
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
