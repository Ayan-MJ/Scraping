'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/ProjectCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading projects...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <ErrorAlert 
        title="Failed to load projects"
        message={error instanceof Error ? error.message : 'An unknown error occurred'}
      />
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>
      
      {projects?.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first scraping project.
          </p>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
} 