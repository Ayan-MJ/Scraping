"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ExtractedData, ColumnDef, SortDirection } from "@/app/results-viewer/page"

interface DataTableProps {
  data: ExtractedData[]
  columns: ColumnDef[]
  sortColumn: keyof ExtractedData
  sortDirection: SortDirection
  onSort: (columnId: keyof ExtractedData) => void
  currentPage: number
  totalItems: number
  itemsPerPage: number
  setCurrentPage: (page: number) => void
}

export function DataTable({
  data,
  columns,
  sortColumn,
  sortDirection,
  onSort,
  currentPage,
  totalItems,
  itemsPerPage,
  setCurrentPage,
}: DataTableProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const renderSortIcon = (columnId: keyof ExtractedData) => {
    if (sortColumn !== columnId) return null
    return sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
  }

  const formatValue = (value: any, columnId: string) => {
    if (value === null || value === undefined) return "-"

    if (columnId === "inStock") {
      return value ? "Yes" : "No"
    }

    if (value instanceof Date) {
      return value.toLocaleDateString()
    }

    if (typeof value === "string" && columnId === "description") {
      return value.length > 100 ? value.substring(0, 100) + "..." : value
    }

    if (typeof value === "string" && (columnId === "url" || columnId === "imageUrl")) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
          {value.length > 30 ? value.substring(0, 30) + "..." : value}
        </a>
      )
    }

    return value.toString()
  }

  return (
    <div className="space-y-4">
      {/* Top Pagination */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Previous page</span>
          <ArrowUp className="h-4 w-4 -rotate-90" />
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Next page</span>
          <ArrowUp className="h-4 w-4 rotate-90" />
        </Button>
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                      column.sortable && "cursor-pointer",
                    )}
                    onClick={() => column.sortable && onSort(column.accessor)}
                  >
                    <div className="flex items-center">
                      {column.name}
                      {column.sortable && renderSortIcon(column.accessor)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b transition-colors hover:bg-muted/50 duration-150",
                    index % 2 === 0 ? "bg-white" : "bg-muted/20",
                  )}
                >
                  {columns.map((column) => (
                    <td key={`${item.id}-${column.id}`} className="px-4 py-3 text-sm">
                      {formatValue(item[column.accessor], column.id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
