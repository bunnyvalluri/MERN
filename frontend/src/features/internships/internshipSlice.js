import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import internshipService from '../../services/internshipService.js';

const initialFilters = {
  search: '',
  location: '',
  remote: 'ALL',
  type: 'ALL',
  skills: '',
  minStipend: '',
  maxStipend: '',
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
  loading: false,
  detailLoading: false,
  error: null,
};

/**
 * Fetch Internships with Filter & Pagination
 */
export const fetchInternships = createAsyncThunk(
  'internships/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      const response = await internshipService.getInternships(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch internship listings.'
      );
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
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load internship details.'
      );
    }
  }
);

/**
 * Toggle Save / Bookmark Thunk (Optimistic update support)
 */
export const toggleSaveInternship = createAsyncThunk(
  'internships/toggleSave',
  async (internshipId, { rejectWithValue }) => {
    try {
      const response = await internshipService.toggleSaveInternship(internshipId);
      return { internshipId, isSaved: response.data.isSaved };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update saved status. Please log in.'
      );
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
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
  },
  extraReducers: (builder) => {
    // ─── Fetch List ───────────────────────────────────────────────────────────
    builder
      .addCase(fetchInternships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInternships.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, limit, total, totalPages } = action.payload;
        state.internships = data;
        state.pagination = { page, limit, total, totalPages };
      })
      .addCase(fetchInternships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── Fetch Detail ─────────────────────────────────────────────────────────
    builder
      .addCase(fetchInternshipDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
        state.selectedInternship = null;
      })
      .addCase(fetchInternshipDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedInternship = action.payload.internship;
        state.isSaved = action.payload.isSaved;
        state.hasApplied = action.payload.hasApplied;
      })
      .addCase(fetchInternshipDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });

    // ─── Toggle Save ──────────────────────────────────────────────────────────
    builder.addCase(toggleSaveInternship.fulfilled, (state, action) => {
      const { internshipId, isSaved } = action.payload;
      // Update in listing view
      const item = state.internships.find((i) => i._id === internshipId);
      if (item) {
        item.isSaved = isSaved;
      }
      // Update in details view
      if (state.selectedInternship && state.selectedInternship._id === internshipId) {
        state.isSaved = isSaved;
      }
    });
  },
});

export const { setFilters, setPage, resetFilters } = internshipSlice.actions;
export default internshipSlice.reducer;
