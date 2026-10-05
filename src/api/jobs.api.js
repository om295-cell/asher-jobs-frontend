import api from './client';

export const jobsApi = {
  getJobs: () => api.get('/jobs'),
  getCategories: () => api.get('/jobs/categories')
};
