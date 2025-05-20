"use client"

import { useState, useEffect } from "react"
import { ScheduleManagerHeader } from "./_components/schedule-manager-header"
import { ScheduleManagerToolbar } from "./_components/schedule-manager-toolbar"
import { CalendarView } from "./_components/calendar-view"
import { ListView } from "./_components/list-view"
import { ScheduleSidebar } from "./_components/schedule-sidebar"
import { EmptyState } from "./_components/empty-state"
import { SkeletonLoader } from "./_components/skeleton-loader"
import { ScheduleManagerFooter } from "./_components/schedule-manager-footer"
import { NewScheduleModal } from "./_components/new-schedule-modal"
import { EditScheduleModal } from "./_components/edit-schedule-modal"
import { DeleteConfirmModal } from "./_components/delete-confirm-modal"

export type ViewMode = "calendar" | "list"
export type FrequencyType = "one-off" | "hourly" | "daily" | "weekly" | "monthly" | "custom"

export interface Schedule {
  id: string
  name: string
  projectId: string
  projectName: string
  frequency: FrequencyType
  cronExpression: string
  humanReadableSchedule: string
  nextRun: Date
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
}

export default function ScheduleManagerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [isLoading, setIsLoading] = useState(false)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isNewScheduleModalOpen, setIsNewScheduleModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Data fetching removed: integrate real API here.

  // Apply filters and search
  useEffect(() => {
    if (schedules.length === 0) return

    let result = [...schedules]

    // Apply project filter
    if (selectedProject !== "all") {
      result = result.filter((schedule) => schedule.projectId === selectedProject)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (schedule) =>
          schedule.name.toLowerCase().includes(query) ||
          schedule.projectName.toLowerCase().includes(query) ||
          schedule.humanReadableSchedule.toLowerCase().includes(query),
      )
    }

    setFilteredSchedules(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [schedules, selectedProject, searchQuery])

  // Get current page items for list view
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSchedules.slice(startIndex, startIndex + itemsPerPage)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleToggleSchedule = (id: string, enabled: boolean) => {
    setSchedules((prev) => prev.map((schedule) => (schedule.id === id ? { ...schedule, enabled } : schedule)))
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
  }

  const handleDeleteSchedule = (schedule: Schedule) => {
    setDeletingSchedule(schedule)
  }

  const confirmDeleteSchedule = () => {
    if (deletingSchedule) {
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== deletingSchedule.id))
      setDeletingSchedule(null)
    }
  }

  const handleCreateSchedule = (newSchedule: Omit<Schedule, "id" | "createdAt" | "updatedAt">) => {
    const schedule: Schedule = {
      ...newSchedule,
      id: `schedule-${schedules.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setSchedules((prev) => [...prev, schedule])
    setIsNewScheduleModalOpen(false)
  }

  const handleUpdateSchedule = (updatedSchedule: Schedule) => {
    setSchedules((prev) => prev.map((schedule) => (schedule.id === updatedSchedule.id ? updatedSchedule : schedule)))
    setEditingSchedule(null)
  }

  // Get schedules for a specific date (for calendar view)
  const getSchedulesForDate = (date: Date) => {
    return filteredSchedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.nextRun)
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      )
    })
  }

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col">
      <ScheduleManagerHeader onNewSchedule={() => setIsNewScheduleModalOpen(true)} />

      <div className="flex flex-1 flex-col xl:flex-row">
        <div className="flex-1 px-4 py-6 md:px-6">
          <ScheduleManagerToolbar
            viewMode={viewMode}
            setViewMode={setViewMode}
            projects={projects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onRefresh={handleRefresh}
          />

          {isLoading ? (
            <SkeletonLoader viewMode={viewMode} />
          ) : filteredSchedules.length === 0 ? (
            <EmptyState onNewSchedule={() => setIsNewScheduleModalOpen(true)} />
          ) : viewMode === "calendar" ? (
            <CalendarView
              schedules={filteredSchedules}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              getSchedulesForDate={getSchedulesForDate}
              onToggleSchedule={handleToggleSchedule}
              onEditSchedule={handleEditSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          ) : (
            <>
              <ListView
                schedules={getCurrentPageItems()}
                onToggleSchedule={handleToggleSchedule}
                onEditSchedule={handleEditSchedule}
                onDeleteSchedule={handleDeleteSchedule}
              />
              <ScheduleManagerFooter
                currentPage={currentPage}
                totalItems={filteredSchedules.length}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
                setItemsPerPage={setItemsPerPage}
              />
            </>
          )}
        </div>

        {/* Right Sidebar - Desktop Only */}
        <ScheduleSidebar schedules={filteredSchedules} />
      </div>

      {/* Modals */}
      <NewScheduleModal
        isOpen={isNewScheduleModalOpen}
        onClose={() => setIsNewScheduleModalOpen(false)}
        projects={projects}
        onCreateSchedule={handleCreateSchedule}
      />

      <EditScheduleModal
        isOpen={!!editingSchedule}
        onClose={() => setEditingSchedule(null)}
        schedule={editingSchedule}
        projects={projects}
        onUpdateSchedule={handleUpdateSchedule}
      />

      <DeleteConfirmModal
        isOpen={!!deletingSchedule}
        onClose={() => setDeletingSchedule(null)}
        onConfirm={confirmDeleteSchedule}
        scheduleName={deletingSchedule?.name || ""}
      />
    </div>
  )
}
