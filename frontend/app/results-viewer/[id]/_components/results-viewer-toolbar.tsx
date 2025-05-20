"use client"

import { useState } from "react"
import { FilterIcon, RefreshCw, Download, ChevronDown, Eye, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ColumnDef, ColumnVisibility } from "@/app/results-viewer/page"

interface ResultsViewerToolbarProps {
  onFilterToggle: () => void
  filterOpen: boolean
  onRefresh: () => void
  columns: ColumnDef[]
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void
}

export function ResultsViewerToolbar({
  onFilterToggle,
  filterOpen,
  onRefresh,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
}: ResultsViewerToolbarProps) {
  const [showExportNotification, setShowExportNotification] = useState(false)

  const handleExport = (format: string) => {
    // In a real app, this would trigger a download
    setShowExportNotification(true)
    setTimeout(() => setShowExportNotification(false), 3000)
  }

  const handleWebhookTest = () => {
    // In a real app, this would send a test payload to the configured webhook
    alert("Test payload sent to webhook")
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filterOpen ? "default" : "outline"}
          size="sm"
          onClick={onFilterToggle}
          className={cn("gap-2", filterOpen && "bg-[#4F46E5] hover:bg-[#4338CA]")}
        >
          <FilterIcon className="h-4 w-4" />
          Filters
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              <span>Export as CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")}>
              <span>Export as JSON</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleWebhookTest}>
              <span>Send Test to Webhook</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-60">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Visible Columns</h4>
              <div className="grid gap-2">
                {columns.map((column) => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`column-${column.id}`}
                      checked={columnVisibility[column.id]}
                      onCheckedChange={(checked: boolean) => onColumnVisibilityChange(column.id, checked)}
                    />
                    <Label htmlFor={`column-${column.id}`} className="text-sm">
                      {column.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="icon" onClick={onRefresh} className="h-9 w-9">
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      {/* Export notification */}
      {showExportNotification && (
        <div className="absolute right-0 -bottom-12 p-3 bg-green-100 text-green-800 rounded-md flex items-center gap-2 border border-green-200 animate-in fade-in slide-in-from-top-5 duration-300">
          <Check className="h-4 w-4" />
          <span className="text-sm">Export started. Download will begin shortly.</span>
        </div>
      )}
    </div>
  )
}
