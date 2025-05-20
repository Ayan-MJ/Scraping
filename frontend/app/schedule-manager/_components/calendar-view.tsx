"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { Schedule } from "@/app/schedule-manager/page"
import { Card } from "@/components/ui/card"

interface CalendarViewProps {
  schedules: Schedule[]
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  getSchedulesForDate: (date: Date) => Schedule[]
  onToggleSchedule: (id: string, enabled: boolean) => void
  onEditSchedule: (schedule: Schedule) => void
  onDeleteSchedule: (schedule: Schedule) => void
}

export function CalendarView({
  schedules,
  selectedDate,
  setSelectedDate,
  getSchedulesForDate,
  onToggleSchedule,
  onEditSchedule,
  onDeleteSchedule,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[]>([])

  // Generate calendar days for the current month
  useEffect(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Get the first day of the month
    const firstDay = new Date(year, month, 1)
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay()

    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek

    // Calculate total days to show (previous month + current month + next month)
    const totalDays = 42 // 6 rows of 7 days

    const days: Date[] = []

    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push(date)
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push(date)
    }

    // Add days from next month
    const remainingDays = totalDays - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push(date)
    }

    setCalendarDays(days)
  }, [currentMonth])

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const getScheduleIndicators = (date: Date) => {
    const schedulesForDate = getSchedulesForDate(date)
    const enabledSchedules = schedulesForDate.filter((s) => s.enabled)
    const disabledSchedules = schedulesForDate.filter((s) => !s.enabled)

    return {
      enabled: enabledSchedules.length,
      disabled: disabledSchedules.length,
      total: schedulesForDate.length,
    }
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{formatMonth(currentMonth)}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="rounded-lg border bg-[#232329] text-white overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 grid-rows-6">
          {calendarDays.map((date, index) => {
            const indicators = getScheduleIndicators(date)

            return (
              <Popover key={index}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "h-24 sm:h-32 p-2 border-r border-b relative transition-colors duration-150",
                      isCurrentMonth(date) ? "bg-[#232329]" : "bg-[#18181b]",
                      isSelectedDate(date) && "ring-2 ring-[#4F46E5] ring-inset",
                      isToday(date) && "font-bold text-[#4F46E5]",
                    )}
                    onClick={() => handleDateClick(date)}
                  >
                    <span className="absolute top-2 left-2 text-sm">{date.getDate()}</span>

                    {/* Schedule Indicators */}
                    {indicators.total > 0 && (
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        {indicators.enabled > 0 && <div className="h-2 w-2 rounded-full bg-[#10B981]"></div>}
                        {indicators.disabled > 0 && <div className="h-2 w-2 rounded-full bg-[#9CA3AF]"></div>}
                      </div>
                    )}
                  </button>
                </PopoverTrigger>

                {indicators.total > 0 && (
                  <PopoverContent className="w-80" align="center" sideOffset={5}>
                    <div className="space-y-4">
                      <h3 className="font-medium">
                        Schedules for{" "}
                        {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </h3>
                      <div className="space-y-2">
                        {getSchedulesForDate(date).map((schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">{schedule.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {schedule.nextRun.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={schedule.enabled}
                                onCheckedChange={(checked) => onToggleSchedule(schedule.id, checked)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onEditSchedule(schedule)}
                              >
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-600"
                                onClick={() => onDeleteSchedule(schedule)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
