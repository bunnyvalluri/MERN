import apiClient from '../lib/axios.js';

export const recruiterService = {
  getCompanyProfile: async () => {
    const response = await apiClient.get('/recruiter/company');
    return response.data;
  },

  updateCompanyProfile: async (data) => {
    const response = await apiClient.put('/recruiter/company', data);
    return response.data;
  },

  getRecruiterInternships: async (params = {}) => {
    const response = await apiClient.get('/recruiter/internships', { params });
    return response.data;
  },

  getInternshipById: async (id) => {
    const response = await apiClient.get(`/recruiter/internships/${id}`);
    return response.data;
  },

  createInternship: async (data) => {
    const response = await apiClient.post('/recruiter/internships', data);
    return response.data;
  },

  updateInternship: async (id, data) => {
    const response = await apiClient.put(`/recruiter/internships/${id}`, data);
    return response.data;
  },

  publishInternship: async (id) => {
    const response = await apiClient.patch(`/recruiter/internships/${id}/publish`);
    return response.data;
  },

  unpublishInternship: async (id) => {
    const response = await apiClient.patch(`/recruiter/internships/${id}/unpublish`);
    return response.data;
  },

  closeInternship: async (id) => {
    const response = await apiClient.patch(`/recruiter/internships/${id}/close`);
    return response.data;
  },

  deleteInternship: async (id) => {
    const response = await apiClient.delete(`/recruiter/internships/${id}`);
    return response.data;
  },

  getInternshipApplications: async (id, params = {}) => {
    const response = await apiClient.get(`/recruiter/internships/${id}/applications`, { params });
    return response.data;
  },

  getDashboardAnalytics: async () => {
    const response = await apiClient.get('/recruiter/analytics');
    return response.data;
  },

  getRecruiterInterviews: async (params = {}) => {
    const response = await apiClient.get('/recruiter/interviews', { params });
    return response.data;
  },

  getRecruiterNotifications: async (params = {}) => {
    const response = await apiClient.get('/recruiter/notifications', { params });
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await apiClient.patch(`/recruiter/notifications/${id}/read`);
    return response.data;
  },
};

export default recruiterService;
