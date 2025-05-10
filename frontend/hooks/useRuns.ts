import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Run } from '@/types';
import { QueryObserverResult } from '@tanstack/react-query';

export interface CreateRunInput {
  projectId: number;
  url?: string;
  urls?: string[];
  config?: Record<string, any>;
}

// Query keys
export const runKeys = {
  all: ['runs'] as const,
  details: (id: number) => [...runKeys.all, id] as const,
  byProject: (projectId: number) => [...runKeys.all, 'by-project', projectId] as const,
};

// Get runs for a project
export function useProjectRuns(projectId: number) {
  return useQuery<Run[]>({
    queryKey: runKeys.byProject(projectId),
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/runs`);
      return response.data as Run[];
    },
    enabled: !!projectId,
  });
}

// Get a single run by ID
export function useRun(id: number): QueryObserverResult<Run> {
  return useQuery<Run>({
    queryKey: runKeys.details(id),
    queryFn: async () => {
      const response = await api.get(`/runs/${id}`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: (data) => {
      // Poll more frequently if the run is still in progress
      if (data && (data.status === 'pending' || data.status === 'running')) {
        return 3000; // 3 seconds
      }
      return false; // Don't poll if completed or failed
    },
  });
}

// Create a new run
export function useCreateRun() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (input: CreateRunInput) => {
      const { projectId, ...data } = input;
      const response = await api.post(`/projects/${projectId}/runs`, data);
      return response.data as Run;
    },
    onSuccess: (data, variables) => {
      // Invalidate project runs
      queryClient.invalidateQueries({ queryKey: runKeys.byProject(variables.projectId) });
      
      // Show success message
      toast.success('Run started successfully!');
      
      // Navigate to the run results page
      router.push(`/results-viewer/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to start run: ${error.response?.data?.detail || error.message}`);
    },
  });
}

// Retry failed URLs in a run
export function useRetryFailedUrls() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, runId }: { projectId: number; runId: number }) => {
      const response = await api.post(`/projects/${projectId}/runs/${runId}/retry`);
      return response.data as { retried: number };
    },
    onSuccess: (data, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: runKeys.details(variables.runId) });
      
      // Show success message
      toast.success(`Retrying ${data.retried} failed URLs`);
    },
    onError: (error: any) => {
      toast.error(`Failed to retry URLs: ${error.response?.data?.detail || error.message}`);
    },
  });
} 