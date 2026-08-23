import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import applicationService from '../../services/applicationService.js';

export const submitApplication = createAsyncThunk(
  'applications/submit',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await applicationService.applyToInternship(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to submit application'
      );
    }
  }
);

export const fetchStudentApplications = createAsyncThunk(
  'applications/fetchStudentApplications',
  async (params, { rejectWithValue }) => {
    try {
      const response = await applicationService.getMyApplications(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load applications'
      );
    }
  }
);

export const fetchStudentApplicationDetail = createAsyncThunk(
  'applications/fetchStudentApplicationDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await applicationService.getStudentApplicationById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load application details'
      );
    }
  }
);

export const withdrawStudentApplication = createAsyncThunk(
  'applications/withdrawStudentApplication',
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const response = await applicationService.withdrawApplication(id, note);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to withdraw application'
      );
    }
  }
);

export const fetchRecruiterApplications = createAsyncThunk(
  'applications/fetchRecruiterApplications',
  async (params, { rejectWithValue }) => {
    try {
      const response = await applicationService.getRecruiterApplications(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load recruiter applications'
      );
    }
  }
);

export const fetchRecruiterCandidateDetail = createAsyncThunk(
  'applications/fetchRecruiterCandidateDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await applicationService.getApplicationForRecruiter(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load candidate details'
      );
    }
  }
);

export const updateCandidateStatus = createAsyncThunk(
  'applications/updateCandidateStatus',
  async ({ id, status, note }, { rejectWithValue }) => {
    try {
      const response = await applicationService.updateApplicationStatus(id, status, note);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update application status'
      );
    }
  }
);

export const scheduleCandidateInterview = createAsyncThunk(
  'applications/scheduleCandidateInterview',
  async ({ id, interviewData }, { rejectWithValue }) => {
    try {
      const response = await applicationService.scheduleInterview(id, interviewData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to schedule interview'
      );
    }
  }
);

export const addCandidateNote = createAsyncThunk(
  'applications/addCandidateNote',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await applicationService.addRecruiterNote(id, content);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to add review note'
      );
    }
  }
);

const initialState = {
  studentApplications: {
    data: [],
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  studentApplicationDetail: null,
  studentInterview: null,

  recruiterApplications: {
    data: [],
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    stats: {
      total: 0,
      applied: 0,
      underReview: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    },
  },
  recruiterCandidateDetail: null,

  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
};

export const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearApplicationErrors: (state) => {
      state.error = null;
    },
    clearCandidateDetail: (state) => {
      state.recruiterCandidateDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Application
      .addCase(submitApplication.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.studentApplications.data.unshift(action.payload);
        state.studentApplications.total += 1;
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Fetch Student Applications
      .addCase(fetchStudentApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.studentApplications = action.payload;
      })
      .addCase(fetchStudentApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Student Application Detail
      .addCase(fetchStudentApplicationDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentApplicationDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.studentApplicationDetail = action.payload.application;
        state.studentInterview = action.payload.interview;
      })
      .addCase(fetchStudentApplicationDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // Withdraw Student Application
      .addCase(withdrawStudentApplication.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(withdrawStudentApplication.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.studentApplicationDetail?._id === action.payload._id) {
          state.studentApplicationDetail = action.payload;
        }
        // Update in student applications list
        const idx = state.studentApplications.data.findIndex(
          (a) => a._id === action.payload._id
        );
        if (idx !== -1) {
          state.studentApplications.data[idx].status = action.payload.status;
        }
      })
      .addCase(withdrawStudentApplication.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Fetch Recruiter Applications
      .addCase(fetchRecruiterApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecruiterApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.recruiterApplications = action.payload;
      })
      .addCase(fetchRecruiterApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Recruiter Candidate Detail
      .addCase(fetchRecruiterCandidateDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchRecruiterCandidateDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.recruiterCandidateDetail = action.payload;
      })
      .addCase(fetchRecruiterCandidateDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // Update Candidate Status
      .addCase(updateCandidateStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateCandidateStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.recruiterCandidateDetail?.application?._id === action.payload._id) {
          state.recruiterCandidateDetail.application = action.payload;
        }
        // Update in list
        const idx = state.recruiterApplications.data.findIndex(
          (a) => a._id === action.payload._id
        );
        if (idx !== -1) {
          state.recruiterApplications.data[idx].status = action.payload.status;
        }
      })
      .addCase(updateCandidateStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Schedule Candidate Interview
      .addCase(scheduleCandidateInterview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(scheduleCandidateInterview.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.recruiterCandidateDetail?.application?._id === action.payload.application._id) {
          state.recruiterCandidateDetail.application = action.payload.application;
          state.recruiterCandidateDetail.interviews.unshift(action.payload.interview);
        }
        const idx = state.recruiterApplications.data.findIndex(
          (a) => a._id === action.payload.application._id
        );
        if (idx !== -1) {
          state.recruiterApplications.data[idx].status = action.payload.application.status;
        }
      })
      .addCase(scheduleCandidateInterview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Add Candidate Note
      .addCase(addCandidateNote.fulfilled, (state, action) => {
        if (state.recruiterCandidateDetail?.application) {
          state.recruiterCandidateDetail.application.notes = action.payload;
        }
      });
  },
});

export const { clearApplicationErrors, clearCandidateDetail } =
  applicationSlice.actions;

export default applicationSlice.reducer;
