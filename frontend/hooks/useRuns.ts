import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { runsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Types
export interface Run {
  id: number;
  project_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  url?: string;
  urls?: string[];
  template_id?: number;
  config?: {
    selector_schema?: Record<string, any>;
    [key: string]: any;
  };
  results?: Record<string, any>;
  error?: string;
  records_extracted?: number;
  created_at: string;
  updated_at: string;
  finished_at?: string;
}

export interface CreateRunInput {
  projectId: number;
  url?: string;
  urls?: string[];
  templateId?: number;
  config?: Record<string, any>;
}

// Query keys
export const runKeys = {
  all: ['runs'] as const,
  details: (id: number) => [...runKeys.all, id] as const,
  byProject: (projectId: number) => [...runKeys.all, 'by-project', projectId] as const,
};

// Hooks
export function useRun(id: number) {
  return useQuery({
    queryKey: runKeys.details(id),
    queryFn: async () => {
      const response = await runsApi.getById(id);
      return response.data as Run;
    },
    enabled: !!id,
    refetchInterval: (data) => {
      // Poll more frequently if the run is still in progress
      if (data?.status === 'pending' || data?.status === 'running') {
        return 3000; // 3 seconds
      }
      return false; // Don't poll if completed or failed
    },
  });
}

export function useCreateRun() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (input: CreateRunInput) => {
      const { projectId, ...data } = input;
      const response = await runsApi.create(projectId, data);
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
      toast.error(`Failed to start run: ${error.message}`);
    },
  });
} 