import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import studentReducer from '../features/student/studentSlice.js';

/**
 * Central Redux Store.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['meta.baseQueryMeta'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export default store;
