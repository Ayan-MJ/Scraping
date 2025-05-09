"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ColumnDef, FilterState } from "@/app/results-viewer/page"

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  columns: ColumnDef[]
  filters: FilterState
  onFilterChange: (columnId: string, value: string) => void
  onClearFilters: () => void
}

export function FilterSidebar({
  isOpen,
  onClose,
  columns,
  filters,
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-80 bg-white border-l shadow-lg z-50 transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Filters</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            {columns.map((column) => (
              <div key={column.id} className="space-y-2">
                <Label htmlFor={`filter-${column.id}`} className="text-sm font-medium">
                  {column.name}
                </Label>
                <Input
                  id={`filter-${column.id}`}
                  placeholder={getFilterPlaceholder(column)}
                  value={filters[column.id] || ""}
                  onChange={(e) => onFilterChange(column.id, e.target.value)}
                  className="h-9"
                />
                {column.id === "price" && (
                  <p className="text-xs text-muted-foreground">
                    Use {">"}100 or {"<"}50 to filter by value
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t p-4">
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear All
            </Button>
            <Button size="sm" onClick={onClose} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getFilterPlaceholder(column: ColumnDef): string {
  switch (column.id) {
    case "price":
      return "e.g. >100 or <50"
    case "inStock":
      return "yes or no"
    case "rating":
      return "e.g. 4 or >3"
    case "dateAdded":
      return "e.g. 2025-05-01"
    default:
      return `Filter by ${column.name.toLowerCase()}`
  }
}
