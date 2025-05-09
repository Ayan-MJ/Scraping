"use client"

import { useState, useEffect } from "react"
import { ScheduleManagerHeader } from "@/components/schedule-manager/schedule-manager-header"
import { ScheduleManagerToolbar } from "@/components/schedule-manager/schedule-manager-toolbar"
import { CalendarView } from "@/components/schedule-manager/calendar-view"
import { ListView } from "@/components/schedule-manager/list-view"
import { ScheduleSidebar } from "@/components/schedule-manager/schedule-sidebar"
import { EmptyState } from "@/components/schedule-manager/empty-state"
import { SkeletonLoader } from "@/components/schedule-manager/skeleton-loader"
import { ScheduleManagerFooter } from "@/components/schedule-manager/schedule-manager-footer"
import { NewScheduleModal } from "@/components/schedule-manager/new-schedule-modal"
import { EditScheduleModal } from "@/components/schedule-manager/edit-schedule-modal"
import { DeleteConfirmModal } from "@/components/schedule-manager/delete-confirm-modal"

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
  const [isLoading, setIsLoading] = useState(true)
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

  // Simulate fetching data
  useEffect(() => {
    setIsLoading(true)
    // Mock API call
    setTimeout(() => {
      const mockProjects: Project[] = [
        { id: "1", name: "E-commerce Scraper" },
        { id: "2", name: "News Aggregator" },
        { id: "3", name: "Social Media Monitor" },
        { id: "4", name: "Price Tracker" },
      ]

      const mockSchedules: Schedule[] = Array.from({ length: 15 }, (_, i) => {
        const project = mockProjects[Math.floor(Math.random() * mockProjects.length)]
        const frequencies: FrequencyType[] = ["hourly", "daily", "weekly", "monthly", "custom"]
        const frequency = frequencies[Math.floor(Math.random() * frequencies.length)]

        let humanReadableSchedule = ""
        let cronExpression = ""

        switch (frequency) {
          case "hourly":
            humanReadableSchedule = "Every hour"
            cronExpression = "0 * * * *"
            break
          case "daily":
            humanReadableSchedule = "Daily at 09:00"
            cronExpression = "0 9 * * *"
            break
          case "weekly":
            humanReadableSchedule = "Weekly on Monday at 10:00"
            cronExpression = "0 10 * * 1"
            break
          case "monthly":
            humanReadableSchedule = "Monthly on the 1st at 12:00"
            cronExpression = "0 12 1 * *"
            break
          case "custom":
            humanReadableSchedule = "Custom schedule"
            cronExpression = "0 */6 * * *"
            break
        }

        const nextRun = new Date()
        nextRun.setDate(nextRun.getDate() + Math.floor(Math.random() * 14))
        nextRun.setHours(Math.floor(Math.random() * 24), 0, 0, 0)

        const createdAt = new Date()
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90))

        return {
          id: `schedule-${i + 1}`,
          name: `${project.name} - ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Run`,
          projectId: project.id,
          projectName: project.name,
          frequency,
          cronExpression,
          humanReadableSchedule,
          nextRun,
          enabled: Math.random() > 0.2,
          createdAt,
          updatedAt: new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 30),
        }
      })

      setProjects(mockProjects)
      setSchedules(mockSchedules)
      setFilteredSchedules(mockSchedules)
      setIsLoading(false)
    }, 1500)
  }, [])

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
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
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
