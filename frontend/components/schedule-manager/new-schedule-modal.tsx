"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import type { Project, Schedule, FrequencyType } from "@/app/schedule-manager/page"

interface NewScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
  onCreateSchedule: (schedule: Omit<Schedule, "id" | "createdAt" | "updatedAt">) => void
}

export function NewScheduleModal({ isOpen, onClose, projects, onCreateSchedule }: NewScheduleModalProps) {
  const [name, setName] = useState("")
  const [projectId, setProjectId] = useState("")
  const [frequency, setFrequency] = useState<FrequencyType>("daily")
  const [time, setTime] = useState("09:00")
  const [enabled, setEnabled] = useState(true)
  const [weekday, setWeekday] = useState("monday")
  const [monthDay, setMonthDay] = useState("1")
  const [customCron, setCustomCron] = useState("0 9 * * *")

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
        const minutes = value.split(':').map(Number)[1];
        setCronExpression(`0 ${minutes} * * * *`);
        break;
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
    if (!name || !projectId) return

    const projectName = projects.find((p) => p.id === projectId)?.name || ""
    const humanReadableSchedule = getHumanReadableSchedule()
    const cronExpression = getCronExpression()

    // Calculate next run date
    const nextRun = new Date()
    nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0) // Default to next hour

    const newSchedule: Omit<Schedule, "id" | "createdAt" | "updatedAt"> = {
      name,
      projectId,
      projectName,
      frequency,
      cronExpression,
      humanReadableSchedule,
      nextRun,
      enabled,
    }

    onCreateSchedule(newSchedule)
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setProjectId("")
    setFrequency("daily")
    setTime("09:00")
    setEnabled(true)
    setWeekday("monday")
    setMonthDay("1")
    setCustomCron("0 9 * * *")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          resetForm()
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Schedule</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Daily Product Scrape"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="project">
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
                <RadioGroupItem value="hourly" id="hourly" />
                <Label htmlFor="hourly">Hourly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom</Label>
              </div>
            </RadioGroup>
          </div>

          {(frequency === "daily" || frequency === "weekly" || frequency === "monthly") && (
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          )}

          {frequency === "weekly" && (
            <div className="grid gap-2">
              <Label htmlFor="weekday">Day of Week</Label>
              <Select value={weekday} onValueChange={setWeekday}>
                <SelectTrigger id="weekday">
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
              <Label htmlFor="monthDay">Day of Month</Label>
              <Select value={monthDay} onValueChange={setMonthDay}>
                <SelectTrigger id="monthDay">
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
              <Label htmlFor="cron">Cron Expression</Label>
              <Input
                id="cron"
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
            <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="enabled">Enable schedule immediately</Label>
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
            Create Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
