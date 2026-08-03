import api from './axios';

export const createRequest = (projectId, formData) =>
  api.post(`/groups/${projectId}/requests`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getRequests = (projectId, params) => api.get(`/groups/${projectId}/requests`, { params });
export const getRequest = (projectId, reqId) => api.get(`/requests/${reqId}`);
export const approveRequest = (projectId, reqId) => api.patch(`/requests/${reqId}/approve`);
export const rejectRequest = (projectId, reqId, data) => api.patch(`/requests/${reqId}/reject`, data);
export const markTransferred = (projectId, reqId) => api.patch(`/requests/${reqId}/transfer`);
export const confirmReceipt = (projectId, reqId) => api.patch(`/requests/${reqId}/confirm`);
