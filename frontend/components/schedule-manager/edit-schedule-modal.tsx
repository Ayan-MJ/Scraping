"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import type { Project, Schedule, FrequencyType } from "@/app/schedule-manager/page"

interface EditScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  schedule: Schedule | null
  projects: Project[]
  onUpdateSchedule: (schedule: Schedule) => void
}

export function EditScheduleModal({ isOpen, onClose, schedule, projects, onUpdateSchedule }: EditScheduleModalProps) {
  const [name, setName] = useState("")
  const [projectId, setProjectId] = useState("")
  const [frequency, setFrequency] = useState<FrequencyType>("daily")
  const [time, setTime] = useState("09:00")
  const [enabled, setEnabled] = useState(true)
  const [weekday, setWeekday] = useState("monday")
  const [monthDay, setMonthDay] = useState("1")
  const [customCron, setCustomCron] = useState("0 9 * * *")

  // Initialize form with schedule data when opened
  useEffect(() => {
    if (schedule) {
      setName(schedule.name)
      setProjectId(schedule.projectId)
      setFrequency(schedule.frequency)
      setEnabled(schedule.enabled)

      // Parse time from cron expression
      if (schedule.cronExpression) {
        const parts = schedule.cronExpression.split(" ")
        if (parts.length === 5) {
          const hour = Number.parseInt(parts[1])
          const minute = Number.parseInt(parts[0])
          setTime(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
        }
      }

      // Parse weekday from cron expression for weekly schedules
      if (schedule.frequency === "weekly" && schedule.cronExpression) {
        const parts = schedule.cronExpression.split(" ")
        if (parts.length === 5) {
          const weekdayNum = Number.parseInt(parts[4])
          setWeekday(getWeekdayName(weekdayNum))
        }
      }

      // Parse day of month from cron expression for monthly schedules
      if (schedule.frequency === "monthly" && schedule.cronExpression) {
        const parts = schedule.cronExpression.split(" ")
        if (parts.length === 5) {
          setMonthDay(parts[2])
        }
      }

      // Set custom cron expression
      if (schedule.frequency === "custom") {
        setCustomCron(schedule.cronExpression)
      }
    }
  }, [schedule])

  const getWeekdayName = (day: number) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days[day] || "monday"
  }

  const getHumanReadableSchedule = () => {
    switch (frequency) {
      case "one-off":
        return "One-time run"
      case "hourly":
        return "Every hour"
      case "daily":
        return `Daily at ${formatTime(time)}`
      case "weekly":
        return `Weekly on ${capitalizeFirstLetter(weekday)} at ${formatTime(time)}`
      case "monthly":
        return `Monthly on the ${getOrdinalSuffix(Number.parseInt(monthDay))} at ${formatTime(time)}`
      case "custom":
        return "Custom schedule"
      default:
        return ""
    }
  }

  const getCronExpression = () => {
    const [hours, minutes] = time.split(":")

    switch (frequency) {
      case "one-off":
        return ""
      case "hourly": {
        const minuteValue = Number.parseInt(minutes);
        return `0 ${minuteValue} * * * *`;
      }
      case "daily": {
        return `0 ${Number.parseInt(hours)} * * *`
      }
      case "weekly":
        const weekdayNum = getWeekdayNumber(weekday)
        return `0 ${Number.parseInt(hours)} * * ${weekdayNum}`
      case "monthly":
        return `0 ${Number.parseInt(hours)} ${monthDay} * *`
      case "custom":
        return customCron
      default:
        return ""
    }
  }

  const getWeekdayNumber = (day: string) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days.indexOf(day)
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`
    switch (day % 10) {
      case 1:
        return `${day}st`
      case 2:
        return `${day}nd`
      case 3:
        return `${day}rd`
      default:
        return `${day}th`
    }
  }

  const handleSubmit = () => {
    if (!schedule || !name || !projectId) return

    const projectName = projects.find((p) => p.id === projectId)?.name || ""
    const humanReadableSchedule = getHumanReadableSchedule()
    const cronExpression = getCronExpression()

    const updatedSchedule: Schedule = {
      ...schedule,
      name,
      projectId,
      projectName,
      frequency,
      cronExpression,
      humanReadableSchedule,
      enabled,
      updatedAt: new Date(),
    }

    onUpdateSchedule(updatedSchedule)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Schedule Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Daily Product Scrape"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="edit-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Frequency</Label>
            <RadioGroup value={frequency} onValueChange={(value) => setFrequency(value as FrequencyType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hourly" id="edit-hourly" />
                <Label htmlFor="edit-hourly">Hourly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="edit-daily" />
                <Label htmlFor="edit-daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="edit-weekly" />
                <Label htmlFor="edit-weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="edit-monthly" />
                <Label htmlFor="edit-monthly">Monthly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="edit-custom" />
                <Label htmlFor="edit-custom">Custom</Label>
              </div>
            </RadioGroup>
          </div>

          {(frequency === "daily" || frequency === "weekly" || frequency === "monthly") && (
            <div className="grid gap-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input id="edit-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          )}

          {frequency === "weekly" && (
            <div className="grid gap-2">
              <Label htmlFor="edit-weekday">Day of Week</Label>
              <Select value={weekday} onValueChange={setWeekday}>
                <SelectTrigger id="edit-weekday">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="grid gap-2">
              <Label htmlFor="edit-monthDay">Day of Month</Label>
              <Select value={monthDay} onValueChange={setMonthDay}>
                <SelectTrigger id="edit-monthDay">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "custom" && (
            <div className="grid gap-2">
              <Label htmlFor="edit-cron">Cron Expression</Label>
              <Input
                id="edit-cron"
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
                placeholder="0 9 * * *"
              />
              <p className="text-xs text-muted-foreground">
                Format: minute hour day month weekday (e.g., "0 9 * * *" = daily at 9:00 AM)
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch id="edit-enabled" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="edit-enabled">Enabled</Label>
          </div>

          {name && projectId && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">Preview:</p>
              <p className="text-sm">{getHumanReadableSchedule()}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !projectId} className="bg-[#4F46E5] hover:bg-[#4338CA]">
            Update Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
