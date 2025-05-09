"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlayCircle } from "lucide-react"

interface EmptyStateProps {
  onRunNow: () => void
}

export function EmptyState({ onRunNow }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 relative w-48 h-48">
        <Image
          src="/placeholder.svg?height=192&width=192"
          alt="No data illustration"
          width={192}
          height={192}
          className="object-contain"
        />
      </div>
      <h3 className="text-xl font-semibold mb-2">No data extracted</h3>
      <p className="text-muted-foreground mb-6 max-w-md">Try running the job again to extract data.</p>
      <Button className="bg-[#4F46E5] hover:bg-[#4338CA]" onClick={onRunNow}>
        <PlayCircle className="mr-2 h-4 w-4" />
        Run Now
      </Button>
    </div>
  )
}
