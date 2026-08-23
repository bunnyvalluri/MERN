import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recruiterService from '../../services/recruiterService.js';

const initialState = {
  company: null,
  internships: [],
  currentInternship: null,
  applications: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  filters: {
    status: 'ALL',
    search: '',
    page: 1,
  },
  loading: false,
  saving: false,
  error: null,
};

// ─── Company Thunks ──────────────────────────────────────────────────────────
export const fetchCompanyProfile = createAsyncThunk(
  'recruiter/fetchCompany',
  async (_, { rejectWithValue }) => {
    try {
      const response = await recruiterService.getCompanyProfile();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch company profile.');
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  'recruiter/updateCompany',
  async (data, { rejectWithValue }) => {
    try {
      const response = await recruiterService.updateCompanyProfile(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update company profile.');
    }
  }
);

// ─── Internship Management Thunks ────────────────────────────────────────────
export const fetchRecruiterInternships = createAsyncThunk(
  'recruiter/fetchInternships',
  async (params, { rejectWithValue }) => {
    try {
      const response = await recruiterService.getRecruiterInternships(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch internships.');
    }
  }
);

export const fetchRecruiterInternshipById = createAsyncThunk(
  'recruiter/fetchInternshipById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recruiterService.getInternshipById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load internship.');
    }
  }
);

export const createInternship = createAsyncThunk(
  'recruiter/createInternship',
  async (data, { rejectWithValue }) => {
    try {
      const response = await recruiterService.createInternship(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create internship.');
    }
  }
);

export const updateInternship = createAsyncThunk(
  'recruiter/updateInternship',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await recruiterService.updateInternship(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update internship.');
    }
  }
);

export const publishInternship = createAsyncThunk(
  'recruiter/publishInternship',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recruiterService.publishInternship(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to publish internship.');
    }
  }
);

export const unpublishInternship = createAsyncThunk(
  'recruiter/unpublishInternship',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recruiterService.unpublishInternship(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to revert to draft.');
    }
  }
);

export const closeInternship = createAsyncThunk(
  'recruiter/closeInternship',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recruiterService.closeInternship(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to close internship.');
    }
  }
);

export const deleteInternship = createAsyncThunk(
  'recruiter/deleteInternship',
  async (id, { rejectWithValue }) => {
    try {
      await recruiterService.deleteInternship(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete internship.');
    }
  }
);

export const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState,
  reducers: {
    setRecruiterFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setRecruiterPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearCurrentInternship: (state) => {
      state.currentInternship = null;
    },
  },
  extraReducers: (builder) => {
    // Company Profile
    builder
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.company = action.payload;
      })
      .addCase(updateCompanyProfile.fulfilled, (state, action) => {
        state.company = action.payload;
      });

    // List Internships
    builder
      .addCase(fetchRecruiterInternships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecruiterInternships.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, limit, total, totalPages } = action.payload;
        state.internships = data;
        state.pagination = { page, limit, total, totalPages };
      })
      .addCase(fetchRecruiterInternships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Single Internship
    builder
      .addCase(fetchRecruiterInternshipById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecruiterInternshipById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInternship = action.payload;
      })
      .addCase(fetchRecruiterInternshipById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Lifecycle transitions (Publish / Unpublish / Close)
    builder
      .addCase(publishInternship.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.internships.findIndex((i) => i._id === updated._id);
        if (idx !== -1) state.internships[idx] = updated;
        if (state.currentInternship?._id === updated._id) state.currentInternship = updated;
      })
      .addCase(unpublishInternship.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.internships.findIndex((i) => i._id === updated._id);
        if (idx !== -1) state.internships[idx] = updated;
        if (state.currentInternship?._id === updated._id) state.currentInternship = updated;
      })
      .addCase(closeInternship.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.internships.findIndex((i) => i._id === updated._id);
        if (idx !== -1) state.internships[idx] = updated;
        if (state.currentInternship?._id === updated._id) state.currentInternship = updated;
      })
      .addCase(deleteInternship.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.internships = state.internships.filter((i) => i._id !== deletedId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

export const { setRecruiterFilters, setRecruiterPage, clearCurrentInternship } =
  recruiterSlice.actions;
export default recruiterSlice.reducer;
