import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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