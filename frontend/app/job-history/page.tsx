"use client"

import { useState, useEffect } from "react"
import { JobHistoryHeader } from "./_components/job-history-header"
import { FilterBar } from "./_components/filter-bar"
import { RunsTable } from "./_components/runs-table"
import { LogViewerModal } from "./_components/log-viewer-modal"
import { Pagination } from "./_components/pagination"
import { EmptyState } from "./_components/empty-state"
import { TableSkeleton } from "./_components/table-skeleton"

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
  const [isLoading, setIsLoading] = useState(true)
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

  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Sample data
      const sampleRuns: Run[] = Array.from({ length: 25 }, (_, i) => {
        const status = ["success", "failed", "running"][Math.floor(Math.random() * 3)] as
          | "success"
          | "failed"
          | "running"
        const startTime = new Date()
        startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 30))

        return {
          id: `run-${i + 1}`,
          runId: `RUN-${1000 + i}`,
          projectName: ["E-commerce Scraper", "News Aggregator", "Social Media Monitor", "Price Tracker"][
            Math.floor(Math.random() * 4)
          ],
          status,
          startTime,
          duration:
            status === "running"
              ? "Running..."
              : `${Math.floor(Math.random() * 10) + 1}m ${Math.floor(Math.random() * 60)}s`,
          recordsExtracted: status === "running" ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 1000),
        }
      })

      setRuns(sampleRuns)
      setTotalItems(sampleRuns.length)
      setIsLoading(false)
    }

    fetchData()
  }, [])

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
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto py-6 space-y-6">
        <JobHistoryHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="container mx-auto px-4 py-6">
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
        </main>

        <LogViewerModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} runId={selectedRunId} />
      </div>
    </div>
  )
}
