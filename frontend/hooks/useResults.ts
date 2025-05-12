import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Result, PaginatedResponse } from '@/types';

// Query keys
export const resultKeys = {
  all: ['results'] as const,
  byRun: (runId: number) => [...resultKeys.all, 'by-run', runId] as const,
  failed: (runId: number) => [...resultKeys.all, 'failed', runId] as const,
  detail: (resultId: number) => [...resultKeys.all, 'detail', resultId] as const,
};

/**
 * Hook to fetch paginated results for a specific run
 * 
 * @param runId The ID of the run to get results for
 * @param page Page number for pagination (optional)
 * @param size Number of results per page (optional)
 */
export function useRunResults(
  runId: number,
  page: number = 1,
  size: number = 50
) {
  return useQuery<PaginatedResponse<Result>>({
    queryKey: [...resultKeys.byRun(runId), { page, size }],
    queryFn: async () => {
      const response = await api.get(`/runs/${runId}/results`, {
        params: { page, size }
      });
      return response.data;
    },
    enabled: !!runId,
  });
}

/**
 * Hook to fetch a single result by ID
 * 
 * @param resultId The ID of the result to fetch
 */
export function useResult(resultId: number) {
  return useQuery<Result>({
    queryKey: resultKeys.detail(resultId),
    queryFn: async () => {
      const response = await api.get(`/results/${resultId}`);
      return response.data;
    },
    enabled: !!resultId,
  });
}

/**
 * Hook to fetch failed results for a specific run
 * 
 * @param runId The ID of the run to get failed results for
 */
export function useFailedResults(runId: number) {
  return useQuery<Result[]>({
    queryKey: resultKeys.failed(runId),
    queryFn: async () => {
      const response = await api.get(`/runs/${runId}/results/failed`);
      return response.data;
    },
    enabled: !!runId,
  });
}

/**
 * Export useRunResults as useResults to maintain backward compatibility
 */
export const useResults = useRunResults; 