"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectSettingsHeaderProps {
  projectName: string
  onSave: () => void
  hasChanges: boolean
  isSaving: boolean
}

export function ProjectSettingsHeader({ projectName, onSave, hasChanges, isSaving }: ProjectSettingsHeaderProps) {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground">
                Dashboard
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link href={`/projects/${encodeURIComponent(projectName)}`} className="hover:text-foreground">
                {projectName}
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-foreground">Settings</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Project Settings</h1>
          </div>

          <Button onClick={onSave} disabled={!hasChanges || isSaving} className="bg-[#4F46E5] hover:bg-[#4338CA]">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </header>
  )
}
