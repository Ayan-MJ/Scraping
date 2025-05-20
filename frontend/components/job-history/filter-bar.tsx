"use client"

import { CalendarIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { StatusType } from "@/app/job-history/page"

interface FilterBarProps {
  statusFilter: StatusType
  setStatusFilter: (status: StatusType) => void
  dateRange: { from: Date | undefined; to: Date | undefined }
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void
  onRefresh: () => void
}

export function FilterBar({ statusFilter, setStatusFilter, dateRange, setDateRange, onRefresh }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "success" ? "success" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("success")}
        >
          Success
        </Button>
        <Button
          variant={statusFilter === "failed" ? "destructive" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("failed")}
        >
          Failed
        </Button>
        <Button
          variant={statusFilter === "running" ? "info" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("running")}
        >
          Running
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange.from && !dateRange.to && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                "Date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) =>
                setDateRange({
                  from: range?.from,
                  to: range?.to,
                })
              }
              numberOfMonths={2}
            />
            <div className="flex items-center justify-between p-3 border-t">
              <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: undefined, to: undefined })}>
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const today = new Date()
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(today.getDate() - 30)
                  setDateRange({ from: thirtyDaysAgo, to: today })
                }}
                variant="primary"
              >
                Last 30 days
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="icon" onClick={onRefresh} className="h-9 w-9">
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
    </div>
  )
}
