import api from './client';

export const reportsApi = {
  createReport: (data) => api.post('/reports', data),
  getMyReports: (params) => api.get('/reports', { params })
};
