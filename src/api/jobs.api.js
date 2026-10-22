import api from './client';

export const jobsApi = {
  getJobs: (params) => api.get('/jobs', { params }),
  getCategories: () => api.get('/jobs/categories'),
  syncCatalog: () => api.get('/jobs/sync-catalog')
};
