import axios from 'axios';
import { supabase, getCurrentSession } from './supabase';

// Base API configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach the JWT token
api.interceptors.request.use(
  async (config) => {
    const session = await getCurrentSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is a 401 (Unauthorized) and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the session
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          throw refreshError;
        }
        
        // If we got a new token, retry the original request
        if (data.session?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        
        // Redirect to login page if we can't refresh the token
        // This is a client-side only operation
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const templatesApi = {
  getAll: () => api.get('/templates'),
  getById: (id: number) => api.get(`/templates/${id}`),
};

export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id: number) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: number, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

export const runsApi = {
  create: (projectId: number, data: any = {}) => api.post(`/projects/${projectId}/runs`, data),
  getById: (id: number) => api.get(`/runs/${id}`),
  getResults: (runId: number, params?: { page?: number; pageSize?: number }) => 
    api.get(`/runs/${runId}/results`, { params }),
};

export const schedulesApi = {
  getAll: (projectId: number) => api.get(`/projects/${projectId}/schedules`),
  create: (projectId: number, data: any) => api.post(`/projects/${projectId}/schedules`, data),
};

export default api; 