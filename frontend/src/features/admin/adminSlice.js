import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService.js';

const initialState = {
  metrics: null,
  users: { data: [], page: 1, limit: 15, total: 0, totalPages: 1 },
  companies: { data: [], page: 1, limit: 15, total: 0, totalPages: 1 },
  internships: { data: [], page: 1, limit: 15, total: 0, totalPages: 1 },
  applications: { data: [], page: 1, limit: 15, total: 0, totalPages: 1 },
  auditLogs: { data: [], page: 1, limit: 20, total: 0, totalPages: 1 },
  activeSection: 'dashboard',
  loading: false,
  actionLoading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchAdminMetrics = createAsyncThunk(
  'admin/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getDashboardMetrics();
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch admin metrics.'
      );
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getUsers(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch users.'
      );
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateUserStatus(userId, { isActive });
      return { userId, isActive, message: response.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update user status.'
      );
    }
  }
);

export const fetchAdminCompanies = createAsyncThunk(
  'admin/fetchCompanies',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getCompanies(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch companies.'
      );
    }
  }
);

export const toggleCompanyVerify = createAsyncThunk(
  'admin/toggleCompanyVerify',
  async ({ companyId, verified }, { rejectWithValue }) => {
    try {
      const response = await adminService.verifyCompany(companyId, { verified });
      return { companyId, verified, message: response.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update company verification.'
      );
    }
  }
);

export const fetchAdminInternships = createAsyncThunk(
  'admin/fetchInternships',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getInternships(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch internships.'
      );
    }
  }
);

export const moderateInternshipStatus = createAsyncThunk(
  'admin/moderateInternshipStatus',
  async ({ internshipId, status }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateInternshipStatus(internshipId, { status });
      return { internshipId, status, message: response.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update internship status.'
      );
    }
  }
);

export const deleteAdminInternship = createAsyncThunk(
  'admin/deleteInternship',
  async (internshipId, { rejectWithValue }) => {
    try {
      const response = await adminService.deleteInternship(internshipId);
      return { internshipId, message: response.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete internship.'
      );
    }
  }
);

export const fetchAdminApplications = createAsyncThunk(
  'admin/fetchApplications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getApplications(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch applications.'
      );
    }
  }
);

export const fetchAdminAuditLogs = createAsyncThunk(
  'admin/fetchAuditLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAuditLogs(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch audit logs.'
      );
    }
  }
);

export const sendBroadcastNotification = createAsyncThunk(
  'admin/sendBroadcast',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await adminService.broadcastNotification(payload);
      return response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to deliver broadcast.'
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setActiveSection: (state, action) => {
      state.activeSection = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Metrics
    builder
      .addCase(fetchAdminMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchAdminMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Users
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Toggle User Status
    builder.addCase(toggleUserStatus.fulfilled, (state, action) => {
      const { userId, isActive } = action.payload;
      const user = state.users.data.find((u) => u._id === userId);
      if (user) {
        user.isActive = isActive;
      }
    });

    // Companies
    builder
      .addCase(fetchAdminCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchAdminCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Toggle Company Verify
    builder.addCase(toggleCompanyVerify.fulfilled, (state, action) => {
      const { companyId, verified } = action.payload;
      const company = state.companies.data.find((c) => c._id === companyId);
      if (company) {
        company.verified = verified;
      }
    });

    // Internships
    builder
      .addCase(fetchAdminInternships.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminInternships.fulfilled, (state, action) => {
        state.loading = false;
        state.internships = action.payload;
      })
      .addCase(fetchAdminInternships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Moderate Internship
    builder.addCase(moderateInternshipStatus.fulfilled, (state, action) => {
      const { internshipId, status } = action.payload;
      const intern = state.internships.data.find((i) => i._id === internshipId);
      if (intern) {
        intern.status = status;
      }
    });

    // Delete Internship
    builder.addCase(deleteAdminInternship.fulfilled, (state, action) => {
      const { internshipId } = action.payload;
      state.internships.data = state.internships.data.filter(
        (i) => i._id !== internshipId
      );
      state.internships.total = Math.max(0, state.internships.total - 1);
    });

    // Applications
    builder
      .addCase(fetchAdminApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchAdminApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Audit Logs
    builder
      .addCase(fetchAdminAuditLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.auditLogs = action.payload;
      })
      .addCase(fetchAdminAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveSection } = adminSlice.actions;
export default adminSlice.reducer;
