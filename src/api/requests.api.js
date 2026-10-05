import api from './client';

export const requestsApi = {
  createRequest: (data) => api.post('/recruitment-requests', data),
  getMyRequests: (params) => api.get('/recruitment-requests', { params }),
  getRequestById: (id) => api.get(`/recruitment-requests/${id}`)
};
