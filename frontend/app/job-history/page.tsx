"use client"

import { useState, useEffect } from "react"
import { JobHistoryHeader } from "@/components/job-history/job-history-header"
import { FilterBar } from "@/components/job-history/filter-bar"
import { RunsTable } from "@/components/job-history/runs-table"
import { LogViewerModal } from "@/components/job-history/log-viewer-modal"
import { Pagination } from "@/components/job-history/pagination"
import { EmptyState } from "@/components/job-history/empty-state"
import { TableSkeleton } from "@/components/job-history/table-skeleton"
import { Card } from "@/components/ui/card"

export type StatusType = "all" | "success" | "failed" | "running"
export type SortDirection = "asc" | "desc"
export type SortColumn = "runId" | "projectName" | "status" | "startTime" | "duration" | "recordsExtracted"

export interface Run {
  id: string
  runId: string
  projectName: string
  status: "success" | "failed" | "running"
  startTime: Date
  duration: string
  recordsExtracted: number
}

export default function JobHistoryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [runs, setRuns] = useState<Run[]>([])
  const [filteredRuns, setFilteredRuns] = useState<Run[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusType>("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [sortColumn, setSortColumn] = useState<SortColumn>("startTime")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  // Data fetching removed: integrate real API here.

  // Apply filters and search
  useEffect(() => {
    let result = [...runs]

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((run) => run.status === statusFilter)
    }

    // Apply date range filter
    if (dateRange.from) {
      result = result.filter((run) => run.startTime >= dateRange.from!)
    }
    if (dateRange.to) {
      const toDateEnd = new Date(dateRange.to)
      toDateEnd.setHours(23, 59, 59, 999)
      result = result.filter((run) => run.startTime <= toDateEnd)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (run) => run.runId.toLowerCase().includes(query) || run.projectName.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortColumn) {
        case "runId":
          comparison = a.runId.localeCompare(b.runId)
          break
        case "projectName":
          comparison = a.projectName.localeCompare(b.projectName)
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
        case "startTime":
          comparison = a.startTime.getTime() - b.startTime.getTime()
          break
        case "duration":
          // Simple string comparison for duration (not ideal but works for demo)
          comparison = a.duration.localeCompare(b.duration)
          break
        case "recordsExtracted":
          comparison = a.recordsExtracted - b.recordsExtracted
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    setFilteredRuns(result)
    setTotalItems(result.length)
    setCurrentPage(1) // Reset to first page when filters change
  }, [runs, statusFilter, dateRange, searchQuery, sortColumn, sortDirection])

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredRuns.slice(startIndex, startIndex + itemsPerPage)
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleViewLogs = (runId: string) => {
    setSelectedRunId(runId)
    setIsLogModalOpen(true)
  }

  const handleDownloadData = (runId: string) => {
    // In a real app, this would trigger a download
    alert(`Downloading data for run ${runId}`)
  }

  const handleRetryRun = (runId: string) => {
    // In a real app, this would retry the run
    alert(`Retrying run ${runId}`)
  }

  return (
    <div className="min-h-screen bg-[#18181b]">
      <div className="container mx-auto py-6 space-y-6">
        <JobHistoryHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Card className="bg-[#232329] text-white border-none p-6">
          <FilterBar
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onRefresh={handleRefresh}
          />

          {isLoading ? (
            <TableSkeleton />
          ) : filteredRuns.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <RunsTable
                runs={getCurrentPageItems()}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onViewLogs={handleViewLogs}
                onDownloadData={handleDownloadData}
                onRetryRun={handleRetryRun}
              />
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
                setItemsPerPage={setItemsPerPage}
              />
            </>
          )}
        </Card>

        <LogViewerModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} runId={selectedRunId} />
      </div>
    </div>
  )
}
