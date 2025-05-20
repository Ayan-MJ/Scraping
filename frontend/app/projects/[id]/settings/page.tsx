"use client"

import { useState, useEffect } from "react"
import { ProjectSettingsHeader } from "./_components/project-settings-header"
import { TabNavigation } from "./_components/tab-navigation"
import { GeneralSettings } from "./_components/general-settings"
import { AntiBotSettings } from "./_components/anti-bot-settings"
import { ProxySettings } from "./_components/proxy-settings"
import { IntegrationsSettings } from "./_components/integrations-settings"
import { FieldMappingsSettings } from "./_components/field-mappings-settings"
import { ProjectSettingsFooter } from "./_components/project-settings-footer"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export type TabType = "general" | "anti-bot" | "proxy" | "integrations" | "field-mappings"

export interface ProjectSettings {
  id: string
  name: string
  description: string
  concurrency: number
  cloudRegion: string
  captchaSolver: {
    enabled: boolean
    provider: string
    apiKey: string
  }
  behaviorSimulation: {
    randomMouseMovements: boolean
    randomClickDelays: boolean
    customJavaScript: string
  }
  proxy: {
    useProxyPool: boolean
    proxies: Array<{
      id: string
      host: string
      port: number
      username: string
      password: string
    }>
    simulateLocation: string
    autoRotateLocation: boolean
  }
  integrations: {
    exportFormats: {
      csv: boolean
      json: boolean
      excel: boolean
    }
    webhook: {
      enabled: boolean
      url: string
    }
    apiKey: string
  }
  fieldMappings: Array<{
    id: string
    targetField: string
    transformationType: string
    parameters: string
  }>
}

export default function ProjectSettingsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [settings, setSettings] = useState<ProjectSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Data fetching removed: integrate real API here.

  const handleSettingsChange = (newSettings: Partial<ProjectSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...newSettings })
      setHasChanges(true)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Settings saved",
      description: "Your project settings have been updated successfully.",
    })

    setIsSaving(false)
    setHasChanges(false)
  }

  const handleCancel = () => {
    // Reload settings from server
    setIsLoading(true)
    setTimeout(() => {
      // This would normally re-fetch from the API
      setIsLoading(false)
      setHasChanges(false)
    }, 500)
  }

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-secondary p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <ProjectSettingsHeader
        projectName={settings.name}
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      <div className="container mx-auto px-4 py-6">
        {isMobile ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="general">
              <AccordionTrigger className="text-lg font-semibold">General</AccordionTrigger>
              <AccordionContent>
                <GeneralSettings settings={settings} onChange={handleSettingsChange} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="anti-bot">
              <AccordionTrigger className="text-lg font-semibold">Anti-Bot & CAPTCHA</AccordionTrigger>
              <AccordionContent>
                <AntiBotSettings settings={settings} onChange={handleSettingsChange} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="proxy">
              <AccordionTrigger className="text-lg font-semibold">Proxy & Geo</AccordionTrigger>
              <AccordionContent>
                <ProxySettings settings={settings} onChange={handleSettingsChange} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="integrations">
              <AccordionTrigger className="text-lg font-semibold">Integrations & Exports</AccordionTrigger>
              <AccordionContent>
                <IntegrationsSettings settings={settings} onChange={handleSettingsChange} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="field-mappings">
              <AccordionTrigger className="text-lg font-semibold">Field Mappings</AccordionTrigger>
              <AccordionContent>
                <FieldMappingsSettings settings={settings} onChange={handleSettingsChange} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <>
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="mt-6 bg-white rounded-lg border p-6">
              {activeTab === "general" && <GeneralSettings settings={settings} onChange={handleSettingsChange} />}

              {activeTab === "anti-bot" && <AntiBotSettings settings={settings} onChange={handleSettingsChange} />}

              {activeTab === "proxy" && <ProxySettings settings={settings} onChange={handleSettingsChange} />}

              {activeTab === "integrations" && (
                <IntegrationsSettings settings={settings} onChange={handleSettingsChange} />
              )}

              {activeTab === "field-mappings" && (
                <FieldMappingsSettings settings={settings} onChange={handleSettingsChange} />
              )}
            </div>
          </>
        )}

        <ProjectSettingsFooter
          onCancel={handleCancel}
          onSave={handleSave}
          hasChanges={hasChanges}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}
