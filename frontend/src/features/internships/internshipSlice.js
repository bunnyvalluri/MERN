import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import internshipService from '../../services/internshipService.js';
import { getRealInternshipById } from './data/realInternships.js';
import { getAllLiveAndVerifiedInternships } from '../../services/liveJobsService.js';

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

async function queryAggregatedInternships(params = {}, savedIds = new Set(), forceRefresh = false) {
  let list = await getAllLiveAndVerifiedInternships(forceRefresh);

  // 1. Keyword search (title, company name, skills, description)
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const compName = (item.companyId?.name || item.company || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const skillsMatch = (item.skills || []).some((s) => s.toLowerCase().includes(q));
      return (
        title.includes(q) ||
        compName.includes(q) ||
        desc.includes(q) ||
        cat.includes(q) ||
        skillsMatch
      );
    });
  }

  // 2. Location filter
  if (params.location && params.location.trim()) {
    const loc = params.location.trim().toLowerCase();
    list = list.filter((item) => {
      const city = (item.location?.city || '').toLowerCase();
      const state = (item.location?.state || '').toLowerCase();
      const country = (item.location?.country || '').toLowerCase();
      return city.includes(loc) || state.includes(loc) || country.includes(loc);
    });
  }

  // 3. Remote filter
  if (params.remote && params.remote !== 'ALL' && params.remote !== 'all') {
    list = list.filter((item) => item.remote === params.remote);
  }

  // 4. Type filter (FULL_TIME / PART_TIME)
  if (params.type && params.type !== 'ALL' && params.type !== 'all') {
    list = list.filter((item) => item.type === params.type);
  }

  // 5. Category filter
  if (params.category && params.category !== 'ALL' && params.category !== 'all') {
    if (params.category === 'LIVE_FEED') {
      list = list.filter((item) => item.isLiveFeed);
    } else if (params.category === 'TIER_1') {
      list = list.filter((item) => !item.isLiveFeed);
    } else {
      list = list.filter((item) => item.category === params.category);
    }
  }

  // 6. Min/Max Stipend
  if (params.minStipend) {
    const min = Number(params.minStipend);
    if (!isNaN(min)) {
      list = list.filter((item) => (item.stipend?.amount || 0) >= min);
    }
  }
  if (params.maxStipend) {
    const max = Number(params.maxStipend);
    if (!isNaN(max)) {
      list = list.filter((item) => (item.stipend?.amount || 0) <= max);
    }
  }

  // 7. Skills filter
  if (params.skills && params.skills.trim()) {
    const requiredSkills = params.skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (requiredSkills.length > 0) {
      list = list.filter((item) =>
        requiredSkills.some((req) =>
          item.skills.some((s) => s.toLowerCase() === req)
        )
      );
    }
  }

  // 8. Date Posted filter
  if (params.datePosted && params.datePosted !== 'all') {
    const now = Date.now();
    const mapDays = { '24h': 1, '7d': 7, '14d': 14, '30d': 30 };
    const maxDays = mapDays[params.datePosted];
    if (maxDays) {
      const cutoff = now - maxDays * 24 * 3600 * 1000;
      list = list.filter((item) => new Date(item.createdAt).getTime() >= cutoff);
    }
  }

  // 9. Sort By
  const sortBy = params.sortBy || 'latest';
  if (sortBy === 'deadline') {
    list.sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));
  } else if (sortBy === 'stipend_high') {
    list.sort((a, b) => (b.stipend?.amount || 0) - (a.stipend?.amount || 0));
  } else if (sortBy === 'stipend_low') {
    list.sort((a, b) => (a.stipend?.amount || 0) - (b.stipend?.amount || 0));
  } else if (sortBy === 'popularity') {
    list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  } else {
    // latest
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const total = list.length;
  const page = Math.max(1, parseInt(params.page, 10) || 1);
  const limit = Math.max(1, parseInt(params.limit, 10) || 12);
  const skip = (page - 1) * limit;

  const paginated = list.slice(skip, skip + limit).map((item) => ({
    ...item,
    isSaved: savedIds.has(item._id || item.id),
  }));

  return {
    data: paginated,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    lastSynced: new Date().toISOString(),
  };
}

