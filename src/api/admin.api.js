import api from './client';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Candidates
  listCandidates: (params) => api.get('/admin/candidates', { params }),
  getCandidateById: (id) => api.get(`/admin/candidates/${id}`),
  updateCandidate: (id, data) => api.put(`/admin/candidates/${id}`, data),
  updateCandidateStatus: (id, availabilityStatus) => api.patch(`/admin/candidates/${id}/status`, { availabilityStatus }),
  toggleBlockCandidate: (id, isBlocked, blockReason) => api.patch(`/admin/candidates/${id}/block`, { isBlocked, blockReason }),
  deleteCandidate: (id) => api.delete(`/admin/candidates/${id}`),

  // Companies
  listCompanies: (params) => api.get('/admin/companies', { params }),
  getCompanyById: (id) => api.get(`/admin/companies/${id}`),
  approveCompany: (id) => api.patch(`/admin/companies/${id}/approve`),
  rejectCompany: (id, reason) => api.patch(`/admin/companies/${id}/reject`, { reason }),
  toggleBlockCompany: (id, isBlocked, blockReason) => api.patch(`/admin/companies/${id}/block`, { isBlocked, blockReason }),
  updateCompanySubscription: (id, data) => api.patch(`/admin/companies/${id}/subscription`, data),

  // Recruitment Requests
  listRequests: (params) => api.get('/admin/requests', { params }),
  getRequestById: (id) => api.get(`/recruitment-requests/${id}`),
  updateRequestStatus: (id, status, notes) => api.patch(`/admin/requests/${id}/status`, { status, notes }),

  // Jobs
  listJobs: () => api.get('/admin/jobs'),
  createJob: (data) => api.post('/admin/jobs', data),
  updateJob: (id, data) => api.put(`/admin/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  extractJobTitles: (formData) => api.post('/admin/jobs/extract-titles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  confirmSingleJobTitle: (data) => api.post('/admin/jobs/confirm-title', data),
  batchConfirmJobTitles: (items) => api.post('/admin/jobs/batch-confirm-titles', { items }),
  listJobSuggestions: (params) => api.get('/admin/jobs/suggestions', { params }),
  reviewJobSuggestion: (id, data) => api.patch(`/admin/jobs/suggestions/${id}`, data),

  // Categories
  listCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Reports
  listReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.patch(`/admin/reports/${id}`, data),

  // Activity Logs
  listActivity: (params) => api.get('/admin/activity', { params }),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (key, value, description) => api.put('/admin/settings', { key, value, description })
};
