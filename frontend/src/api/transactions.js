import api from './axios';

export const getTransactions = (projectId, params) => api.get(`/projects/${projectId}/transactions`, { params });
export const exportTransactions = (projectId, params) => api.get(`/projects/${projectId}/transactions/export`, { params, responseType: 'blob' });
