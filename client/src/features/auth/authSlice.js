import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService.js';

// Retrieve cached access token if available
const storedToken = localStorage.getItem('accessToken');

const initialState = {
  user: null,
  token: storedToken || null,
  isAuthenticated: Boolean(storedToken),
  role: null,
  loading: false,
  error: null,
};

/**
 * Register User Thunk
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const data = await authService.register({ name, email, password, role });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed. Please check your credentials.'
      );
    }
  }
);

/**
 * Login User Thunk
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login({ email, password });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    }
  }
);

/**
 * Logout User Thunk
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch {
      // Proceed with local client purge even if server call fails
    } finally {
      dispatch(clearCredentials());
    }
  }
);

/**
 * Fetch Current Authenticated User (Profile Verification)
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const data = await authService.getCurrentUser();
      return data;
    } catch (err) {
      dispatch(clearCredentials());
      return rejectWithValue(
        err.response?.data?.message || 'Session expired. Please log in again.'
      );
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = Boolean(token);
      state.role = user?.role || null;
      state.error = null;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('accessToken');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ─── Register ─────────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const { user, accessToken } = action.payload.data;
        state.user = user;
        state.token = accessToken;
        state.isAuthenticated = true;
        state.role = user.role;
        localStorage.setItem('accessToken', accessToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── Login ────────────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const { user, accessToken } = action.payload.data;
        state.user = user;
        state.token = accessToken;
        state.isAuthenticated = true;
        state.role = user.role;
        localStorage.setItem('accessToken', accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── Fetch Current User ───────────────────────────────────────────────────
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        const { user } = action.payload.data;
        state.user = user;
        state.role = user.role;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.role = null;
        localStorage.removeItem('accessToken');
      });
  },
});

export const { setCredentials, clearCredentials, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
