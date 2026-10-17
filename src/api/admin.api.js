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
  extractCandidatesExcel: (formData) => api.post('/admin/candidates/extract-excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  searchMainCandidates: (params) => api.get('/admin/candidates/search-main', { params }),
  executeCandidateImport: (data) => api.post('/admin/candidates/import-batch', data),

  // Companies
  listCompanies: (params) => api.get('/admin/companies', { params }),
  getCompanyById: (id) => api.get(`/admin/companies/${id}`),
  approveCompany: (id) => api.patch(`/admin/companies/${id}/approve`),
  rejectCompany: (id, reason) => api.patch(`/admin/companies/${id}/reject`, { reason }),
  toggleBlockCompany: (id, isBlocked, blockReason) => api.patch(`/admin/companies/${id}/block`, { isBlocked, blockReason }),
  updateCompanySubscription: (id, data) => api.patch(`/admin/companies/${id}/subscription`, data),
  getCompanyOrders: (id) => api.get(`/admin/companies/${id}/orders`),
  updateCompanyOrderStatus: (id, orderId, status, reason) => api.patch(`/admin/companies/${id}/orders/${orderId}/status`, { status, reason }),

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

  // Persisted Super Admin job-title review workflow
  createManualTitleBatch: (data) => api.post('/admin/job-title-batches/manual', data),
  createFileTitleBatch: (formData) => api.post('/admin/job-title-batches/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  listTitleBatches: (params) => api.get('/admin/job-title-batches', { params }),
  getTitleBatch: (id) => api.get(`/admin/job-title-batches/${id}`),
  listTitleReviews: (params) => api.get('/admin/job-title-reviews', { params }),
  getTitleReview: (id) => api.get(`/admin/job-title-reviews/${id}`),
  editTitleReview: (id, data) => api.patch(`/admin/job-title-reviews/${id}`, data),
  approveTitleReview: (id, data = {}) => api.post(`/admin/job-title-reviews/${id}/approve`, data),
  rejectTitleReview: (id, reason) => api.post(`/admin/job-title-reviews/${id}/reject`, { reason }),
  retryTitleReview: (id) => api.post(`/admin/job-title-reviews/${id}/retry`),
  bulkApproveTitleReviews: (batchId) => api.post('/admin/job-title-reviews/bulk-approve', { batchId }),
  bulkRejectTitleReviews: (reason, batchId) => api.post('/admin/job-title-reviews/bulk-reject', { reason, batchId }),
  deleteArchivedTitleReview: (id) => api.delete(`/admin/job-title-reviews/${id}`),
  deleteAllArchivedTitleReviews: (batchId) => api.delete('/admin/job-title-reviews', { params: batchId ? { batchId } : {} }),

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
  updateSetting: (key, value, description) => api.put('/admin/settings', { key, value, description }),

  // Employer Accounts (Verified Companies & Individual HR)
  listEmployerAccounts: (params) => api.get('/admin/employer-accounts', { params }),
  createEmployerAccount: (data) => api.post('/admin/employer-accounts', data),
  getEligibleVerifiers: () => api.get('/admin/employer-accounts/eligible-verifiers'),
  resetEmployerPassword: (id) => api.post(`/admin/employer-accounts/${id}/reset-password`),
  updateEmployerStatus: (id, status, reason) => api.patch(`/admin/employer-accounts/${id}/status`, { status, reason }),
  updateEmployerSubscription: (id, data) => api.patch(`/admin/employer-accounts/${id}/subscription`, data),
  getEmployerAccountAnalytics: (id) => api.get(`/admin/employer-accounts/${id}/analytics`),
  getEmployerActivityRankings: (params) => api.get('/admin/employer-accounts/analytics/rankings', { params }),
  getBulkEmployerAnalytics: () => api.get('/admin/employer-accounts/analytics/bulk'),

  // Subscription Plans Management
  listSubscriptionPlans: () => api.get('/admin/subscriptions/plans'),
  updateSubscriptionPlan: (id, data) => api.put(`/admin/subscriptions/plans/${id}`, data)
};
