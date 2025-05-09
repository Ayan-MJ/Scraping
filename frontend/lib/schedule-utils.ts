import type { ScheduleConfig } from "@/app/projects/new/scheduling/page"
import { parseExpression } from "cron-parser"

export function validateCronExpression(expression: string): boolean {
  try {
    parseExpression(expression)
    return true
  } catch (error) {
    throw new Error("Invalid cron expression")
  }
}

export function calculateNextRuns(config: ScheduleConfig, count: number): Date[] {
  if (config.frequency === "one-off") {
    // For one-off, just return the current time as the only run
    return [new Date()]
  }

  if (!config.cronExpression && config.frequency !== "one-off") {
    throw new Error("Missing cron expression")
  }

  try {
    const interval = parseExpression(config.cronExpression || "0 9 * * *")
    const nextRuns: Date[] = []

    for (let i = 0; i < count; i++) {
      const next = interval.next()
      nextRuns.push(next.toDate())
    }

    return nextRuns
  } catch (error) {
    console.error("Error parsing cron expression:", error)
    throw new Error("Invalid schedule configuration")
  }
}

export function cronToHumanReadable(expression: string): string {
  const parts = expression.split(" ")
  if (parts.length !== 5) {
    return "Invalid cron expression"
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  // Simple cases
  if (minute === "0" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every hour at minute 0"
  }

  if (minute === "0" && /^\d+$/.test(hour) && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return `Daily at ${Number.parseInt(hour)}:00`
  }

  if (minute === "0" && /^\d+$/.test(hour) && dayOfMonth === "*" && month === "*" && /^\d+$/.test(dayOfWeek)) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayName = days[Number.parseInt(dayOfWeek) % 7]
    return `Weekly on ${dayName} at ${Number.parseInt(hour)}:00`
  }

  // Default
  return `Custom schedule (${expression})`
}
