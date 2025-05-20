"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function AccountSettingsHeader() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground">Account Settings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        </div>
      </div>
    </header>
  )
}
