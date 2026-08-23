import axios from 'axios';
import { parseApiError, isNetworkError } from '../utils/apiError.js';

/**
 * Axios instance pre-configured for the InternHub API.
 *
 * Features:
 * - Automatic JWT Bearer token injection
 * - Silent token refresh on 401 (queues concurrent requests)
 * - Structured error parsing via parseApiError()
 * - Offline / network error detection + Redux dispatch
 * - X-Request-Id forwarded from response headers for support tracing
 * - X-Client-Version sent on every request
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true, // Required for HttpOnly refresh token cookie
  headers: {
    'Content-Type': 'application/json',
    // Sent on every request so server logs can correlate client version with errors
    'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  timeout: 15000,
});

// ─── Store reference (lazily imported to avoid circular deps) ─────────────────
// We use a setter so the store can be injected after creation, avoiding
// the circular import: store → slice → axios → store
let _store = null;
export function injectStore(store) {
  _store = store;
}

// ─── Request Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (Silent Token Refresh + Error Parsing) ──────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  // ── Success: pass through, nothing to enrich ────────────────────────────
  (response) => response,

  // ── Error: parse + enrich before rejecting ─────────────────────────────
  async (error) => {
    const originalRequest = error.config;

    // ── Network / offline error ──────────────────────────────────────────
    if (isNetworkError(error)) {
      return Promise.reject(parseApiError(error));
    }

    // ── Handle 401 Unauthorized → attempt silent token refresh ───────────
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue the request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(parseApiError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }

        throw new Error('Refresh response missing accessToken');
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');

        // If refresh itself fails with 401, the session is truly expired.
        // Dispatch logout action so Redux clears auth state and redirects to login.
        if (refreshError?.response?.status === 401 || !refreshError?.response) {
          _store?.dispatch({ type: 'auth/clearAuth' });
        }

        return Promise.reject(parseApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    // ── All other errors: parse and forward requestId ────────────────────
    const parsed = parseApiError(error);
    // Attach the server's X-Request-Id header for support tracing
    parsed.requestId = error.response?.headers?.['x-request-id'] || parsed.requestId;
    return Promise.reject(parsed);
  }
);

export default apiClient;

