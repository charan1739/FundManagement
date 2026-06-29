import api from './axios';

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');
export const refreshToken = () => api.post('/auth/refresh-token');
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const updateAvatar = (formData) => api.put('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const changePassword = (data) => api.put('/profile/password', data);
