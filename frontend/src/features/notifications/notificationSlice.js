import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService.js';

const initialState = {
  notifications: {
    data: [],
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    unreadCount: 0,
  },
  unreadCount: 0,
  dropdownOpen: false,
  activeFilter: 'ALL',
  loading: false,
  actionLoading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchUserNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUserNotifications(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch notifications.'
      );
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load unread count.'
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update notification.'
      );
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead();
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to mark all as read.'
      );
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete notification.'
      );
    }
  }
);

export const clearReadNotifications = createAsyncThunk(
  'notifications/clearRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.clearReadNotifications();
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to clear read notifications.'
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    toggleDropdown: (state) => {
      state.dropdownOpen = !state.dropdownOpen;
    },
    closeDropdown: (state) => {
      state.dropdownOpen = false;
    },
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // List Notifications
    builder
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Unread Count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unreadCount || 0;
        state.notifications.unreadCount = action.payload.unreadCount || 0;
      });

    // Mark Single As Read (Optimistic Mutation)
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const updated = action.payload;
      const idx = state.notifications.data.findIndex((n) => n._id === updated._id);
      if (idx !== -1 && !state.notifications.data[idx].read) {
        state.notifications.data[idx].read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
      }
    });

    // Mark All As Read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.notifications.data.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
      state.notifications.unreadCount = 0;
    });

    // Delete Single Notification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const id = action.payload;
      const target = state.notifications.data.find((n) => n._id === id);
      if (target && !target.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
      }
      state.notifications.data = state.notifications.data.filter((n) => n._id !== id);
      state.notifications.total = Math.max(0, state.notifications.total - 1);
    });

    // Clear Read Notifications
    builder.addCase(clearReadNotifications.fulfilled, (state) => {
      state.notifications.data = state.notifications.data.filter((n) => !n.read);
      state.notifications.total = state.notifications.data.length;
    });
  },
});

export const { toggleDropdown, closeDropdown, setActiveFilter } =
  notificationSlice.actions;
export default notificationSlice.reducer;
