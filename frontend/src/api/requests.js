import api from './axios';

export const createRequest = (projectId, formData) =>
  api.post(`/projects/${projectId}/requests`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getRequests = (projectId, params) => api.get(`/projects/${projectId}/requests`, { params });
export const getRequest = (projectId, reqId) => api.get(`/projects/${projectId}/requests/${reqId}`);
export const approveRequest = (projectId, reqId) => api.put(`/projects/${projectId}/requests/${reqId}/approve`);
export const rejectRequest = (projectId, reqId, data) => api.put(`/projects/${projectId}/requests/${reqId}/reject`, data);
export const markTransferred = (projectId, reqId) => api.put(`/projects/${projectId}/requests/${reqId}/transfer`);
export const confirmReceipt = (projectId, reqId) => api.put(`/projects/${projectId}/requests/${reqId}/confirm`);
