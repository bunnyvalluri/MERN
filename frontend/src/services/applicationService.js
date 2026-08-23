import apiClient from '../lib/axios.js';

export const applicationService = {
  /**
   * Apply to an internship posting.
   */
  applyToInternship: async (payload) => {
    const response = await apiClient.post('/applications', payload);
    return response.data;
  },

  /**
   * Fetch current student's submitted applications with optional filters.
   */
  getMyApplications: async (params = {}) => {
    const response = await apiClient.get('/applications/me', { params });
    return response.data;
  },

  /**
   * Fetch a single application detail for student view.
   */
  getStudentApplicationById: async (id) => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data;
  },

  /**
   * Student withdraws an active application.
   */
  withdrawApplication: async (id, note = '') => {
    const response = await apiClient.patch(`/applications/${id}/withdraw`, { note });
    return response.data;
  },

  /**
   * Recruiter fetches all applications for company postings.
   */
  getRecruiterApplications: async (params = {}) => {
    const response = await apiClient.get('/applications/recruiter/all', { params });
    return response.data;
  },

  /**
   * Recruiter fetches candidate application details, student profile, notes, and timeline.
   */
  getApplicationForRecruiter: async (id) => {
    const response = await apiClient.get(`/applications/recruiter/${id}`);
    return response.data;
  },

  /**
   * Recruiter updates candidate application status.
   */
  updateApplicationStatus: async (id, status, note = '') => {
    const response = await apiClient.patch(`/applications/recruiter/${id}/status`, {
      status,
      note,
    });
    return response.data;
  },

  /**
   * Recruiter schedules an interview.
   */
  scheduleInterview: async (id, interviewData) => {
    const response = await apiClient.post(
      `/applications/recruiter/${id}/schedule-interview`,
      interviewData
    );
    return response.data;
  },

  /**
   * Recruiter adds an internal review note.
   */
  addRecruiterNote: async (id, content) => {
    const response = await apiClient.post(`/applications/recruiter/${id}/notes`, {
      content,
    });
    return response.data;
  },
};

export default applicationService;
