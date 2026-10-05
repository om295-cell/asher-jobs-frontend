import api from './client';

export const companyApi = {
  getMyProfile: () => api.get('/companies/me'),
  getMyCompany: () => api.get('/companies/me'),
  updateMyProfile: (data) => api.put('/companies/me', data),
  updateMyCompany: (data) => api.put('/companies/me', data),
  getDashboardStats: () => api.get('/companies/me/dashboard'),
  getStats: () => api.get('/companies/me/dashboard'),
  getRecentActivity: () => api.get('/recruitment-requests'),
  suggestJob: (data) => api.post('/companies/job-suggestions', data),

  // Search & Interactions
  recordInteraction: (candidateId, type, notes) =>
    api.post(`/candidates/${candidateId}/interact`, typeof type === 'object' ? type : { action: type, notes }),
  exportCandidates: (params) => api.get('/candidates/export', { params, responseType: 'blob' }),
  getInteractions: () => api.get('/reports'),

  // Recruitment Requests
  getRequests: (params) => api.get('/recruitment-requests', { params }),
  createRequest: (data) => api.post('/recruitment-requests', data),
  getRequest: (id) => api.get(`/recruitment-requests/${id}`),
  cancelRequest: (id) => api.delete(`/recruitment-requests/${id}`).catch(() => api.patch(`/recruitment-requests/${id}`, { status: 'Cancelled' }))
};
