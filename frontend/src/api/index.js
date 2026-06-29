import api from './axios';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const refreshToken = (token) => api.post('/auth/refresh-token', { refreshToken: token });

export const getMyGroups = () => api.get('/groups');
export const createGroup = (data) => api.post('/groups', data);
export const getGroup = (id) => api.get(`/groups/${id}`);
export const getPendingInvites = () => api.get('/groups/pending-invites');

export const getMembers = (groupId) => api.get(`/groups/${groupId}/members`);
export const sendJoinRequest = (groupId, data) => api.post(`/groups/${groupId}/members`, data);
export const respondToJoinRequest = (groupId, data) => api.put(`/groups/${groupId}/members/respond`, data);
export const removeMember = (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`);

export const addFunds = (groupId, data) => api.post(`/groups/${groupId}/funds`, data);
export const getTransactions = (groupId, params) => api.get(`/groups/${groupId}/transactions`, { params });

export const getRequests = (groupId, params) => api.get(`/groups/${groupId}/requests`, { params });
export const createRequest = (groupId, data) => api.post(`/groups/${groupId}/requests`, data);
export const approveRequest = (groupId, rId) => api.put(`/groups/${groupId}/requests/${rId}/approve`);
export const rejectRequest = (groupId, rId, data) => api.put(`/groups/${groupId}/requests/${rId}/reject`, data);
export const markTransferred = (groupId, rId) => api.put(`/groups/${groupId}/requests/${rId}/transfer`);
export const confirmReceipt = (groupId, rId) => api.put(`/groups/${groupId}/requests/${rId}/confirm`);

export const getNotifications = (params) => api.get('/notifications', { params });
export const markRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllRead = () => api.put('/notifications/read-all');
