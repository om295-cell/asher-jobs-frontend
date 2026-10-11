import api from './client';

export const adminNotificationApi = {
  list: (params) => api.get('/admin/notifications', { params }),
  getBadgeCounts: () => api.get('/admin/notifications/badge-counts'),
  markRead: (id) => api.patch(`/admin/notifications/${id}/read`),
  markAllRead: () => api.post('/admin/notifications/read-all'),
  archive: (id) => api.patch(`/admin/notifications/${id}/archive`),
  unarchive: (id) => api.patch(`/admin/notifications/${id}/unarchive`),
  resolve: (id, data) => api.post(`/admin/notifications/${id}/resolve`, data)
};
