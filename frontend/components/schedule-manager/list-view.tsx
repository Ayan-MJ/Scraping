"use client"

import { Settings, Trash2, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { Schedule } from "@/app/schedule-manager/page"

interface ListViewProps {
  schedules: Schedule[]
  onToggleSchedule: (id: string, enabled: boolean) => void
  onEditSchedule: (schedule: Schedule) => void
  onDeleteSchedule: (schedule: Schedule) => void
}

export function ListView({ schedules, onToggleSchedule, onEditSchedule, onDeleteSchedule }: ListViewProps) {
  const formatNextRun = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Schedule Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Frequency</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Next Run</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule, index) => (
              <tr
                key={schedule.id}
                className={cn(
                  "border-b transition-colors hover:bg-muted/50",
                  index % 2 === 0 ? "bg-white" : "bg-muted/20",
                )}
              >
                <td className="px-4 py-3 text-sm font-medium">{schedule.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{schedule.humanReadableSchedule}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{formatNextRun(schedule.nextRun)}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => onToggleSchedule(schedule.id, checked)}
                      className="mr-2"
                    />
                    <span className={schedule.enabled ? "text-[#10B981]" : "text-[#9CA3AF]"}>
                      {schedule.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onToggleSchedule(schedule.id, !schedule.enabled)}
                    >
                      {schedule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      <span className="sr-only">{schedule.enabled ? "Pause" : "Resume"}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditSchedule(schedule)}>
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => onDeleteSchedule(schedule)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
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
