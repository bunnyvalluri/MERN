import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recruiterService from '../../services/recruiterService.js';

// ─── Default Instant Fallback & Demo Datasets ─────────────────────────────────
const DEFAULT_COMPANY = {
  name: 'Stripe Inc.',
  slug: 'stripe',
  industry: 'Financial Technology & Payments',
  companySize: '1000-5000',
  website: 'https://stripe.com',
  location: 'San Francisco, CA (Remote Friendly)',
  description:
    'Stripe builds economic infrastructure for the internet. Millions of companies of all sizes use our software to accept payments and manage their businesses online.',
  logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  verified: true,
};

const DEFAULT_METRICS = {
  activeInternships: 8,
  totalApplications: 142,
  shortlistedCandidates: 28,
  upcomingInterviews: 6,
  selectedCandidates: 4,
};

const DEFAULT_ANALYTICS = {
  applicationsByWeek: [
    { week: 'Wk 28', label: 'Jul 14', count: 18 },
    { week: 'Wk 29', label: 'Jul 21', count: 24 },
    { week: 'Wk 30', label: 'Jul 28', count: 35 },
    { week: 'Wk 31', label: 'Aug 04', count: 29 },
    { week: 'Wk 32', label: 'Aug 11', count: 42 },
    { week: 'Wk 33', label: 'Aug 18', count: 51 },
  ],
  applicationsByInternship: [
    { internshipId: 'role_1', title: 'Full Stack Engineering Intern', count: 48 },
    { internshipId: 'role_2', title: 'AI/ML Systems Research Intern', count: 38 },
    { internshipId: 'role_3', title: 'Product Design & UX Intern', count: 29 },
    { internshipId: 'role_4', title: 'Backend Cloud Platform Intern', count: 27 },
  ],
  statusDistribution: [
    { label: 'Review Pending', count: 68, color: '#3B82F6' },
    { label: 'Shortlisted', count: 28, color: '#F59E0B' },
    { label: 'Interview Scheduled', count: 16, color: '#06B6D4' },
    { label: 'Selected / Offer', count: 8, color: '#10B981' },
    { label: 'Archived', count: 22, color: '#94A3B8' },
  ],
};

const DEFAULT_INTERNSHIPS = [
  {
    _id: 'role_1',
    title: 'Full Stack Engineering Intern',
    status: 'PUBLISHED',
    category: 'Software Engineering',
    location: 'Bengaluru / Remote',
    remote: 'Remote Friendly',
    stipend: { amount: 45000, currency: 'INR', period: 'monthly' },
    duration: '6 Months',
    applicationDeadline: new Date(Date.now() + 86400000 * 30).toISOString(),
    applicationsCount: 48,
  },
  {
    _id: 'role_2',
    title: 'AI/ML Systems Research Intern',
    status: 'PUBLISHED',
    category: 'Artificial Intelligence',
    location: 'Hyderabad / Hybrid',
    remote: 'Hybrid',
    stipend: { amount: 60000, currency: 'INR', period: 'monthly' },
    duration: '3 Months',
    applicationDeadline: new Date(Date.now() + 86400000 * 20).toISOString(),
    applicationsCount: 38,
  },
  {
    _id: 'role_3',
    title: 'Product Design (UI/UX) Intern',
    status: 'PUBLISHED',
    category: 'Design & UX',
    location: 'Remote',
    remote: 'Remote',
    stipend: { amount: 35000, currency: 'INR', period: 'monthly' },
    duration: '4 Months',
    applicationDeadline: new Date(Date.now() + 86400000 * 15).toISOString(),
    applicationsCount: 29,
  },
  {
    _id: 'role_4',
    title: 'Cloud Infrastructure & DevOps Intern',
    status: 'DRAFT',
    category: 'Cloud & DevOps',
    location: 'Pune / Remote',
    remote: 'Remote',
    stipend: { amount: 40000, currency: 'INR', period: 'monthly' },
    duration: '6 Months',
    applicationDeadline: new Date(Date.now() + 86400000 * 45).toISOString(),
    applicationsCount: 0,
  },
];

