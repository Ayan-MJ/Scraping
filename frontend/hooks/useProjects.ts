import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

// Types
export interface Project {
  id: number;
  name: string;
  description: string;
  configuration: {
    selector_schema?: Record<string, any>;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

// Query key
export const projectKeys = {
  all: ['projects'] as const,
  details: (id: number) => [...projectKeys.all, id] as const,
};

// Hooks
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response.data as Project[];
    },
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.details(id),
    queryFn: async () => {
      const response = await projectsApi.getById(id);
      return response.data as Project;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newProject: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await projectsApi.create(newProject);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Project> & { id: number }) => {
      const response = await projectsApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await projectsApi.delete(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });
} 