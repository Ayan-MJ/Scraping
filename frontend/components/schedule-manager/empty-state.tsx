"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface EmptyStateProps {
  onNewSchedule: () => void
}

export function EmptyState({ onNewSchedule }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 relative w-48 h-48">
        <Image
          src="/placeholder.svg?height=192&width=192"
          alt="No schedules illustration"
          width={192}
          height={192}
          className="object-contain"
        />
      </div>
      <h3 className="text-xl font-semibold mb-2">No schedules yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create a schedule to automate your scrapes and collect data on a regular basis.
      </p>
      <Button className="bg-[#4F46E5] hover:bg-[#4338CA]" onClick={onNewSchedule}>
        <Plus className="mr-2 h-4 w-4" />
        New Schedule
      </Button>
    </div>
  )
}
