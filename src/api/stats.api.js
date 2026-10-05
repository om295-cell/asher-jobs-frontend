import api from './client';

export const statsApi = {
  getStats: () => api.get('/stats'),
  recordVisit: () => api.post('/stats/visit')
};
