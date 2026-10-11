import api from './client';

export const recommendationApi = {
  // Public
  checkPhone: (phone, isPrimary = false, fullName = '') =>
    api.post('/recommendations/check-phone', typeof phone === 'object' ? phone : { phone, isPrimary, fullName }),
  submitRecommendation: (payload) => api.post('/recommendations', payload),
  trackStatus: (requestNumber, phone = '') =>
    api.get(`/recommendations/track/${encodeURIComponent(requestNumber)}`, {
      params: phone ? { phone } : {}
    }),

  // Admin
  adminList: (params) => api.get('/recommendations/admin', { params }),
  adminGet: (id) => api.get(`/recommendations/admin/${id}`),
  adminUpdateStatus: (id, payload) => api.patch(`/recommendations/admin/${id}/status`, payload),
  resolveConflict: (id, payload) => api.post(`/recommendations/admin/${id}/resolve-conflict`, payload)
};
