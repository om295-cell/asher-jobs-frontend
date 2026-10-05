import api from './client';

export const candidateApi = {
  getMyProfile: () => api.get('/candidates/me'),
  updateMyProfile: (data) => api.put('/candidates/me', data),
  updateAvailability: (availabilityStatus) => api.patch('/candidates/me/availability', { availabilityStatus }),
  uploadCv: (formData) =>
    api.post('/candidates/me/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteCv: () => api.delete('/candidates/me/cv'),
  getMyReferrals: () => api.get('/candidates/me/referrals'),
  getReferrals: () => api.get('/candidates/me/referrals'),
  getMyStats: () => api.get('/candidates/me/referrals'),
  deactivateProfile: () => api.delete('/candidates/me'),

  // Employer search & actions
  searchCandidates: (params) => api.get('/candidates/search', { params }),
  getCandidateById: (id) => api.get(`/candidates/${id}`),
  recordInteraction: (id, data) => api.post(`/candidates/${id}/interact`, data),
  getExportUrl: (params, format = 'csv') => {
    const searchParams = new URLSearchParams(params);
    searchParams.set('format', format);
    return `${api.defaults.baseURL}/candidates/export?${searchParams.toString()}`;
  }
};
