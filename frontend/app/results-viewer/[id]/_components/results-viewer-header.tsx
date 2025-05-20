"use client"

import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ResultsViewerHeaderProps {
  projectName: string
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function ResultsViewerHeader({ projectName, searchQuery, setSearchQuery }: ResultsViewerHeaderProps) {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link
              href="/job-history"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Job History
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Results Viewer</h1>
            <p className="text-muted-foreground mt-1">Data extracted from your last run of {projectName}</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search data..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
