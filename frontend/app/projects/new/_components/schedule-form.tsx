"use client"

import { useState } from "react"
import { Clock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { FrequencyType, ScheduleConfig } from "@/app/projects/new/scheduling/page"
import { validateCronExpression } from "@/lib/schedule-utils"

interface ScheduleFormProps {
  config: ScheduleConfig
  setConfig: (config: ScheduleConfig) => void
}

export function ScheduleForm({ config, setConfig }: ScheduleFormProps) {
  const [isEventTriggerOpen, setIsEventTriggerOpen] = useState(false)
  const [cronError, setCronError] = useState<string | null>(null)

  const handleFrequencyChange = (value: FrequencyType) => {
    let newConfig = { ...config, frequency: value }

    // Set default values based on frequency
    switch (value) {
      case "one-off":
        newConfig = {
          ...newConfig,
          time: undefined,
          weekdays: undefined,
          cronExpression: undefined,
        }
        break
      case "hourly":
        newConfig = {
          ...newConfig,
          time: undefined,
          weekdays: undefined,
          cronExpression: "0 * * * *",
        }
        break
      case "daily":
        newConfig = {
          ...newConfig,
          time: "09:00",
          weekdays: undefined,
          cronExpression: "0 9 * * *",
        }
        break
      case "weekly":
        newConfig = {
          ...newConfig,
          time: "09:00",
          weekdays: ["monday"],
          cronExpression: "0 9 * * 1",
        }
        break
      case "custom":
        newConfig = {
          ...newConfig,
          cronExpression: "0 9 * * *",
        }
        break
    }

    setConfig(newConfig)
  }

  const handleTimeChange = (time: string) => {
    const [hours, _minutes] = time.split(":")
    let cronExpression = ""

    if (config.frequency === "daily") {
      cronExpression = `0 ${Number.parseInt(hours)} * * *`
    } else if (config.frequency === "weekly" && config.weekdays?.length) {
      const weekdayNumbers = config.weekdays
        .map((day) => {
          const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
          return days.indexOf(day)
        })
        .join(",")
      cronExpression = `0 ${Number.parseInt(hours)} * * ${weekdayNumbers}`
    }

    setConfig({
      ...config,
      time,
      cronExpression,
    })
  }

  const handleWeekdayToggle = (weekday: string) => {
    const currentWeekdays = config.weekdays || []
    let newWeekdays: string[]

    if (currentWeekdays.includes(weekday)) {
      newWeekdays = currentWeekdays.filter((day) => day !== weekday)
    } else {
      newWeekdays = [...currentWeekdays, weekday]
    }

    // Don't allow empty weekdays selection
    if (newWeekdays.length === 0) {
      newWeekdays = ["monday"]
    }

    // Update cron expression
    const weekdayNumbers = newWeekdays
      .map((day) => {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        return days.indexOf(day)
      })
      .join(",")

    const [hours, _minutes] = (config.time || "09:00").split(":")
    const cronExpression = `0 ${Number.parseInt(hours)} * * ${weekdayNumbers}`

    setConfig({
      ...config,
      weekdays: newWeekdays,
      cronExpression,
    })
  }

  const handleCronExpressionChange = (expression: string) => {
    try {
      const _isValid = validateCronExpression(expression)
      setCronError(null)
      setConfig({
        ...config,
        cronExpression: expression,
      })
    } catch (error) {
      setCronError((error as Error).message)
      setConfig({
        ...config,
        cronExpression: expression,
      })
    }
  }

  const handleDetectChangesToggle = (checked: boolean) => {
    setConfig({
      ...config,
      detectChanges: checked,
    })
  }

  const handleChangeIntervalChange = (interval: string) => {
    setConfig({
      ...config,
      changeInterval: interval,
    })
  }

  return (
    <div className="space-y-8">
      {/* Frequency Selector */}
      <div className="space-y-2">
        <Label htmlFor="frequency">Run Frequency</Label>
        <ToggleGroup
          type="single"
          value={config.frequency}
          onValueChange={(value) => value && handleFrequencyChange(value as FrequencyType)}
          className="flex flex-wrap gap-2"
        >
          <ToggleGroupItem value="one-off" className="rounded-md">
            One-off
          </ToggleGroupItem>
          <ToggleGroupItem value="hourly" className="rounded-md">
            Hourly
          </ToggleGroupItem>
          <ToggleGroupItem value="daily" className="rounded-md">
            Daily
          </ToggleGroupItem>
          <ToggleGroupItem value="weekly" className="rounded-md">
            Weekly
          </ToggleGroupItem>
          <ToggleGroupItem value="custom" className="rounded-md">
            Custom
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Time Picker - for Daily and Weekly */}
      {(config.frequency === "daily" || config.frequency === "weekly") && (
        <div className="space-y-2">
          <Label htmlFor="time">Run Time</Label>
          <div className="relative max-w-[180px]">
            <Input
              id="time"
              type="time"
              value={config.time || "09:00"}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="pl-9"
            />
            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Weekday Selector - for Weekly */}
      {config.frequency === "weekly" && (
        <div className="space-y-2">
          <Label>Days of Week</Label>
          <div className="flex flex-wrap gap-2">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <Button
                key={day}
                type="button"
                variant={config.weekdays?.includes(day) ? "default" : "outline"}
                className={`capitalize ${config.weekdays?.includes(day) ? "bg-[#4F46E5] hover:bg-[#4338CA]" : ""}`}
                onClick={() => handleWeekdayToggle(day)}
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Cron Expression Editor - for Custom */}
      {config.frequency === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="cron">Cron Expression</Label>
          <Input
            id="cron"
            value={config.cronExpression || ""}
            onChange={(e) => handleCronExpressionChange(e.target.value)}
            className={cronError ? "border-red-500" : ""}
          />
          {cronError ? (
            <div className="flex items-start gap-2 text-sm text-red-500">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{cronError}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Format: minute hour day month weekday (e.g., "0 9 * * *" = daily at 9:00 AM)
            </p>
          )}
        </div>
      )}

      {/* Event Trigger Panel */}
      <Collapsible
        open={isEventTriggerOpen}
        onOpenChange={setIsEventTriggerOpen}
        className="w-full space-y-2 rounded-md border p-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Advanced Options</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
              {isEventTriggerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">Toggle advanced options</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-4 pt-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="detect-changes"
              checked={config.detectChanges}
              onCheckedChange={(checked) => handleDetectChangesToggle(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="detect-changes"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Also trigger when page changes
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically run the scraper when content changes are detected
              </p>
            </div>
          </div>

          {config.detectChanges && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="change-interval">Change detection interval</Label>
              <Select value={config.changeInterval} onValueChange={handleChangeIntervalChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">Every 15 minutes</SelectItem>
                  <SelectItem value="30m">Every 30 minutes</SelectItem>
                  <SelectItem value="1h">Every hour</SelectItem>
                  <SelectItem value="3h">Every 3 hours</SelectItem>
                  <SelectItem value="6h">Every 6 hours</SelectItem>
                  <SelectItem value="12h">Every 12 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Timezone Display */}
      <div className="space-y-2">
        <Label>Timezone</Label>
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
          <span>Asia/Kolkata</span>
          <span className="text-xs text-muted-foreground">(UTC+5:30)</span>
        </div>
      </div>
    </div>
  )
}
