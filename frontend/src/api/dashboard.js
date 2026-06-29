import api from './axios';

export const getDashboardStats = () => api.get('/dashboard/stats');
export const getRecentActivity = () => api.get('/dashboard/activity');
export const getChartData = () => api.get('/dashboard/charts');
export const getRecentTransactions = () => api.get('/dashboard/transactions');
