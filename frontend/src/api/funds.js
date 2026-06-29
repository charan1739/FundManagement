import api from './axios';

export const addFunds = (projectId, formData) =>
  api.post(`/projects/${projectId}/funds`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getFunds = (projectId, params) => api.get(`/projects/${projectId}/funds`, { params });
