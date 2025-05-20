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
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Fetch account settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data
      const mockSettings: AccountSettings = {
        profile: {
          fullName: "John Doe",
          email: "john.doe@example.com",
          apiKey: "sk_live_mock_api_key_12345",
        },
        team: {
          pendingInvites: [
            {
              id: "invite-1",
              email: "alice@example.com",
              role: "editor",
              sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
            {
              id: "invite-2",
              email: "bob@example.com",
              role: "viewer",
              sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            },
          ],
          members: [
            {
              id: "member-1",
              name: "John Doe",
              email: "john.doe@example.com",
              role: "admin",
              joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
            },
            {
              id: "member-2",
              name: "Jane Smith",
              email: "jane.smith@example.com",
              role: "editor",
              joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            },
            {
              id: "member-3",
              name: "Mike Johnson",
              email: "mike.johnson@example.com",
              role: "viewer",
              joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
          ],
        },
        billing: {
          plan: {
            name: "Professional",
            description: "For teams and advanced scraping needs",
            cost: "$49/month",
            features: [
              "Unlimited projects",
              "10,000 pages/month",
              "Advanced anti-bot protection",
              "Team collaboration",
              "API access",
            ],
          },
          usage: {
            jobsRun: {
              current: 156,
              limit: 500,
              history: [45, 62, 78, 95, 110, 125, 140, 156],
            },
            dataRecords: {
              current: 7850,
              limit: 10000,
              history: [1200, 2400, 3600, 4500, 5200, 6100, 7000, 7850],
            },
            proxyCalls: {
              current: 3200,
              limit: 5000,
              history: [400, 800, 1200, 1600, 2000, 2400, 2800, 3200],
            },
          },
          paymentMethod: {
            cardType: "Visa",
            lastFour: "4242",
            expiryDate: "12/2025",
          },
        },
        proxyPool: {
          proxies: [
            {
              id: "proxy-1",
              name: "US Proxy 1",
              host: "us-proxy1.example.com",
              port: 8080,
              username: "user1",
              password: "pass1",
              location: "United States",
              active: true,
            },
            {
              id: "proxy-2",
              name: "UK Proxy",
              host: "uk-proxy.example.com",
              port: 8080,
              username: "user2",
              password: "pass2",
              location: "United Kingdom",
              active: true,
            },
            {
              id: "proxy-3",
              name: "Germany Proxy",
              host: "de-proxy.example.com",
              port: 8080,
              username: "user3",
              password: "pass3",
              location: "Germany",
              active: false,
            },
          ],
          quota: {
            total: 3,
            active: 2,
            limit: 5,
          },
        },
      }

      setSettings(mockSettings)
      setIsLoading(false)
    }

    fetchSettings()
  }, [])

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
