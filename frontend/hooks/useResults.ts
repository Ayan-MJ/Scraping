import { useQuery, useQueryClient } from '@tanstack/react-query';
import { runsApi } from '@/lib/api';

// Types
export interface ResultData {
  url: string;
  title: string;
  extracted_at: string;
  fields: Record<string, any>;
  [key: string]: any;
}

export interface Result {
  id: number;
  run_id: number;
  data: ResultData;
  created_at: string;
}

// Query keys
export const resultKeys = {
  all: ['results'] as const,
  run: (runId: number) => [...resultKeys.all, 'run', runId] as const,
  runPaginated: (runId: number, page = 0, pageSize = 20) => 
    [...resultKeys.run(runId), { page, pageSize }] as const,
  detail: (resultId: number) => [...resultKeys.all, 'detail', resultId] as const,
};

// Hooks
export function useResults(runId: number, page = 0, pageSize = 20) {
  return useQuery({
    queryKey: resultKeys.runPaginated(runId, page, pageSize),
    queryFn: async () => {
      const response = await runsApi.getResults(runId, { page, pageSize });
      return response.data as Result[];
    },
    enabled: !!runId,
    keepPreviousData: true, // Keep previous data while fetching new data
  });
}

// Utility hook to manage refreshing results
export function useResultsRefresh(runId: number, intervalMs = 0) {
  // For automatic polling at specified intervals (0 means disabled)
  return useQuery({
    queryKey: [...resultKeys.run(runId), 'refresh'],
    queryFn: async () => {
      const response = await runsApi.getById(runId);
      return {
        runStatus: response.data.status,
        recordsExtracted: response.data.records_extracted || 0,
        finishedAt: response.data.finished_at,
        updatedAt: response.data.updated_at,
      };
    },
    enabled: !!runId && !!intervalMs,
    refetchInterval: intervalMs,
  });
}

// Generate unique field keys from results
export function useResultFields(results: Result[] | undefined) {
  if (!results || results.length === 0) return [];
  
  // Get all unique fields across all results
  const fieldKeys = new Set<string>();
  
  results.forEach(result => {
    if (result.data?.fields) {
      Object.keys(result.data.fields).forEach(key => fieldKeys.add(key));
    }
  });
  
  return Array.from(fieldKeys);
} 