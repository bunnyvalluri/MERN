import axios from 'axios';

/**
 * Axios instance pre-configured for the InternHub API.
 *
 * Base URL is read from the Vite environment variable so it works
 * correctly in both development (proxy or direct) and production.
 *
 * Interceptors added here:
 * - Request: attaches the JWT access token from Redux store (added in Phase 2)
 * - Response: handles 401 → silent token refresh → retry (added in Phase 2)
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true, // Required for HttpOnly refresh token cookie
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second request timeout
});

// ─── Request interceptor ──────────────────────────────────────────────────────
// Token attachment will be added in Phase 2 when auth slice is implemented.
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
// Token refresh logic will be added in Phase 2.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default apiClient;
