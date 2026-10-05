import api from './client';

export const searchApi = {
  searchCandidates: (params) => api.get('/candidates/search', { params })
};
