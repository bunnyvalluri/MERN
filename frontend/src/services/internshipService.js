import apiClient from '../lib/axios.js';

export const internshipService = {
  getInternships: async (params = {}) => {
    const response = await apiClient.get('/internships', { params });
    return response.data;
  },

  getInternshipById: async (idOrSlug) => {
    const response = await apiClient.get(`/internships/${idOrSlug}`);
    return response.data;
  },

  toggleSaveInternship: async (id) => {
    const response = await apiClient.post(`/internships/${id}/save`);
    return response.data;
  },

  getSavedInternships: async (params = {}) => {
    const response = await apiClient.get('/internships/saved', { params });
    return response.data;
  },
};

export default internshipService;
