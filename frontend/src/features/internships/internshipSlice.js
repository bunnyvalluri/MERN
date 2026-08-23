import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import internshipService from '../../services/internshipService.js';
import { queryRealInternships, getRealInternshipById } from './data/realInternships.js';

const STORAGE_SAVED_KEY = 'internhub_saved_internships';

function getStoredSavedSet() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistSavedSet(set) {
  try {
    localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify([...set]));
  } catch {
    // Ignore storage quota errors
  }
}

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
 * Fetch Internships with Filter & Pagination (Resilient with real dataset fallback)
 */
export const fetchInternships = createAsyncThunk(
  'internships/fetchList',
  async (params = {}, { rejectWithValue }) => {
    const savedSet = getStoredSavedSet();
    try {
      const response = await internshipService.getInternships(params);
      if (response && response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data;
      }
      // If API returned empty but not due to strict filters, or DB is initializing:
      return queryRealInternships(params, savedSet);
    } catch {
      // Return real client dataset seamlessly
      return queryRealInternships(params, savedSet);
    }
  }
);

/**
 * Fetch Single Internship Details (Resilient)
 */
export const fetchInternshipDetail = createAsyncThunk(
  'internships/fetchDetail',
  async (idOrSlug, { rejectWithValue }) => {
    const savedSet = getStoredSavedSet();
    try {
      const response = await internshipService.getInternshipById(idOrSlug);
      if (response && response.data && response.data.internship) {
        return response.data;
      }
      const fallback = getRealInternshipById(idOrSlug, savedSet);
      if (fallback) return fallback;
      return rejectWithValue('Internship opportunity not found.');
    } catch {
      const fallback = getRealInternshipById(idOrSlug, savedSet);
      if (fallback) return fallback;
      return rejectWithValue('Internship opportunity not found.');
    }
  }
);

/**
 * Toggle Save / Bookmark Thunk
 */
export const toggleSaveInternship = createAsyncThunk(
  'internships/toggleSave',
  async (internshipId, { rejectWithValue }) => {
    const savedSet = getStoredSavedSet();
    const isCurrentlySaved = savedSet.has(internshipId);
    let newSavedStatus = !isCurrentlySaved;

    if (newSavedStatus) {
      savedSet.add(internshipId);
    } else {
      savedSet.delete(internshipId);
    }
    persistSavedSet(savedSet);

    try {
      const response = await internshipService.toggleSaveInternship(internshipId);
      if (response && response.data && typeof response.data.isSaved === 'boolean') {
        newSavedStatus = response.data.isSaved;
      }
    } catch {
      // Local fallback already toggled
    }

    return { internshipId, isSaved: newSavedStatus };
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
        state.internships = data || [];
        state.pagination = { page: page || 1, limit: limit || 12, total: total || 0, totalPages: totalPages || 1 };
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
      const item = state.internships.find((i) => (i._id || i.id) === internshipId);
      if (item) {
        item.isSaved = isSaved;
      }
      // Update in details view
      if (
        state.selectedInternship &&
        (state.selectedInternship._id === internshipId || state.selectedInternship.id === internshipId)
      ) {
        state.isSaved = isSaved;
      }
    });
  },
});

export const { setFilters, setPage, resetFilters } = internshipSlice.actions;
export default internshipSlice.reducer;
