"use client"

import { cn } from "@/lib/utils"
import type { TabType } from "@/app/projects/[id]/settings/page"

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: "general", label: "General" },
    { id: "anti-bot", label: "Anti-Bot & CAPTCHA" },
    { id: "proxy", label: "Proxy & Geo" },
    { id: "integrations", label: "Integrations & Exports" },
    { id: "field-mappings", label: "Field Mappings" },
  ]

  return (
    <div className="border-b">
      <nav className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabType)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150",
              activeTab === tab.id
                ? "text-[#4F46E5] border-b-2 border-[#4F46E5]"
                : "text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-gray-200",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
