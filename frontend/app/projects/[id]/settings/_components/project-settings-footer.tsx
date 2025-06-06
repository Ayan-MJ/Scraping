"use client"

import { Button } from "@/components/ui/button"

interface ProjectSettingsFooterProps {
  onCancel: () => void
  onSave: () => void
  hasChanges: boolean
  isSaving: boolean
}

export function ProjectSettingsFooter({ onCancel, onSave, hasChanges, isSaving }: ProjectSettingsFooterProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t bg-white py-4 mt-8">
      <div className="container mx-auto px-4 flex items-center justify-end gap-4">
        <Button variant="outline" onClick={onCancel} disabled={!hasChanges || isSaving}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!hasChanges || isSaving} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
