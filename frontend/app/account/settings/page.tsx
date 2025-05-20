"use client"

import { useState, useEffect } from "react"
import { AccountSettingsHeader } from "./_components/account-settings-header"
import { TabNavigation } from "./_components/tab-navigation"
import { ProfileSettings } from "./_components/profile-settings"
import { TeamManagementSettings } from "./_components/team-management-settings"
import { BillingSettings } from "./_components/billing-settings"
import { ProxyPoolSettings } from "./_components/proxy-pool-settings"
import { AccountSettingsFooter } from "./_components/account-settings-footer"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"

export type TabType = "profile" | "team" | "billing" | "proxy"

export interface AccountSettings {
  profile: {
    fullName: string
    email: string
    apiKey: string
  }
  team: {
    pendingInvites: Array<{
      id: string
      email: string
      role: "viewer" | "editor" | "admin"
      sentAt: Date
    }>
    members: Array<{
      id: string
      name: string
      email: string
      role: "viewer" | "editor" | "admin"
      joinedAt: Date
    }>
  }
  billing: {
    plan: {
      name: string
      description: string
      cost: string
      features: string[]
    }
    usage: {
      jobsRun: {
        current: number
        limit: number
        history: number[]
      }
      dataRecords: {
        current: number
        limit: number
        history: number[]
      }
      proxyCalls: {
        current: number
        limit: number
        history: number[]
      }
    }
    paymentMethod: {
      cardType: string
      lastFour: string
      expiryDate: string
    }
  }
  proxyPool: {
    proxies: Array<{
      id: string
      name: string
      host: string
      port: number
      username: string
      password: string
      location: string
      active: boolean
    }>
    quota: {
      total: number
      active: number
      limit: number
    }
  }
}

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [settings, setSettings] = useState<AccountSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Data fetching removed: integrate real API here.

  const handleSettingsChange = (newSettings: Partial<AccountSettings>) => {
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
      description: "Your account settings have been updated successfully.",
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
      <div className="min-h-screen bg-[#18181b] p-4">
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
    <div className="min-h-screen bg-[#18181b]">
      <AccountSettingsHeader />

      <div className="container mx-auto px-4 py-6">
        {isMobile ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="profile">
              <AccordionTrigger className="text-lg font-semibold">Profile</AccordionTrigger>
              <AccordionContent>
                <Card className="bg-[#232329] text-white border-none">
                  <ProfileSettings settings={settings} onChange={handleSettingsChange} />
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="team">
              <AccordionTrigger className="text-lg font-semibold">Team Management</AccordionTrigger>
              <AccordionContent>
                <Card className="bg-[#232329] text-white border-none">
                  <TeamManagementSettings settings={settings} onChange={handleSettingsChange} />
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="billing">
              <AccordionTrigger className="text-lg font-semibold">Billing & Usage</AccordionTrigger>
              <AccordionContent>
                <Card className="bg-[#232329] text-white border-none">
                  <BillingSettings settings={settings} onChange={handleSettingsChange} />
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="proxy">
              <AccordionTrigger className="text-lg font-semibold">Global Proxy Pool</AccordionTrigger>
              <AccordionContent>
                <Card className="bg-[#232329] text-white border-none">
                  <ProxyPoolSettings settings={settings} onChange={handleSettingsChange} />
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <>
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            <Card className="mt-6 bg-[#232329] text-white border-none p-6">
              {activeTab === "profile" && <ProfileSettings settings={settings} onChange={handleSettingsChange} />}

              {activeTab === "team" && <TeamManagementSettings settings={settings} onChange={handleSettingsChange} />}

              {activeTab === "billing" && <BillingSettings settings={settings} onChange={handleSettingsChange} />}

              {activeTab === "proxy" && <ProxyPoolSettings settings={settings} onChange={handleSettingsChange} />}
            </Card>
          </>
        )}

        <AccountSettingsFooter
          onCancel={handleCancel}
          onSave={handleSave}
          hasChanges={hasChanges}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}
