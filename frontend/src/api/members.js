import api from './axios';

export const getMembers = (projectId) => api.get(`/projects/${projectId}/members`);
export const addMember = (projectId, data) => api.post(`/projects/${projectId}/members`, data);
export const updateMember = (projectId, userId, data) => api.put(`/projects/${projectId}/members/${userId}`, data);
export const removeMember = (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`);
