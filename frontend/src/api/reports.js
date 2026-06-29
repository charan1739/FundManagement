import api from './axios';

export const getProjectSummary = (projectId) => api.get(`/projects/${projectId}/reports/summary`);
export const getMonthlyReport = (projectId, params) => api.get(`/projects/${projectId}/reports/monthly`, { params });
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);
