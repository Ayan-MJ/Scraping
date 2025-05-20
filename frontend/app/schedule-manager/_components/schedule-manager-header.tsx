"use client"

import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScheduleManagerHeaderProps {
  onNewSchedule: () => void
}

export function ScheduleManagerHeader({ onNewSchedule }: ScheduleManagerHeaderProps) {
  return (
    <header className="bg-[#18181b] border-b border-[#232329]">
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Schedule Manager</h1>
            <p className="text-muted-foreground mt-1">View and manage all your scheduled scrapes</p>
          </div>

          <Button onClick={onNewSchedule} variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
        </div>
      </div>
    </header>
  )
}
