"use client"

import { Clock } from "lucide-react"
import type { Schedule } from "@/app/schedule-manager/page"

interface ScheduleSidebarProps {
  schedules: Schedule[]
}

export function ScheduleSidebar({ schedules }: ScheduleSidebarProps) {
  // Find the next upcoming schedule
  const getNextSchedule = () => {
    if (schedules.length === 0) return null

    const enabledSchedules = schedules.filter((s) => s.enabled)
    if (enabledSchedules.length === 0) return null

    return enabledSchedules.reduce((earliest, schedule) => {
      return schedule.nextRun < earliest.nextRun ? schedule : earliest
    })
  }

  const nextSchedule = getNextSchedule()
  const totalSchedules = schedules.length
  const enabledSchedules = schedules.filter((s) => s.enabled).length
  const disabledSchedules = schedules.filter((s) => !s.enabled).length

  const formatNextRun = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  return (
    <aside className="hidden xl:block w-80 border-l bg-white p-6">
      <div className="space-y-6">
        {/* Quick Stats Panel */}
        <div>
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="text-2xl font-bold">{totalSchedules}</div>
              <div className="text-sm text-muted-foreground">Total Schedules</div>
            </div>

            {nextSchedule && (
              <div className="rounded-md border p-4">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-[#4F46E5]" />
                  <div>
                    <div className="text-sm font-medium">Next Run:</div>
                    <div className="text-sm">{nextSchedule.projectName}</div>
                    <div className="text-sm text-muted-foreground">{formatNextRun(nextSchedule.nextRun)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div>
          <h3 className="font-semibold mb-4">Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#10B981]"></div>
              <span className="text-sm">Enabled ({enabledSchedules})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#9CA3AF]"></div>
              <span className="text-sm">Disabled ({disabledSchedules})</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
