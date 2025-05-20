import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
// Import but mark as unused with underscore prefix in the import aliases
import {
  ChevronDown as _ChevronDown,
  ChevronUp as _ChevronUp,
  MoreHorizontal as _MoreHorizontal,
  Download as _Download,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";

interface Result {
  id: string;
  data: any;
  created_at: string;
}

interface ResultsTableProps {
  results: Result[];
  isLoading?: boolean;
}

export function ResultsTable({ results, isLoading = false }: ResultsTableProps) {
  const [_data, _setData] = useState<any[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [_columnFilters, _setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  
  // Generate columns dynamically based on the fields in the results
  const columns = useMemo(() => {
    if (!results || !results.length) {
      return [];
    }
    
    // Always include these metadata columns
    const baseColumns: ColumnDef<Result>[] = [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <div className="w-10">{row.getValue('id')}</div>,
      },
      {
        accessorKey: 'url',
        header: 'URL',
        cell: ({ row }) => {
          const url = row.original.data?.url || '';
          return (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate max-w-xs block"
            >
              {url}
            </a>
          );
        },
      },
      {
        accessorKey: 'extracted_at',
        header: 'Extracted At',
        cell: ({ row }) => {
          const date = row.original.data?.extracted_at ? 
            new Date(row.original.data.extracted_at) : 
            new Date(row.original.created_at);
          return date.toLocaleString();
        },
      },
    ];
    
    // Generate columns for each field in the data
    const fieldColumns: ColumnDef<Result>[] = [];
    const addedFields = new Set<string>();
    
    results.forEach(result => {
      if (result.data?.fields) {
        Object.keys(result.data.fields).forEach(fieldName => {
          if (!addedFields.has(fieldName)) {
            addedFields.add(fieldName);
            
            fieldColumns.push({
              accessorKey: `fields.${fieldName}`,
              header: fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/_/g, ' '),
              cell: ({ row }) => {
                const value = row.original.data?.fields?.[fieldName];
                return <div className="truncate max-w-xs">{value || '-'}</div>;
              },
            });
          }
        });
      }
    });
    
    return [...baseColumns, ...fieldColumns];
  }, [results]);
  
  // Create table instance
  const table = useReactTable({
    data: results,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  return (
    <div className="space-y-4">
      {/* Filter and column visibility controls */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter..."
          className="max-w-sm"
          onChange={(e) => {
            // Implement global filtering
          }}
          disabled={isLoading}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id.startsWith('fields.') 
                    ? column.id.replace('fields.', '') 
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Results table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading results...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
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
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage() || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage() || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 