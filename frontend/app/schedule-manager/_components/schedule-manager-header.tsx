"use client"

import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScheduleManagerHeaderProps {
  onNewSchedule: () => void
}

export function ScheduleManagerHeader({ onNewSchedule }: ScheduleManagerHeaderProps) {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Schedule Manager</h1>
            <p className="text-muted-foreground mt-1">View and manage all your scheduled scrapes</p>
          </div>

          <Button onClick={onNewSchedule} className="bg-[#4F46E5] hover:bg-[#4338CA]">
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
        </div>
      </div>
    </header>
  )
}
