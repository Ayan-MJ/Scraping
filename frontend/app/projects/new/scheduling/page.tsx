"use client"

import { useState, useEffect } from "react"
import { WizardHeader } from "@/components/wizard/wizard-header"
import { WizardSidebar } from "@/components/wizard/wizard-sidebar"
import { WizardFooter } from "@/components/wizard/wizard-footer"
import { ScheduleForm } from "@/components/wizard/schedule-form"
import { NextRunsPreview } from "@/components/wizard/next-runs-preview"
import { calculateNextRuns } from "@/lib/schedule-utils"

export type FrequencyType = "one-off" | "hourly" | "daily" | "weekly" | "custom"

export interface ScheduleConfig {
  frequency: FrequencyType
  time?: string
  weekdays?: string[]
  cronExpression?: string
  detectChanges: boolean
  changeInterval: string
}

export default function SchedulingPage() {
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    frequency: "daily",
    time: "09:00",
    weekdays: ["monday", "wednesday", "friday"],
    cronExpression: "0 9 * * *",
    detectChanges: false,
    changeInterval: "1h",
  })

  const [nextRuns, setNextRuns] = useState<Date[]>([])
  const [isValid, setIsValid] = useState(true)

  // Calculate next runs whenever schedule config changes
  useEffect(() => {
    try {
      const runs = calculateNextRuns(scheduleConfig, 3)
      setNextRuns(runs)
      setIsValid(true)
    } catch (error) {
      console.error("Invalid schedule configuration:", error)
      setNextRuns([])
      setIsValid(false)
    }
  }, [scheduleConfig])

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <WizardHeader currentStep={4} totalSteps={5} />

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create New Scraper</h1>
            <p className="mt-1 text-muted-foreground">Step 4 of 5: Schedule Your Scrape</p>
          </div>

          <ScheduleForm config={scheduleConfig} setConfig={setScheduleConfig} />
        </div>

        <WizardSidebar title="Next Runs Preview" content={<NextRunsPreview nextRuns={nextRuns} />} />
      </div>

      <WizardFooter
        nextEnabled={isValid}
        nextStep="Review & Launch"
        nextLink="/projects/new/review"
        backLink="/projects/new/selector-builder"
      />
    </div>
  )
}
