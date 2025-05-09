"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Save, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ExtractedData, SavedView } from "@/app/results-viewer/page"

interface StatsSidebarProps {
  data: ExtractedData[]
  savedViews: SavedView[]
  onSaveView: (name: string) => void
  onLoadView: (view: SavedView) => void
}

export function StatsSidebar({ data, savedViews, onSaveView, onLoadView }: StatsSidebarProps) {
  const [saveViewDialogOpen, setSaveViewDialogOpen] = useState(false)
  const [newViewName, setNewViewName] = useState("")
  const [savedViewsOpen, setSavedViewsOpen] = useState(true)

  // Calculate statistics
  const totalRecords = data.length
  const firstRecord =
    data.length > 0 ? data.reduce((earliest, item) => (item.dateAdded < earliest.dateAdded ? item : earliest)) : null
  const lastRecord =
    data.length > 0 ? data.reduce((latest, item) => (item.dateAdded > latest.dateAdded ? item : latest)) : null

  // Calculate new items - in a real app, this would compare with previous run
  const newItemsCount = Math.floor(Math.random() * 10)

  const handleSaveView = () => {
    if (newViewName.trim()) {
      onSaveView(newViewName.trim())
      setNewViewName("")
      setSaveViewDialogOpen(false)
    }
  }

  return (
    <aside className="hidden xl:block w-80 border-l bg-white p-6">
      <div className="space-y-6">
        {/* Quick Stats Panel */}
        <div>
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="text-2xl font-bold">{totalRecords}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>

            {firstRecord && (
              <div className="rounded-md border p-4">
                <div className="text-sm font-medium">{firstRecord.dateAdded.toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">First Record Date</div>
              </div>
            )}

            {lastRecord && (
              <div className="rounded-md border p-4">
                <div className="text-sm font-medium">{lastRecord.dateAdded.toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">Last Record Date</div>
              </div>
            )}

            {newItemsCount > 0 && (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="text-sm font-medium text-blue-800">{newItemsCount} new items</div>
                <div className="text-xs text-blue-700">since last run</div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Views Section */}
        <Collapsible open={savedViewsOpen} onOpenChange={setSavedViewsOpen}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Saved Views</h3>
            <div className="flex gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  {savedViewsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="sr-only">Toggle saved views</span>
                </Button>
              </CollapsibleTrigger>
              <Button variant="outline" size="sm" onClick={() => setSaveViewDialogOpen(true)} className="h-7 w-7 p-0">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add saved view</span>
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            <div className="space-y-2">
              {savedViews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved views yet</p>
              ) : (
                savedViews.map((view) => (
                  <button
                    key={view.id}
                    className="w-full rounded-md border p-3 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => onLoadView(view)}
                  >
                    <div className="font-medium text-sm">{view.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Object.keys(view.filters).length > 0
                        ? `${Object.keys(view.filters).length} filters applied`
                        : "No filters"}
                    </div>
                  </button>
                ))
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Dialog open={saveViewDialogOpen} onOpenChange={setSaveViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="view-name" className="text-sm font-medium">
              View Name
            </Label>
            <Input
              id="view-name"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              className="mt-2"
              placeholder="e.g., High-priced items"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveViewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              <Save className="mr-2 h-4 w-4" />
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
