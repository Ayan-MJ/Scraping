import { useQuery } from '@tanstack/react-query';
import { templatesApi } from '@/lib/api';

// Types
export interface Template {
  id: number;
  name: string;
  description: string;
  thumbnail_url?: string;
  selector_schema: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Query keys
export const templateKeys = {
  all: ['templates'] as const,
  details: (id: number) => [...templateKeys.all, id] as const,
};

// Hooks
export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.all,
    queryFn: async () => {
      const response = await templatesApi.getAll();
      return response.data as Template[];
    },
  });
}

export function useTemplate(id: number) {
  return useQuery({
    queryKey: templateKeys.details(id),
    queryFn: async () => {
      const response = await templatesApi.getById(id);
      return response.data as Template;
    },
    enabled: !!id,
  });
} 