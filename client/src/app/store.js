import { configureStore } from '@reduxjs/toolkit';

/**
 * Redux store.
 *
 * Feature slices are added here as they are built in subsequent phases.
 * RTK Query API slices will also be registered here.
 */
export const store = configureStore({
  reducer: {
    // Phase 2+: auth, internships, applications, notifications, ui
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths for serializability (e.g. Date objects in API responses)
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['meta.baseQueryMeta'],
      },
    }),
  devTools: import.meta.env.DEV,
});
