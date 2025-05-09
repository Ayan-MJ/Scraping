"use client"

import { useState, useEffect } from "react"
import { ProjectSettingsHeader } from "@/components/project-settings/project-settings-header"
import { TabNavigation } from "@/components/project-settings/tab-navigation"
import { GeneralSettings } from "@/components/project-settings/general-settings"
import { AntiBotSettings } from "@/components/project-settings/anti-bot-settings"
import { ProxySettings } from "@/components/project-settings/proxy-settings"
import { IntegrationsSettings } from "@/components/project-settings/integrations-settings"
import { FieldMappingsSettings } from "@/components/project-settings/field-mappings-settings"
import { ProjectSettingsFooter } from "@/components/project-settings/project-settings-footer"
import { useToast } from "@/hooks/use-toast"
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
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Fetch project settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data
      const mockSettings: ProjectSettings = {
        id: params.id,
        name: "E-commerce Product Scraper",
        description: "Scrapes product details from major e-commerce websites",
        concurrency: 10,
        cloudRegion: "us-east-1",
        captchaSolver: {
          enabled: true,
          provider: "2captcha",
          apiKey: "mock-api-key-12345",
        },
        behaviorSimulation: {
          randomMouseMovements: true,
          randomClickDelays: true,
          customJavaScript: "// Add custom behavior here\nconsole.log('Custom behavior loaded');\n",
        },
        proxy: {
          useProxyPool: true,
          proxies: [
            {
              id: "proxy-1",
              host: "proxy1.example.com",
              port: 8080,
              username: "user1",
              password: "pass1",
            },
            {
              id: "proxy-2",
              host: "proxy2.example.com",
              port: 8080,
              username: "user2",
              password: "pass2",
            },
          ],
          simulateLocation: "United States",
          autoRotateLocation: false,
        },
        integrations: {
          exportFormats: {
            csv: true,
            json: true,
            excel: false,
          },
          webhook: {
            enabled: false,
            url: "",
          },
          apiKey: "sk_live_mock_api_key_for_project_12345",
        },
        fieldMappings: [
          {
            id: "mapping-1",
            targetField: "price",
            transformationType: "regex",
            parameters: "\\$([0-9.]+)",
          },
          {
            id: "mapping-2",
            targetField: "title",
            transformationType: "trim",
            parameters: "",
          },
        ],
      }

      setSettings(mockSettings)
      setIsLoading(false)
    }

    fetchSettings()
  }, [params.id])

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
      <div className="min-h-screen bg-[#F9FAFB] p-4">
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
    <div className="min-h-screen bg-[#F9FAFB]">
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
