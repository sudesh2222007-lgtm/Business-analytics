import axios from 'axios';

const api = axios.create({
  baseURL: '/api/analytics',
});

export const getFilterOptions = (params) => api.get('/filters', { params }).then((r) => r.data);
export const getExecutiveSummary = (params) => api.get('/executive', { params }).then((r) => r.data);
export const getSalesAnalysis = (params) => api.get('/sales', { params }).then((r) => r.data);
export const getCustomerAnalytics = (params) => api.get('/customers', { params }).then((r) => r.data);
export const getProfitabilityAnalysis = (params) => api.get('/profitability', { params }).then((r) => r.data);

export default api;
