import apiClient from '../lib/axios.js';

export const interviewService = {
  /**
   * Recruiter schedules a new interview for an applicant.
   */
  scheduleInterview: async (data) => {
    const response = await apiClient.post('/interviews', data);
    return response.data;
  },

  /**
   * Recruiter reschedules an interview.
   */
  rescheduleInterview: async (id, data) => {
    const response = await apiClient.patch(`/interviews/${id}/reschedule`, data);
    return response.data;
  },

  /**
   * Recruiter cancels an interview with an explanation note.
   */
  cancelInterview: async (id, reason) => {
    const response = await apiClient.patch(`/interviews/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Recruiter updates meeting link, notes, or interviewer details.
   */
  updateDetails: async (id, data) => {
    const response = await apiClient.patch(`/interviews/${id}/details`, data);
    return response.data;
  },

  /**
   * Recruiter marks an interview as completed with feedback.
   */
  completeInterview: async (id, feedback = {}) => {
    const response = await apiClient.patch(`/interviews/${id}/complete`, feedback);
    return response.data;
  },

  /**
   * Student retrieves all their scheduled interviews.
   */
  getStudentInterviews: async (params = {}) => {
    const response = await apiClient.get('/interviews/student/me', { params });
    return response.data;
  },

  /**
   * Participant retrieves single interview details.
   */
  getInterviewById: async (id) => {
    const response = await apiClient.get(`/interviews/${id}`);
    return response.data;
  },
};

export default interviewService;
