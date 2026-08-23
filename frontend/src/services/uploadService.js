import apiClient from '../lib/axios.js';

export const uploadService = {
  /**
   * Uploads a student resume PDF (max 5MB).
   */
  uploadResume: async (formData, onUploadProgress) => {
    const response = await apiClient.post('/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Uploads a user profile avatar image (max 2MB).
   */
  uploadAvatar: async (formData, onUploadProgress) => {
    const response = await apiClient.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Uploads a company logo image (max 3MB).
   */
  uploadCompanyLogo: async (formData, onUploadProgress) => {
    const response = await apiClient.post('/upload/company-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Uploads a certificate PDF or image (max 5MB).
   */
  uploadCertificate: async (formData, onUploadProgress) => {
    const response = await apiClient.post('/upload/certificate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Replaces an existing document with a new upload.
   */
  replaceDocument: async (id, formData, onUploadProgress) => {
    const response = await apiClient.put(`/upload/documents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Deletes a document.
   */
  deleteDocument: async (id) => {
    const response = await apiClient.delete(`/upload/documents/${id}`);
    return response.data;
  },

  /**
   * Retrieves document securely.
   */
  getDocument: async (id) => {
    const response = await apiClient.get(`/upload/documents/${id}`);
    return response.data;
  },

  /**
   * Lists user documents with filters.
   */
  getUserDocuments: async (params = {}) => {
    const response = await apiClient.get('/upload/documents', { params });
    return response.data;
  },
};

export default uploadService;