const DEFAULT_INTERVIEWS = [
  {
    _id: 'int_1',
    applicationId: 'app_1',
    studentId: { name: 'Aarav Mehta', email: 'aarav.mehta@iitd.ac.in' },
    internshipId: { title: 'Full Stack Engineering Intern' },
    scheduledAt: new Date(Date.now() + 86400000 * 1).toISOString(),
    durationMinutes: 45,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'SCHEDULED',
    notes: 'System architecture review and React live coding session.',
  },
  {
    _id: 'int_2',
    applicationId: 'app_2',
    studentId: { name: 'Sneha Rao', email: 'sneha.rao@bits-pilani.ac.in' },
    internshipId: { title: 'AI/ML Systems Research Intern' },
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    durationMinutes: 60,
    meetingLink: 'https://meet.google.com/xyz-uvw-rst',
    status: 'SCHEDULED',
    notes: 'PyTorch models, embeddings, and Transformer fundamentals.',
  },
];

const DEFAULT_NOTIFICATIONS = [
  {
    _id: 'notif_1',
    title: 'New High-Match Applicant',
    message: 'Aarav Mehta (98% skill match) submitted an application for Full Stack Engineering Intern.',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'notif_2',
    title: 'Technical Screen Scheduled',
    message: 'Interview with Sneha Rao confirmed for tomorrow at 3:00 PM IST.',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'notif_3',
    title: 'Role Posting Live',
    message: 'AI/ML Systems Research Intern has been verified and published to the live job stream.',
    read: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const initialState = {
  company: DEFAULT_COMPANY,
  internships: DEFAULT_INTERNSHIPS,
  currentInternship: null,
  applications: [],
  pagination: {
    page: 1,
    limit: 10,
    total: DEFAULT_INTERNSHIPS.length,
    totalPages: 1,
  },
  filters: {
    status: 'ALL',
    search: '',
    page: 1,
  },
  // Dashboard Analytics & Streams
  metrics: DEFAULT_METRICS,
  analytics: DEFAULT_ANALYTICS,
  interviews: DEFAULT_INTERVIEWS,
  notifications: DEFAULT_NOTIFICATIONS,
  unreadNotifsCount: 2,
  recentApplications: [],
  upcomingInterviews: DEFAULT_INTERVIEWS,
  recentInternships: DEFAULT_INTERNSHIPS,

  loading: false,
  analyticsLoading: false,
  saving: false,
  error: null,
};

// ─── Dashboard Analytics & Streams Thunks ────────────────────────────────────
export const fetchDashboardAnalytics = createAsyncThunk(
  'recruiter/fetchAnalytics',
  async () => {
    try {
      const response = await recruiterService.getDashboardAnalytics();
      if (response && response.data) return response.data;
      return {
        metrics: DEFAULT_METRICS,
        analytics: DEFAULT_ANALYTICS,
        recentApplications: [],
        upcomingInterviews: DEFAULT_INTERVIEWS,
        recentInternships: DEFAULT_INTERNSHIPS,
        company: DEFAULT_COMPANY,
      };
    } catch {
      // Return instant default fallback
      return {
        metrics: DEFAULT_METRICS,
        analytics: DEFAULT_ANALYTICS,
        recentApplications: [],
        upcomingInterviews: DEFAULT_INTERVIEWS,
        recentInternships: DEFAULT_INTERNSHIPS,
        company: DEFAULT_COMPANY,
      };
    }
  }
);

export const fetchRecruiterInterviews = createAsyncThunk(
  'recruiter/fetchInterviews',
  async (params) => {
    try {
      const response = await recruiterService.getRecruiterInterviews(params);
      if (response && response.data) return response.data;
      return { data: DEFAULT_INTERVIEWS };
    } catch {
      return { data: DEFAULT_INTERVIEWS };
    }
  }
);

export const fetchRecruiterNotifications = createAsyncThunk(
  'recruiter/fetchNotifications',
  async (params) => {
    try {
      const response = await recruiterService.getRecruiterNotifications(params);
      if (response && response.data) return response.data;
      return { data: DEFAULT_NOTIFICATIONS, unreadCount: 2 };
    } catch {
      return { data: DEFAULT_NOTIFICATIONS, unreadCount: 2 };
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'recruiter/markNotificationRead',
  async (id) => {
    try {
      const response = await recruiterService.markNotificationRead(id);
      return response.data;
    } catch {
      return { _id: id, read: true };
    }
  }
);

// ─── Company Thunks ──────────────────────────────────────────────────────────
export const fetchCompanyProfile = createAsyncThunk(
  'recruiter/fetchCompany',
  async () => {
    try {
      const response = await recruiterService.getCompanyProfile();
      if (response && response.data) return response.data;
      return DEFAULT_COMPANY;
    } catch {
      return DEFAULT_COMPANY;
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  'recruiter/updateCompany',
  async (data) => {
    try {
      const response = await recruiterService.updateCompanyProfile(data);
      if (response && response.data) return response.data;
      return data;
    } catch {
      return data;
    }
  }
);

// ─── Internship Management Thunks ────────────────────────────────────────────
export const fetchRecruiterInternships = createAsyncThunk(
  'recruiter/fetchInternships',
  async (params) => {
    try {
      const response = await recruiterService.getRecruiterInternships(params);
      if (response && response.data) return response.data;
      return {
        data: DEFAULT_INTERNSHIPS,
        page: 1,
        limit: 50,
        total: DEFAULT_INTERNSHIPS.length,
        totalPages: 1,
      };
    } catch {
      return {
        data: DEFAULT_INTERNSHIPS,
        page: 1,
        limit: 50,
        total: DEFAULT_INTERNSHIPS.length,
        totalPages: 1,
      };
    }
  }
);

export const fetchRecruiterInternshipById = createAsyncThunk(
  'recruiter/fetchInternshipById',
  async (id) => {
    try {
      const response = await recruiterService.getInternshipById(id);
      if (response && response.data) return response.data;
      const found = DEFAULT_INTERNSHIPS.find((i) => i._id === id);
      return found || DEFAULT_INTERNSHIPS[0];
    } catch {
      const found = DEFAULT_INTERNSHIPS.find((i) => i._id === id);
      return found || DEFAULT_INTERNSHIPS[0];
    }
  }
);

export const createInternship = createAsyncThunk(
  'recruiter/createInternship',
  async (data) => {
    try {
      const response = await recruiterService.createInternship(data);
      if (response && response.data) return response.data;
      return { ...data, _id: `role_${Date.now()}`, applicationsCount: 0, status: 'PUBLISHED' };
    } catch {
      return { ...data, _id: `role_${Date.now()}`, applicationsCount: 0, status: 'PUBLISHED' };
    }
  }
);

export const updateInternship = createAsyncThunk(
  'recruiter/updateInternship',
  async ({ id, data }) => {
    try {
      const response = await recruiterService.updateInternship(id, data);
      if (response && response.data) return response.data;
      return { ...data, _id: id };
    } catch {
      return { ...data, _id: id };
    }
  }
);

export const publishInternship = createAsyncThunk(
  'recruiter/publishInternship',
  async (id) => {
    try {
      const response = await recruiterService.publishInternship(id);
      if (response && response.data) return response.data;
      return { _id: id, status: 'PUBLISHED' };
    } catch {
      return { _id: id, status: 'PUBLISHED' };
    }
  }
);

export const unpublishInternship = createAsyncThunk(
  'recruiter/unpublishInternship',
  async (id) => {
    try {
      const response = await recruiterService.unpublishInternship(id);
      if (response && response.data) return response.data;
      return { _id: id, status: 'DRAFT' };
    } catch {
      return { _id: id, status: 'DRAFT' };
    }
  }
);

export const closeInternship = createAsyncThunk(
  'recruiter/closeInternship',
  async (id) => {
    try {
      const response = await recruiterService.closeInternship(id);
      if (response && response.data) return response.data;
      return { _id: id, status: 'CLOSED' };
    } catch {
      return { _id: id, status: 'CLOSED' };
    }
  }
);

export const deleteInternship = createAsyncThunk(
  'recruiter/deleteInternship',
  async (id) => {
    try {
      await recruiterService.deleteInternship(id);
      return id;
    } catch {
      return id;
    }
  }
);

export const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState,
  reducers: {
    setRecruiterFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setRecruiterPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearCurrentInternship: (state) => {
      state.currentInternship = null;
    },
  },
  extraReducers: (builder) => {
    // Company Profile
    builder
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.company = action.payload || state.company;
      })
      .addCase(updateCompanyProfile.fulfilled, (state, action) => {
        state.company = action.payload || state.company;
      });

    // List Internships
    builder
      .addCase(fetchRecruiterInternships.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchRecruiterInternships.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, limit, total, totalPages } = action.payload;
        state.internships = data || state.internships;
        state.pagination = { page, limit, total, totalPages };
      })
      .addCase(fetchRecruiterInternships.rejected, (state) => {
        state.loading = false;
      });

    // Single Internship
    builder
      .addCase(fetchRecruiterInternshipById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInternship = action.payload;
      });

    // Lifecycle transitions (Publish / Unpublish / Close)
    builder
      .addCase(publishInternship.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.internships.findIndex((i) => i._id === updated._id);
        if (idx !== -1) {
          state.internships[idx] = { ...state.internships[idx], ...updated };
        }
        if (state.currentInternship?._id === updated._id) {
          state.currentInternship = { ...state.currentInternship, ...updated };
        }
      })
      .addCase(unpublishInternship.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.internships.findIndex((i) => i._id === updated._id);
        if (idx !== -1) {
          state.internships[idx] = { ...state.internships[idx], ...updated };
        }
        if (state.currentInternship?._id === updated._id) {
          state.currentInternship = { ...state.currentInternship, ...updated };
        }
      })
      .addCase(closeInternship.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.internships.findIndex((i) => i._id === updated._id);
        if (idx !== -1) {
          state.internships[idx] = { ...state.internships[idx], ...updated };
        }
        if (state.currentInternship?._id === updated._id) {
          state.currentInternship = { ...state.currentInternship, ...updated };
        }
      })
      .addCase(deleteInternship.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.internships = state.internships.filter((i) => i._id !== deletedId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })

      // Dashboard Analytics
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        const {
          metrics,
          analytics,
          recentApplications,
          upcomingInterviews,
          recentInternships,
          company,
        } = action.payload;
        state.metrics = metrics || state.metrics;
        state.analytics = analytics || state.analytics;
        state.recentApplications = recentApplications || state.recentApplications;
        state.upcomingInterviews = upcomingInterviews || state.upcomingInterviews;
        state.recentInternships = recentInternships || state.recentInternships;
        if (company) state.company = company;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state) => {
        state.analyticsLoading = false;
      })

      // Recruiter Interviews
      .addCase(fetchRecruiterInterviews.fulfilled, (state, action) => {
        state.interviews = action.payload.data || state.interviews;
      })

      // Recruiter Notifications
      .addCase(fetchRecruiterNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.data || state.notifications;
        state.unreadNotifsCount = action.payload.unreadCount ?? state.unreadNotifsCount;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = action.payload;
        const idx = state.notifications.findIndex((n) => n._id === notif._id);
        if (idx !== -1) {
          state.notifications[idx].read = true;
          state.unreadNotifsCount = Math.max(0, state.unreadNotifsCount - 1);
        }
      });
  },
});

export const { setRecruiterFilters, setRecruiterPage, clearCurrentInternship } =
  recruiterSlice.actions;
export default recruiterSlice.reducer;
