import api from './client';

export const authApi = {
  registerCandidate: (data) => api.post('/auth/register/candidate', data),
  registerCompany: (data) => api.post('/auth/register/company', data),
  login: (credential, password) => api.post('/auth/login', { credential, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  // updatePassword accepts either (currentPassword, newPassword) or a pre-shaped { currentPassword, newPassword } object
  updatePassword: (currentPasswordOrData, newPassword) => {
    const body = typeof currentPasswordOrData === 'object' && newPassword === undefined
      ? currentPasswordOrData
      : { currentPassword: currentPasswordOrData, newPassword };
    return api.put('/auth/password', body);
  }
};