const initialFilters = {
  search: '',
  location: '',
  remote: 'ALL',
  type: 'ALL',
  category: 'ALL',
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
  syncing: false,
  lastSyncedAt: null,
  detailLoading: false,
  error: null,
};

/**
 * Fetch Internships with Filter & Pagination (Resilient with 24/7 Live Data Aggregation)
 */
export const fetchInternships = createAsyncThunk(
  'internships/fetchList',
  async (params = {}) => {
    const savedSet = getStoredSavedSet();
    try {
      const response = await internshipService.getInternships(params);
      if (response && response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data;
      }
      return await queryAggregatedInternships(params, savedSet, false);
    } catch {
      return await queryAggregatedInternships(params, savedSet, false);
    }
  }
);

/**
 * Force Live Re-Sync from 24/7 Job APIs
 */
export const syncLiveFeeds = createAsyncThunk(
  'internships/syncLiveFeeds',
  async (params = {}) => {
    const savedSet = getStoredSavedSet();
    return await queryAggregatedInternships(params, savedSet, true);
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
      // Check live cache or verified data
      const all = await getAllLiveAndVerifiedInternships(false);
      const found = all.find(
        (item) => item._id === idOrSlug || item.id === idOrSlug || item.slug === idOrSlug.toLowerCase()
      );
      if (found) {
        return {
          internship: {
            ...found,
            isSaved: savedSet.has(found._id || found.id),
          },
          isSaved: savedSet.has(found._id || found.id),
          hasApplied: false,
        };
      }
      const fallback = getRealInternshipById(idOrSlug, savedSet);
      if (fallback) return fallback;
      return rejectWithValue('Internship opportunity not found.');
    } catch {
      const all = await getAllLiveAndVerifiedInternships(false);
      const found = all.find(
        (item) => item._id === idOrSlug || item.id === idOrSlug || item.slug === idOrSlug.toLowerCase()
      );
      if (found) {
        return {
          internship: {
            ...found,
            isSaved: savedSet.has(found._id || found.id),
          },
          isSaved: savedSet.has(found._id || found.id),
          hasApplied: false,
        };
      }
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
  async (internshipId) => {
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
      // Local set persisted
    }

    return { internshipId, isSaved: newSavedStatus };
  }
);

/**
 * Fetch Saved Bookmarks Thunk
 */
export const fetchSavedInternships = createAsyncThunk(
  'internships/fetchSaved',
  async (params = {}) => {
    const savedSet = getStoredSavedSet();
    try {
      const response = await internshipService.getSavedInternships(params);
      if (response && response.data && Array.isArray(response.data.data)) {
        return response.data;
      }
      const all = await getAllLiveAndVerifiedInternships(false);
      const savedItems = all.filter((i) => savedSet.has(i._id || i.id));
      return { data: savedItems, total: savedItems.length };
    } catch {
      const all = await getAllLiveAndVerifiedInternships(false);
      const savedItems = all.filter((i) => savedSet.has(i._id || i.id));
      return { data: savedItems, total: savedItems.length };
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
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 12,
          total: action.payload.total || (action.payload.data ? action.payload.data.length : 0),
          totalPages: action.payload.totalPages || 1,
        };
        state.lastSyncedAt = action.payload.lastSynced || new Date().toISOString();
      })
      .addCase(fetchInternships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch internships';
      });

    // ── syncLiveFeeds ──────────────────────────────────────────────────────
    builder
      .addCase(syncLiveFeeds.pending, (state) => {
        state.syncing = true;
      })
      .addCase(syncLiveFeeds.fulfilled, (state, action) => {
        state.syncing = false;
        state.internships = action.payload.data || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 12,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 1,
        };
        state.lastSyncedAt = new Date().toISOString();
      })
      .addCase(syncLiveFeeds.rejected, (state) => {
        state.syncing = false;
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
        if (item._id === internshipId || item.id === internshipId) {
          return { ...item, isSaved };
        }
        return item;
      });
      if (state.selectedInternship && (state.selectedInternship._id === internshipId || state.selectedInternship.id === internshipId)) {
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
        state.error = action.error.message;
      });
  },
});

export const {
  setFilters,
  resetFilters,
  setPage,
  clearSelectedInternship,
} = internshipSlice.actions;

export default internshipSlice.reducer;
