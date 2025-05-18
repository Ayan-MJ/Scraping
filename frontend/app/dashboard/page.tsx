"use client"

import { useProjects } from "@/hooks/useProjects"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Clock, Download, Filter, Grid, ListFilter, Plus, Users } from "lucide-react"
import Link from "next/link"
import { ProjectWithUIData } from "@/components/project-grid"
import { ProjectCard } from "@/components/project-card"
import { format } from "date-fns"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardPage() {
  const { data: projects, isLoading } = useProjects()

  // Quick stats calculation
  const totalProjects = projects?.length || 0
  const activeProjects = projects?.filter(p => p.status !== "inactive").length || 0
  const recentActivity = [
    { type: "project_created", name: "E-commerce Scraper", time: "2 hours ago" },
    { type: "run_completed", name: "News Articles Extractor", time: "Yesterday" },
    { type: "run_failed", name: "Social Media Profiles", time: "3 days ago" },
  ]

  // Map API projects to ProjectWithUIData format for display
  const projectsWithUI: ProjectWithUIData[] = projects?.slice(0, 3).map(project => ({
    ...project,
    status: Math.random() > 0.7 ? 'error' : Math.random() > 0.4 ? 'warning' : 'active',
    lastRun: ['1 hour ago', '2 hours ago', '1 day ago', '3 days ago'][Math.floor(Math.random() * 4)],
    duration: ['2m 30s', '45s', '1m 15s', 'Failed'][Math.floor(Math.random() * 4)],
  })) || []

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumb />
          <h1 className="text-3xl font-bold mt-4 mb-2 animate-fade-in">Dashboard</h1>
          <p className="text-muted-foreground animate-fade-in delay-100">View your scraping activity and performance metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="animate-fade-in delay-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">+3 new this month</div>
            </CardContent>
            <CardFooter className="pt-0">
              <Grid className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">All projects</span>
            </CardFooter>
          </Card>

          <Card className="animate-fade-in delay-150">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {activeProjects > 0 ? (activeProjects / totalProjects * 100).toFixed() : 0}% active rate
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Users className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Active users</span>
            </CardFooter>
          </Card>

          <Card className="animate-fade-in delay-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">152</div>
              <div className="text-xs text-green-500 mt-1">+24% from last month</div>
            </CardContent>
            <CardFooter className="pt-0">
              <BarChart className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">View statistics</span>
            </CardFooter>
          </Card>

          <Card className="animate-fade-in delay-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Exported Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1.2GB</div>
              <div className="text-xs text-muted-foreground mt-1">Total exported data</div>
            </CardContent>
            <CardFooter className="pt-0">
              <Download className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Download all</span>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="mb-8 animate-fade-in delay-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Projects</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/projects">
                View all
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading projects...</p>
            ) : projectsWithUI.length > 0 ? (
              projectsWithUI.map(project => (
                <ProjectCard key={project.id} project={{
                  id: project.id.toString(),
                  name: project.name,
                  status: project.status,
                  lastRun: project.lastRun,
                  duration: project.duration
                }} />
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No projects yet</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/projects/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="animate-fade-in delay-400">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start">
                    <div className="mr-4">
                      {activity.type === "project_created" && (
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                          <Plus className="h-4 w-4" />
                        </div>
                      )}
                      {activity.type === "run_completed" && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Clock className="h-4 w-4" />
                        </div>
                      )}
                      {activity.type === "run_failed" && (
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
                          <ListFilter className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.type === "project_created" && "Project created"}
                        {activity.type === "run_completed" && "Run completed successfully"}
                        {activity.type === "run_failed" && "Run failed"}
                        <span className="mx-1">•</span>
                        <span>{activity.time}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Activity</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
} 