import apiClient from '../lib/axios.js';

export const studentService = {
  getOwnProfile: async () => {
    const response = await apiClient.get('/students/me');
    return response.data;
  },

  updateOwnProfile: async (profileData) => {
    const response = await apiClient.put('/students/me', profileData);
    return response.data;
  },

  uploadResume: async (resumeData) => {
    const response = await apiClient.post('/students/me/resume', resumeData);
    return response.data;
  },

  deleteResume: async () => {
    const response = await apiClient.delete('/students/me/resume');
    return response.data;
  },

  getPublicProfile: async (studentId) => {
    const response = await apiClient.get(`/students/${studentId}`);
    return response.data;
  },
};

export default studentService;
