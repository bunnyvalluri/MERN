import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import studentReducer from '../features/student/studentSlice.js';
import internshipReducer from '../features/internships/internshipSlice.js';
import recruiterReducer from '../features/recruiter/recruiterSlice.js';
import applicationReducer from '../features/applications/applicationSlice.js';
import interviewReducer from '../features/interviews/interviewSlice.js';
import notificationReducer from '../features/notifications/notificationSlice.js';
import adminReducer from '../features/admin/adminSlice.js';
import networkReducer from '../store/networkSlice.js';

/**
 * Central Redux Store.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    internships: internshipReducer,
    recruiter: recruiterReducer,
    applications: applicationReducer,
    interviews: interviewReducer,
    notifications: notificationReducer,
    admin: adminReducer,
    network: networkReducer,
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
