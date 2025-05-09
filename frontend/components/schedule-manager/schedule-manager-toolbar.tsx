"use client"

import { CalendarDays, List, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ViewMode, Project } from "@/app/schedule-manager/page"

interface ScheduleManagerToolbarProps {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  projects: Project[]
  selectedProject: string
  setSelectedProject: (projectId: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  onRefresh: () => void
}

export function ScheduleManagerToolbar({
  viewMode,
  setViewMode,
  projects,
  selectedProject,
  setSelectedProject,
  searchQuery,
  setSearchQuery,
  onRefresh,
}: ScheduleManagerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="bg-muted p-1 rounded-md flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("calendar")}
            className={cn("gap-2 rounded-sm", viewMode === "calendar" && "bg-white shadow-sm")}
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={cn("gap-2 rounded-sm", viewMode === "list" && "bg-white shadow-sm")}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
        </div>

        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search schedules..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button variant="outline" size="icon" onClick={onRefresh} className="h-9 w-9">
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
    </div>
  )
}
