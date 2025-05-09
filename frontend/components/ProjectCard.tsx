import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronRight, Settings, PlayCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type Project } from '@/hooks/useProjects';
import { RunButton } from '@/components/ui/RunButton';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const lastUpdated = new Date(project.updated_at);
  
  return (
    <Card className="flex flex-col transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-xl">{project.name}</CardTitle>
          <CardDescription className="mt-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </div>
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/settings`}>
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || 'No description provided'}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {project.configuration?.selector_schema && (
            <Badge variant="secondary">
              {Object.keys(project.configuration.selector_schema).length} Fields
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/job-history/${project.id}`}>
            History
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <RunButton
          projectId={project.id}
          size="sm"
          config={project.configuration}
        />
      </CardFooter>
    </Card>
  );
} 