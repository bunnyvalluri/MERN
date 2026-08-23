import { createSlice } from '@reduxjs/toolkit';

/**
 * Network Status Slice
 *
 * Tracks the client's online/offline connectivity state in Redux.
 * Updated by:
 *  1. The NetworkStatusBanner component (window online/offline events)
 *  2. The Axios response interceptor (on network errors)
 *
 * Consumed by:
 *  - NetworkStatusBanner component (shows offline banner)
 *  - Any component that needs to disable actions while offline
 */
const networkSlice = createSlice({
  name: 'network',
  initialState: {
    /** true = connected, false = offline or unreachable */
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    /** ISO timestamp of when the current status was last detected */
    lastCheckedAt: null,
  },
  reducers: {
    setOnline(state) {
      state.isOnline = true;
      state.lastCheckedAt = new Date().toISOString();
    },
    setOffline(state) {
      state.isOnline = false;
      state.lastCheckedAt = new Date().toISOString();
    },
  },
});

export const { setOnline, setOffline } = networkSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectIsOnline = (state) => state.network.isOnline;

export default networkSlice.reducer;
