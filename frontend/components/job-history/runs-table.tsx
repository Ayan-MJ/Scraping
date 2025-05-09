"use client"

import { ArrowDown, ArrowUp, FileText, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Run, SortColumn, SortDirection } from "@/app/job-history/page"
import { cn } from "@/lib/utils"

interface RunsTableProps {
  runs: Run[]
  sortColumn: SortColumn
  sortDirection: SortDirection
  onSort: (column: SortColumn) => void
  onViewLogs: (runId: string) => void
  onDownloadData: (runId: string) => void
  onRetryRun: (runId: string) => void
}

export function RunsTable({
  runs,
  sortColumn,
  sortDirection,
  onSort,
  onViewLogs,
  onDownloadData,
  onRetryRun,
}: RunsTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null
    return sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-[#10B981] text-white"
      case "failed":
        return "bg-[#EF4444] text-white"
      case "running":
        return "bg-[#3B82F6] text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => onSort("runId")}
              >
                <div className="flex items-center">
                  Run ID
                  {renderSortIcon("runId")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => onSort("projectName")}
              >
                <div className="flex items-center">
                  Project Name
                  {renderSortIcon("projectName")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => onSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {renderSortIcon("status")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => onSort("startTime")}
              >
                <div className="flex items-center">
                  Start Time
                  {renderSortIcon("startTime")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => onSort("duration")}
              >
                <div className="flex items-center">
                  Duration
                  {renderSortIcon("duration")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => onSort("recordsExtracted")}
              >
                <div className="flex items-center">
                  Records
                  {renderSortIcon("recordsExtracted")}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run, index) => (
              <tr
                key={run.id}
                className={cn(
                  "border-b transition-colors hover:bg-muted/50",
                  index % 2 === 0 ? "bg-white" : "bg-muted/20",
                )}
              >
                <td className="px-4 py-3 text-sm font-medium">
                  <button
                    onClick={() => onViewLogs(run.runId)}
                    className="text-[#4F46E5] hover:underline focus:outline-none"
                  >
                    {run.runId}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">{run.projectName}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      getStatusColor(run.status),
                    )}
                  >
                    {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(run.startTime)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{run.duration}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{run.recordsExtracted.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewLogs(run.runId)}
                      className="h-8 w-8"
                      title="View Logs"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">View Logs</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDownloadData(run.runId)}
                      className="h-8 w-8"
                      title="Download Data"
                      disabled={run.status === "running" || run.status === "failed"}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download Data</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRetryRun(run.runId)}
                      className="h-8 w-8"
                      title="Retry Run"
                      disabled={run.status === "running" || run.status === "success"}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">Retry Run</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
