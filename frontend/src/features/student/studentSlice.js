import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studentService from '../../services/studentService.js';

const initialState = {
  profile: null,
  completion: {
    percentage: 0,
    breakdown: {},
    nextSteps: [],
  },
  loading: false,
  saving: false,
  error: null,
};

/**
 * Fetch Current Student Profile Thunk
 */
export const fetchStudentProfile = createAsyncThunk(
  'student/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentService.getOwnProfile();
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch student profile.'
      );
    }
  }
);

/**
 * Update Student Profile Thunk
 */
export const updateStudentProfile = createAsyncThunk(
  'student/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await studentService.updateOwnProfile(profileData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update profile.'
      );
    }
  }
);

/**
 * Upload / Replace Resume Thunk
 */
export const uploadStudentResume = createAsyncThunk(
  'student/uploadResume',
  async (resumeData, { rejectWithValue }) => {
    try {
      const response = await studentService.uploadResume(resumeData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to upload resume.'
      );
    }
  }
);

/**
 * Delete Resume Thunk
 */
export const deleteStudentResume = createAsyncThunk(
  'student/deleteResume',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentService.deleteResume();
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to remove resume.'
      );
    }
  }
);

export const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearStudentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ─── Fetch Profile ────────────────────────────────────────────────────────
    builder
      .addCase(fetchStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.completion = action.payload.completion || { percentage: 0, breakdown: {}, nextSteps: [] };
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── Update Profile ───────────────────────────────────────────────────────
    builder
      .addCase(updateStudentProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload.profile;
        state.completion = action.payload.completion;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });

    // ─── Upload Resume ────────────────────────────────────────────────────────
    builder
      .addCase(uploadStudentResume.pending, (state) => {
        state.saving = true;
      })
      .addCase(uploadStudentResume.fulfilled, (state, action) => {
        state.saving = false;
        if (state.profile) {
          state.profile.resume = action.payload.resume;
        }
        state.completion = action.payload.completion;
      })
      .addCase(uploadStudentResume.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });

    // ─── Delete Resume ────────────────────────────────────────────────────────
    builder
      .addCase(deleteStudentResume.pending, (state) => {
        state.saving = true;
      })
      .addCase(deleteStudentResume.fulfilled, (state, action) => {
        state.saving = false;
        if (state.profile) {
          state.profile.resume = { url: null, fileName: null, publicId: null, uploadedAt: null };
        }
        state.completion = action.payload.completion;
      })
      .addCase(deleteStudentResume.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearStudentError } = studentSlice.actions;
export default studentSlice.reducer;
