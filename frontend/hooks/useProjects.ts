import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Project, PaginatedResponse } from '@/types';

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
      const response = await api.get('/projects');
      return response.data as Project[];
    },
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.details(id),
    queryFn: async () => {
      const response = await api.get(`/projects/${id}`);
      return response.data as Project;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newProject: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const response = await api.post('/projects', newProject);
      return response.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create project: ${error.response?.data?.detail || error.message}`);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Project> & { id: number }) => {
      const response = await api.put(`/projects/${id}`, data);
      return response.data as Project;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update project: ${error.response?.data?.detail || error.message}`);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete project: ${error.response?.data?.detail || error.message}`);
    },
  });
} 