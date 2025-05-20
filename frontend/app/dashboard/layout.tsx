"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeSettings } from "@/components/theme-settings"
import { ThemeModeToggle } from "@/components/theme-mode-toggle"
import {
  BarChart,
  Clock,
  FileSpreadsheet,
  Home,
  Layers,
  Settings,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Projects", href: "/projects", icon: Layers },
    { name: "Job History", href: "/job-history", icon: Clock },
    { name: "Results", href: "/results-viewer", icon: FileSpreadsheet },
    { name: "Schedule", href: "/schedule-manager", icon: BarChart },
    { name: "Account", href: "/account/settings", icon: User },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">
              Scrape<span className="text-brand-green">Wizard</span>
            </span>
          </Link>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start h-10",
                pathname === item.href || pathname?.startsWith(`${item.href}/`)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            </Button>
          ))}
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/projects/new">
              <span>New Project</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top navbar */}
        <header className="h-16 border-b flex items-center justify-between px-6">
          <Breadcrumb />
          <div className="flex items-center space-x-2">
            <ThemeModeToggle />
            <ThemeSettings />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 