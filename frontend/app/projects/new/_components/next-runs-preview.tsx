import { CalendarClock } from "lucide-react"

interface NextRunsPreviewProps {
  nextRuns: Date[]
}

export function NextRunsPreview({ nextRuns }: NextRunsPreviewProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  return (
    <div className="space-y-4">
      {nextRuns.length > 0 ? (
        <ul className="space-y-3">
          {nextRuns.map((date, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#4F46E5]/10">
                <CalendarClock className="h-3.5 w-3.5 text-[#4F46E5]" />
              </div>
              <div>
                <p className="font-medium">{formatDate(date)}</p>
                <p className="text-xs text-muted-foreground">{index === 0 ? "Next run" : `Run #${index + 1}`}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">No scheduled runs</p>
          <p className="text-xs text-muted-foreground mt-1">Configure your schedule to see upcoming runs</p>
        </div>
      )}

      <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
        <p>You can modify this schedule later in Schedule Manager</p>
      </div>
    </div>
  )
}
