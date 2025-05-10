'use client';

import { DashboardHero } from "@/components/dashboard-hero"
import { ProjectGrid, ProjectWithUIData } from "@/components/project-grid"
import { DashboardFooter } from "@/components/dashboard-footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useProjects } from "@/hooks/useProjects"
import { Loader2 } from "lucide-react"
import { ErrorAlert } from "@/components/ui/ErrorAlert"

export default function Dashboard() {
  const { data: projects, isLoading, error } = useProjects();

  // Map API projects to ProjectWithUIData format
  const projectsWithUI: ProjectWithUIData[] = projects?.map(project => ({
    ...project,
    // You'll need to fetch this data from an actual API endpoint in a real implementation
    // For now, we'll add some placeholder UI data
    status: Math.random() > 0.7 ? 'error' : Math.random() > 0.4 ? 'warning' : 'active',
    lastRun: ['1 hour ago', '2 hours ago', '1 day ago', '3 days ago'][Math.floor(Math.random() * 4)],
    duration: ['2m 30s', '45s', '1m 15s', 'Failed'][Math.floor(Math.random() * 4)],
  })) || [];

  const dashboardContent = (
    <main className="flex-1">
      <DashboardHero />
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading projects...</span>
          </div>
        ) : error ? (
          <ErrorAlert
            title="Error loading projects"
            message={error instanceof Error ? error.message : "An unknown error occurred"}
          />
        ) : (
          <ProjectGrid projects={projectsWithUI} />
        )}
      </div>
      <DashboardFooter />
    </main>
  );

  return (
    <ProtectedRoute>
      {dashboardContent}
    </ProtectedRoute>
  );
}
