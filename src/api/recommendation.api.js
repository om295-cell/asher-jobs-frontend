import api from './client';

export const recommendationApi = {
  // Public
  checkPhone: (phone) => api.post('/recommendations/check-phone', { phone }),
  submitRecommendation: (payload) => api.post('/recommendations', payload),
  trackStatus: (requestNumber, phone = '') =>
    api.get(`/recommendations/track/${encodeURIComponent(requestNumber)}`, {
      params: phone ? { phone } : {}
    }),

  // Admin
  adminList: (params) => api.get('/recommendations/admin', { params }),
  adminGet: (id) => api.get(`/recommendations/admin/${id}`),
  adminUpdateStatus: (id, payload) => api.patch(`/recommendations/admin/${id}/status`, payload)
};
