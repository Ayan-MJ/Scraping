'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  
  const content = () => {
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
        
        {!projects || projects.length === 0 ? (
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
            {projects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <ProtectedRoute>
      {content()}
    </ProtectedRoute>
  );
}

// Project card component
function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-6 pb-3">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold">{project.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || 'No description provided'}
        </p>
      </CardHeader>
      <CardContent className="p-6 pt-0 pb-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span>Created: {format(new Date(project.created_at), 'PPP')}</span>
          </div>
          <div className="flex items-center">
            <span>Updated: {format(new Date(project.updated_at), 'PPP')}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/30">
        <div className="flex gap-2 w-full">
          <Button asChild variant="secondary" className="flex-1">
            <Link href={`/projects/${project.id}/settings`}>
              Settings
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/projects/${project.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 