// User type from Supabase Auth
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

// Project type matching backend Project model
export interface Project {
  id: number;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Run type matching backend Run model
export interface Run {
  id: number;
  project_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  config: Record<string, any>;
  urls: string[];
  total_urls: number;
  processed_urls: number;
  success_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Result type matching backend Result model
export interface Result {
  id: number;
  run_id: number;
  url: string;
  status: 'success' | 'failed';
  data: Record<string, any>;
  error_message?: string;
  created_at: string;
}

// Template type matching backend Template model
export interface Template {
  id: number;
  name: string;
  description?: string;
  thumbnail_url?: string;
  selector_schema: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Schedule type matching backend Schedule model
export interface Schedule {
  id: number;
  project_id: number;
  cron_expression: string;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

// Paginated response type for lists of items
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
} 