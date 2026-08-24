import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import internshipService from '../../services/internshipService.js';

const initialFilters = {
  search: '',
  location: '',
  remote: 'ALL',
  workMode: 'ALL',
  type: 'ALL',
  category: 'ALL',
  skills: '',
  minStipend: '',
  maxStipend: '',
  stipendMin: '',
  stipendMax: '',
  duration: '',
  experience: '',
  sortBy: 'latest',
  datePosted: 'all',
  page: 1,
  limit: 12,
};

const initialState = {
  internships: [],
  selectedInternship: null,
  isSaved: false,
  hasApplied: false,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  },
  filters: initialFilters,
  savedInternships: [],
  newArrivalsCount: 0,
  newArrivals: [],
  loading: false,
  syncing: false,
  lastSyncedAt: null,
  detailLoading: false,
  error: null,
};

/**
 * Fetch Internships with Filter & Pagination (Database-driven)
 */
export const fetchInternships = createAsyncThunk(
  'internships/fetchList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await internshipService.getInternships(params);
      if (response && response.data) {
        return response.data;
      }
      return {
        data: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
        lastSyncedAt: new Date().toISOString(),
      };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch internships';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch Single Internship Details
 */
export const fetchInternshipDetail = createAsyncThunk(
  'internships/fetchDetail',
  async (idOrSlug, { rejectWithValue }) => {
    try {
      const response = await internshipService.getInternshipById(idOrSlug);
      if (response && response.data) {
        return response.data;
      }
      return rejectWithValue('Internship opportunity not found.');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Internship opportunity not found.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Toggle Save / Bookmark Thunk
 */
export const toggleSaveInternship = createAsyncThunk(
  'internships/toggleSave',
  async (internshipId, { rejectWithValue }) => {
    try {
      const response = await internshipService.toggleSaveInternship(internshipId);
      const isSaved = response?.data?.isSaved ?? true;
      return { internshipId, isSaved };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to save internship';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch Saved Bookmarks Thunk
 */
export const fetchSavedInternships = createAsyncThunk(
  'internships/fetchSaved',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await internshipService.getSavedInternships(params);
      return response?.data || { data: [], pagination: { page: 1, limit: 12, total: 0 } };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch saved internships';
      return rejectWithValue(message);
    }
  }
);

export const internshipSlice = createSlice({
  name: 'internships',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearSelectedInternship: (state) => {
      state.selectedInternship = null;
      state.isSaved = false;
      state.hasApplied = false;
    },
    incomingInternshipCreated: (state, action) => {
      state.newArrivalsCount += 1;
      state.newArrivals.unshift(action.payload);
    },
    incomingInternshipExpired: (state, action) => {
      const expiredId = action.payload?.id;
      if (expiredId) {
        state.internships = state.internships.filter((item) => (item._id || item.id) !== expiredId);
      }
    },
    clearNewArrivals: (state) => {
      state.newArrivalsCount = 0;
      state.newArrivals = [];
    },
  },
  extraReducers: (builder) => {
    // ── fetchInternships ───────────────────────────────────────────────────
    builder
      .addCase(fetchInternships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInternships.fulfilled, (state, action) => {
        state.loading = false;
        state.internships = action.payload.data || [];
        state.pagination = action.payload.pagination || {
          page: 1,
          limit: 12,
          total: action.payload.data ? action.payload.data.length : 0,
          totalPages: 1,
        };
        state.lastSyncedAt = action.payload.lastSyncedAt || new Date().toISOString();
      })
      .addCase(fetchInternships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Failed to fetch internships';
      });

    // ── fetchInternshipDetail ──────────────────────────────────────────────
    builder
      .addCase(fetchInternshipDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchInternshipDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedInternship = action.payload.internship || action.payload;
        state.isSaved = Boolean(action.payload.isSaved);
        state.hasApplied = Boolean(action.payload.hasApplied);
      })
      .addCase(fetchInternshipDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || action.error.message;
      });

    // ── toggleSaveInternship ───────────────────────────────────────────────
    builder.addCase(toggleSaveInternship.fulfilled, (state, action) => {
      const { internshipId, isSaved } = action.payload;
      state.isSaved = isSaved;
      state.internships = state.internships.map((item) => {
        if ((item._id || item.id) === internshipId) {
          return { ...item, isSaved };
        }
        return item;
      });
      if (state.selectedInternship && (state.selectedInternship._id || state.selectedInternship.id) === internshipId) {
        state.selectedInternship = { ...state.selectedInternship, isSaved };
      }
    });

    // ── fetchSavedInternships ──────────────────────────────────────────────
    builder
      .addCase(fetchSavedInternships.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSavedInternships.fulfilled, (state, action) => {
        state.loading = false;
        state.savedInternships = action.payload.data || [];
      })
      .addCase(fetchSavedInternships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  setFilters,
  resetFilters,
  setPage,
  clearSelectedInternship,
  incomingInternshipCreated,
  incomingInternshipExpired,
  clearNewArrivals,
} = internshipSlice.actions;

export default internshipSlice.reducer;
