import apiClient from '../lib/axios.js';

export const adminService = {
  getDashboardMetrics: async () => {
    const response = await apiClient.get('/admin/metrics');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId, data) => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, data);
    return response.data;
  },

  getCompanies: async (params = {}) => {
    const response = await apiClient.get('/admin/companies', { params });
    return response.data;
  },

  verifyCompany: async (companyId, data) => {
    const response = await apiClient.patch(`/admin/companies/${companyId}/verify`, data);
    return response.data;
  },

  getInternships: async (params = {}) => {
    const response = await apiClient.get('/admin/internships', { params });
    return response.data;
  },

  updateInternshipStatus: async (internshipId, data) => {
    const response = await apiClient.patch(`/admin/internships/${internshipId}/status`, data);
    return response.data;
  },

  deleteInternship: async (internshipId) => {
    const response = await apiClient.delete(`/admin/internships/${internshipId}`);
    return response.data;
  },

  getApplications: async (params = {}) => {
    const response = await apiClient.get('/admin/applications', { params });
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await apiClient.get('/admin/audit-logs', { params });
    return response.data;
  },

  broadcastNotification: async (payload) => {
    const response = await apiClient.post('/admin/broadcast', payload);
    return response.data;
  },
};

export default adminService;
