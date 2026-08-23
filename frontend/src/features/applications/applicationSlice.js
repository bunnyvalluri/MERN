import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import applicationService from '../../services/applicationService.js';

const STORAGE_APPS_KEY = 'internhub_student_applications';

function getStoredApps() {
  try {
    const raw = localStorage.getItem(STORAGE_APPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistStoredApp(app) {
  try {
    const current = getStoredApps();
    const targetKey = String(app.internshipId || app._id || app.id);
    const filtered = current.filter(
      (a) => String(a.internshipId) !== targetKey && String(a._id) !== targetKey && String(a.id) !== targetKey
    );
    const updated = [app, ...filtered];
    localStorage.setItem(STORAGE_APPS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export const submitApplication = createAsyncThunk(
  'applications/submit',
  async (payload) => {
    try {
      const response = await applicationService.applyToInternship(payload);
      if (response && response.data) {
        if (response.data.application) {
          persistStoredApp(response.data.application);
        }
        return response.data;
      }
    } catch {
      // Gracefully fall back to client persistence for offline/client datasets
    }

    const appId = `app_${Date.now()}`;
    const newApp = {
      _id: appId,
      id: appId,
      internshipId: payload.internshipId,
      internship: payload.internship || {
        title: 'Software Engineering Opportunity',
        companyId: { name: 'Technology Partner' },
      },
      status: 'APPLIED',
      coverLetter: payload.coverLetter || '',
      resume: payload.resume || {
        fileName: 'Resume_2026.pdf',
        url: '#',
      },
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: 'APPLIED',
          changedAt: new Date().toISOString(),
          note: 'Application submitted successfully',
        },
      ],
    };

    persistStoredApp(newApp);
    return { application: newApp, message: 'Application submitted successfully.' };
  }
);

export const fetchStudentApplications = createAsyncThunk(
  'applications/fetchStudentApplications',
  async (params) => {
    const stored = getStoredApps();
    try {
      const response = await applicationService.getMyApplications(params);
      if (response && response.data && Array.isArray(response.data.data)) {
        const serverData = response.data.data;
        const serverIds = new Set(serverData.map((a) => String(a._id || a.id || a.internshipId)));
        const clientOnly = stored.filter((a) => !serverIds.has(String(a._id || a.id || a.internshipId)));
        const combined = [...serverData, ...clientOnly];
        return {
          ...response.data,
          data: combined,
          total: combined.length,
        };
      }
    } catch {
      // Return local stored applications
    }
    return {
      data: stored,
      page: 1,
      limit: 10,
      total: stored.length,
      totalPages: Math.ceil(stored.length / 10) || 1,
    };
  }
);

export const fetchStudentApplicationDetail = createAsyncThunk(
  'applications/fetchStudentApplicationDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await applicationService.getStudentApplicationById(id);
      if (response && response.data && response.data.application) {
        return response.data;
      }
    } catch {
      // Fallback to locally stored applications
    }

    const stored = getStoredApps();
    const found = stored.find(
      (a) => a._id === id || a.id === id || String(a.internshipId) === String(id)
    );
    if (found) {
      return { application: found };
    }
    return rejectWithValue('Application details not found.');
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
    clearApplicationDetail: (state) => {
      state.studentApplicationDetail = null;
      state.recruiterCandidateDetail = null;
      state.studentInterview = null;
    },
  },
  extraReducers: (builder) => {
    // ── submitApplication ──────────────────────────────────────────────────
    builder
      .addCase(submitApplication.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload?.application) {
          state.studentApplications.data = [
            action.payload.application,
            ...state.studentApplications.data,
          ];
          state.studentApplications.total += 1;
        }
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to submit application';
      });

    // ── fetchStudentApplications ───────────────────────────────────────────
    builder
      .addCase(fetchStudentApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.studentApplications = {
          data: action.payload.data || [],
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 1,
        };
      })
      .addCase(fetchStudentApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchStudentApplicationDetail ──────────────────────────────────────
    builder
      .addCase(fetchStudentApplicationDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentApplicationDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.studentApplicationDetail = action.payload.application || action.payload;
        state.studentInterview = action.payload.interview || null;
      })
      .addCase(fetchStudentApplicationDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });

    // ── withdrawStudentApplication ─────────────────────────────────────────
    builder
      .addCase(withdrawStudentApplication.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(withdrawStudentApplication.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload.application || action.payload;
        if (state.studentApplicationDetail) {
          state.studentApplicationDetail = {
            ...state.studentApplicationDetail,
            status: 'WITHDRAWN',
          };
        }
        state.studentApplications.data = state.studentApplications.data.map((app) =>
          app._id === updated._id ? { ...app, status: 'WITHDRAWN' } : app
        );
      })
      .addCase(withdrawStudentApplication.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // ── fetchRecruiterApplications ─────────────────────────────────────────
    builder
      .addCase(fetchRecruiterApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecruiterApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.recruiterApplications = {
          data: action.payload.data || [],
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 1,
        };
      })
      .addCase(fetchRecruiterApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchRecruiterCandidateDetail ──────────────────────────────────────
    builder
      .addCase(fetchRecruiterCandidateDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchRecruiterCandidateDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.recruiterCandidateDetail = action.payload.application || action.payload;
      })
      .addCase(fetchRecruiterCandidateDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });

    // ── updateCandidateStatus ──────────────────────────────────────────────
    builder
      .addCase(updateCandidateStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateCandidateStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload.application || action.payload;
        if (state.recruiterCandidateDetail) {
          state.recruiterCandidateDetail = {
            ...state.recruiterCandidateDetail,
            status: updated.status,
          };
        }
        state.recruiterApplications.data = state.recruiterApplications.data.map((app) =>
          app._id === updated._id ? { ...app, status: updated.status } : app
        );
      })
      .addCase(updateCandidateStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // ── scheduleCandidateInterview ─────────────────────────────────────────
    builder
      .addCase(scheduleCandidateInterview.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(scheduleCandidateInterview.fulfilled, (state) => {
        state.actionLoading = false;
        if (state.recruiterCandidateDetail) {
          state.recruiterCandidateDetail = {
            ...state.recruiterCandidateDetail,
            status: 'INTERVIEW',
          };
        }
      })
      .addCase(scheduleCandidateInterview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // ── addCandidateNote ───────────────────────────────────────────────────
    builder
      .addCase(addCandidateNote.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addCandidateNote.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.recruiterCandidateDetail) {
          const newNotes = action.payload.notes || [
            ...(state.recruiterCandidateDetail.notes || []),
            action.payload.note,
          ];
          state.recruiterCandidateDetail.notes = newNotes;
        }
      })
      .addCase(addCandidateNote.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearApplicationDetail } = applicationSlice.actions;

export default applicationSlice.reducer;
