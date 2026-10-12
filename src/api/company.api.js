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
  cancelRequest: (id) => api.delete(`/recruitment-requests/${id}`).catch(() => api.patch(`/recruitment-requests/${id}`, { status: 'Cancelled' })),

  // Daily Quotas & Entitlements
  getEntitlements: () => api.get('/companies/entitlements'),

  // Multi-Title Candidate Cart (Gold & Platinum)
  getCart: () => api.get('/companies/cart'),
  addOrUpdateCart: (jobId, candidateIds) => api.post('/companies/cart', { jobId, candidateIds }),
  removeCartItem: (jobId) => api.delete(`/companies/cart/${jobId}`),
  clearCart: () => api.delete('/companies/cart'),
  exportCart: (exportFormat = 'multi_sheet') =>
    api.post('/companies/cart/export', { exportFormat }, { responseType: 'blob' }),

  // Platinum Dedicated Browsing
  browsePlatinumCandidates: (params) => api.get('/candidates/platinum/browse', { params }),
  getPlatinumCandidate: (id) => api.get(`/candidates/platinum/candidate/${id}`),
  downloadPlatinumCandidate: (id) =>
    api.get(`/candidates/platinum/candidate/${id}/download`, { responseType: 'blob' })
};
