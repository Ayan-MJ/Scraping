"use client"

import { useState, useEffect } from "react"
import { ResultsViewerHeader } from "./[id]/_components/results-viewer-header"
import { ResultsViewerToolbar } from "./[id]/_components/results-viewer-toolbar"
import { DataTable } from "./[id]/_components/data-table"
import { FilterSidebar } from "./[id]/_components/filter-sidebar"
import { StatsSidebar } from "./[id]/_components/stats-sidebar"
import { EmptyState } from "./[id]/_components/empty-state"
import { ResultsViewerFooter } from "./[id]/_components/results-viewer-footer"
import { TableSkeleton } from "./[id]/_components/table-skeleton"

export type SortDirection = "asc" | "desc"
export type ColumnVisibility = Record<string, boolean>
export type FilterState = Record<string, string>
export type SavedView = {
  id: string
  name: string
  filters: FilterState
  visibleColumns: ColumnVisibility
}

// Sample data structure for the extracted data
export interface ExtractedData {
  id: string
  title: string
  price: string
  description: string
  category: string
  rating: number
  inStock: boolean
  dateAdded: Date
  url: string
  imageUrl: string
}

export type ColumnDef = {
  id: string
  name: string
  accessor: keyof ExtractedData
  sortable: boolean
  defaultVisible: boolean
}

export default function ResultsViewerPage() {
  const projectName = "E-commerce Product Scraper"
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ExtractedData[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({})
  const [filteredData, setFilteredData] = useState<ExtractedData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof ExtractedData>("dateAdded")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [savedViews, setSavedViews] = useState<SavedView[]>([
    {
      id: "1",
      name: "High-Priced Items",
      filters: { price: ">100" },
      visibleColumns: { title: true, price: true, rating: true, inStock: true },
    },
    {
      id: "2",
      name: "New Arrivals",
      filters: {},
      visibleColumns: { title: true, price: true, dateAdded: true },
    },
  ])

  // Define columns
  const columns: ColumnDef[] = [
    { id: "title", name: "Product Title", accessor: "title", sortable: true, defaultVisible: true },
    { id: "price", name: "Price", accessor: "price", sortable: true, defaultVisible: true },
    {
      id: "description",
      name: "Description",
      accessor: "description",
      sortable: false,
      defaultVisible: false,
    },
    {
      id: "category",
      name: "Category",
      accessor: "category",
      sortable: true,
      defaultVisible: true,
    },
    { id: "rating", name: "Rating", accessor: "rating", sortable: true, defaultVisible: true },
    {
      id: "inStock",
      name: "In Stock",
      accessor: "inStock",
      sortable: true,
      defaultVisible: true,
    },
    {
      id: "dateAdded",
      name: "Date Added",
      accessor: "dateAdded",
      sortable: true,
      defaultVisible: true,
    },
    { id: "url", name: "URL", accessor: "url", sortable: false, defaultVisible: false },
    {
      id: "imageUrl",
      name: "Image URL",
      accessor: "imageUrl",
      sortable: false,
      defaultVisible: false,
    },
  ]

  // Initialize column visibility
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
    columns.reduce((acc, column) => {
      acc[column.id] = column.defaultVisible
      return acc
    }, {} as ColumnVisibility),
  )

  // Data fetching removed: integrate real API here.

  // Apply filters and search
  useEffect(() => {
    if (data.length === 0) return

    let result = [...data]

    // Apply search query across all fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((item) =>
        Object.values(item).some((value) => {
          if (value === null || value === undefined) return false
          if (typeof value === "boolean") return false
          if (value instanceof Date) return value.toLocaleDateString().toLowerCase().includes(query)
          return String(value).toLowerCase().includes(query)
        }),
      )
    }

    // Apply column-specific filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (!filterValue) return

      const column = columns.find((col) => col.id === key)
      if (!column) return

      result = result.filter((item) => {
        const value = item[column.accessor]

        // Handle different filter formats
        if (filterValue.startsWith(">")) {
          const threshold = Number.parseFloat(filterValue.substring(1))
          if (isNaN(threshold)) return true
          if (column.accessor === "price") {
            const numericPrice = Number.parseFloat(String(value).replace(/[^0-9.]/g, ""))
            return numericPrice > threshold
          }
          return Number(value) > threshold
        } else if (filterValue.startsWith("<")) {
          const threshold = Number.parseFloat(filterValue.substring(1))
          if (isNaN(threshold)) return true
          if (column.accessor === "price") {
            const numericPrice = Number.parseFloat(String(value).replace(/[^0-9.]/g, ""))
            return numericPrice < threshold
          }
          return Number(value) < threshold
        } else {
          if (value === null || value === undefined) return false
          if (value instanceof Date) return value.toLocaleDateString().toLowerCase().includes(filterValue.toLowerCase())
          if (typeof value === "boolean") {
            if (filterValue.toLowerCase() === "yes" || filterValue.toLowerCase() === "true") return value === true
            if (filterValue.toLowerCase() === "no" || filterValue.toLowerCase() === "false") return value === false
            return false
          }
          return String(value).toLowerCase().includes(filterValue.toLowerCase())
        }
      })
    })

    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortColumn]
      let valueB = b[sortColumn]

      // Handle special cases
      if (sortColumn === "price") {
        valueA = Number.parseFloat(String(valueA).replace(/[^0-9.]/g, ""))
        valueB = Number.parseFloat(String(valueB).replace(/[^0-9.]/g, ""))
      }

      // Standard comparison
      if (valueA === valueB) return 0
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
      return sortDirection === "asc" ? -1 : 1
    })

    setFilteredData(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [data, searchQuery, filters, sortColumn, sortDirection, columns])

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }

  const handleSort = (columnId: keyof ExtractedData) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 1000)
  }

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }))
  }

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: visible,
    }))
  }

  const handleSaveView = (name: string) => {
    const newView: SavedView = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      visibleColumns: { ...columnVisibility },
    }
    setSavedViews((prev) => [...prev, newView])
  }

  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters)
    setColumnVisibility(view.visibleColumns)
  }

  const visibleColumns = columns.filter((col) => columnVisibility[col.id])

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <ResultsViewerHeader projectName={projectName} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="flex flex-1 flex-col xl:flex-row">
        <div className="flex-1 px-4 py-6 md:px-6">
          <ResultsViewerToolbar
            onFilterToggle={() => setFilterOpen(!filterOpen)}
            filterOpen={filterOpen}
            onRefresh={handleRefresh}
            columns={columns}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={handleColumnVisibilityChange}
          />

          {isLoading ? (
            <TableSkeleton columns={visibleColumns} />
          ) : filteredData.length === 0 ? (
            <EmptyState onRunNow={handleRefresh} />
          ) : (
            <>
              <DataTable
                data={getCurrentPageItems()}
                columns={visibleColumns}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                currentPage={currentPage}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
              />

              <ResultsViewerFooter
                currentPage={currentPage}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
                setItemsPerPage={setItemsPerPage}
                lastUpdated={lastUpdated}
              />
            </>
          )}
        </div>

        {/* Right Sidebar - Desktop Only */}
        <StatsSidebar data={data} savedViews={savedViews} onSaveView={handleSaveView} onLoadView={handleLoadView} />

        {/* Filter Sidebar - Slides in on filter toggle */}
        <FilterSidebar
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          columns={columns}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={() => setFilters({})}
        />
      </div>
    </div>
  )
}
