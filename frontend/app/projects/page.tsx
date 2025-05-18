'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ProjectCard } from '@/components/project-card';
import { format } from 'date-fns';

// Adapter function to convert Project to ProjectCard format
const adaptProjectForCard = (project: Project) => {
  return {
    id: project.id.toString(),
    name: project.name,
    status: "active" as const, // Default to active
    lastRun: project.updated_at ? format(new Date(project.updated_at), 'PPP') : 'Not run yet',
    duration: "N/A" // Placeholder
  };
};

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  
  const content = () => {
    if (isLoading) {
      return (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Projects</h1>
            <p className="text-muted-foreground animate-fade-in delay-100">Manage your web scraping projects</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="bg-brand-green hover:bg-brand-green-dark text-white group" asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                New Project
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6 animate-fade-in delay-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9 bg-background border-border focus:border-brand-green"
            />
          </div>
          <Button variant="outline" className="text-muted-foreground">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {!projects || projects.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center animate-fade-in delay-300">
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first scraping project.
            </p>
            <Button className="bg-brand-green hover:bg-brand-green-dark text-white" asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in delay-300">
            {projects.map((project: Project) => (
              <ProjectCard key={project.id} project={adaptProjectForCard(project)} />
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