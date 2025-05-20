import Link from 'next/link'
import { Project as ApiProject } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { CalendarDays, ChevronRight, Clock, Plus } from 'lucide-react'

// Extended Project type for UI display purposes
export interface ProjectWithUIData extends ApiProject {
  status?: 'active' | 'warning' | 'error'
  lastRun?: string
  duration?: string
}

// Accept either our API Project type or the extended UI version
export interface ProjectGridProps {
  projects: ProjectWithUIData[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
        <div className="text-2xl font-bold">No projects yet</div>
        <p className="text-muted-foreground">Create your first project to get started.</p>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <div className="flex justify-between">
              <h3 className="text-xl font-bold">{project.name}</h3>
              {project.status && (
                <Badge
                  className={
                    project.status === 'active'
                      ? 'bg-success text-success-foreground'
                      : project.status === 'warning'
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-destructive text-destructive-foreground'
                  }
                >
                  {project.status}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || 'No description provided'}
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0 pb-4">
            <div className="space-y-2 text-sm">
              {project.lastRun && (
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Last run: {project.lastRun}</span>
                </div>
              )}
              {project.duration && (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Duration: {project.duration}</span>
                </div>
              )}
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 bg-muted/30">
            <Link href={`/projects/${project.id}`} className="w-full">
              <Button className="w-full" variant="secondary">
                <span>View Project</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
