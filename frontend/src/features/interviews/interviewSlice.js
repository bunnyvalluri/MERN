import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import interviewService from '../../services/interviewService.js';

const initialState = {
  studentInterviews: {
    data: [],
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    upcomingCount: 0,
    pastCount: 0,
  },
  currentInterview: null,
  activeTimeframe: 'upcoming',
  loading: false,
  actionLoading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchStudentInterviews = createAsyncThunk(
  'interviews/fetchStudentInterviews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await interviewService.getStudentInterviews(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch student interviews.'
      );
    }
  }
);

export const fetchInterviewById = createAsyncThunk(
  'interviews/fetchInterviewById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await interviewService.getInterviewById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load interview details.'
      );
    }
  }
);

export const scheduleInterview = createAsyncThunk(
  'interviews/scheduleInterview',
  async (data, { rejectWithValue }) => {
    try {
      const response = await interviewService.scheduleInterview(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to schedule interview.'
      );
    }
  }
);

export const rescheduleInterview = createAsyncThunk(
  'interviews/rescheduleInterview',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await interviewService.rescheduleInterview(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to reschedule interview.'
      );
    }
  }
);

export const cancelInterview = createAsyncThunk(
  'interviews/cancelInterview',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await interviewService.cancelInterview(id, reason);
      return { id, reason, interview: response.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to cancel interview.'
      );
    }
  }
);

export const updateInterviewDetails = createAsyncThunk(
  'interviews/updateDetails',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await interviewService.updateDetails(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update interview details.'
      );
    }
  }
);

export const completeInterview = createAsyncThunk(
  'interviews/complete',
  async ({ id, feedback }, { rejectWithValue }) => {
    try {
      const response = await interviewService.completeInterview(id, feedback);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to complete interview.'
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

export const interviewSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    setActiveTimeframe: (state, action) => {
      state.activeTimeframe = action.payload;
    },
    clearCurrentInterview: (state) => {
      state.currentInterview = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Student Interviews
    builder
      .addCase(fetchStudentInterviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.studentInterviews = action.payload;
      })
      .addCase(fetchStudentInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Single Interview
    builder
      .addCase(fetchInterviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInterview = action.payload;
      })
      .addCase(fetchInterviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Schedule Interview
    builder
      .addCase(scheduleInterview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(scheduleInterview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentInterview = action.payload;
      })
      .addCase(scheduleInterview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Reschedule Interview
    builder
      .addCase(rescheduleInterview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(rescheduleInterview.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        if (state.currentInterview?._id === updated._id) {
          state.currentInterview = updated;
        }
        const idx = state.studentInterviews.data.findIndex((i) => i._id === updated._id);
        if (idx !== -1) {
          state.studentInterviews.data[idx] = updated;
        }
      })
      .addCase(rescheduleInterview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Cancel Interview
    builder
      .addCase(cancelInterview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelInterview.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { id } = action.payload;
        if (state.currentInterview?._id === id) {
          state.currentInterview.status = 'CANCELLED';
        }
        const idx = state.studentInterviews.data.findIndex((i) => i._id === id);
        if (idx !== -1) {
          state.studentInterviews.data[idx].status = 'CANCELLED';
        }
      })
      .addCase(cancelInterview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveTimeframe, clearCurrentInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
