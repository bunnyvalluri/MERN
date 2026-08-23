# InternHub — Observability Reference Guide

> **Last updated:** 2026-08-23  
> **Applies to:** `server/` (Express + Mongoose) and `client/` (Vite + React SPA)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Request ID Flow](#2-request-id-flow)
3. [Standardized Error Schema](#3-standardized-error-schema)
4. [Error Code Catalog](#4-error-code-catalog)
5. [Structured Log Format](#5-structured-log-format)
6. [Audit Event Catalog](#6-audit-event-catalog)
7. [Sensitive Field Exclusion](#7-sensitive-field-exclusion)
8. [Frontend Error Handling](#8-frontend-error-handling)
9. [Database Error Handling](#9-database-error-handling)
10. [Future Monitoring Recommendations](#10-future-monitoring-recommendations)

---

## 1. Overview

InternHub uses a **two-layer observability strategy**:

| Layer | What's captured | Where |
|---|---|---|
| **Request IDs** | Every request gets a UUID; traceable across client ↔ server ↔ logs | `requestId.middleware.js` |
| **Structured HTTP logs** | JSON per request: method, URL, status, duration, userId | `httpLogger.middleware.js` |
| **Structured error logs** | JSON on every error: code, requestId, userId, stack (server only) | `error.middleware.js` |
| **Audit logs** | Named events for auth, authz, and admin actions | controllers + middleware |
| **Sensitive field scrubbing** | Passwords/tokens stripped from every log entry | `logger.sanitize()` |
| **Frontend Error Boundary** | Catches unhandled React render errors | `ErrorBoundary.jsx` |
| **Offline detection** | Browser online/offline events + Redux state | `NetworkStatusBanner.jsx` |
| **Structured API errors** | All Axios errors parsed into typed objects | `utils/apiError.js` |

---

## 2. Request ID Flow

```
Browser → [Axios adds X-Client-Version] → Express
              ↓
         requestIdMiddleware (FIRST middleware)
              ↓
         Generates UUID v4 (or echoes X-Request-Id from load balancer)
              ↓
         Attaches req.requestId
         Sets X-Request-Id response header
              ↓
         Every log entry includes requestId
         Every error response includes requestId
              ↓
Browser ← [Response carries X-Request-Id header] ← Express
              ↓
         Axios interceptor reads header
         parseApiError() includes requestId in ParsedApiError
              ↓
         UI shows requestId in dev error details
         requestId can be given to support for log lookup
```

**Header names:**
- `X-Request-Id` — request/response header, UUID v4

**Supported ID sources (in priority order):**
1. Client/load-balancer supplied `X-Request-Id` header (AWS ALB, Cloudflare, Nginx)
2. Generated UUID v4 (fallback for all other clients)

---

## 3. Standardized Error Schema

Every error response from the API has this exact shape:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "status": 400,
  "message": "Validation failed.",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-08-23T18:30:00.000Z",
  "errors": [
    { "field": "email", "message": "Email is required." }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `success` | `boolean` | Always `false` for errors |
| `code` | `string` | Machine-readable error code (SCREAMING_SNAKE_CASE) |
| `status` | `number` | HTTP status code |
| `message` | `string` | Human-readable message (safe for users) |
| `requestId` | `string \| null` | UUID for log correlation |
| `timestamp` | `string` | ISO-8601 timestamp |
| `errors` | `Array` | Field-level details (validation errors only) |
| `stack` | `string` | **Development only.** Never present in production. |

---

## 4. Error Code Catalog

### HTTP-Derived Codes (auto-assigned by status)

| Code | HTTP Status | Meaning |
|---|---|---|
| `BAD_REQUEST` | 400 | Malformed request |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate / state conflict |
| `VALIDATION_ERROR` | 400 | Input validation failed (has `errors[]`) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled server error |
| `SERVICE_UNAVAILABLE` | 503 | Server temporarily unable to handle requests |
| `GATEWAY_TIMEOUT` | 504 | Upstream timeout |

### Domain-Specific Codes

| Code | HTTP Status | Trigger |
|---|---|---|
| `TOKEN_EXPIRED` | 401 | JWT `TokenExpiredError` |
| `INVALID_TOKEN` | 401 | JWT `JsonWebTokenError` |
| `ACCOUNT_DEACTIVATED` | 403 | `user.isActive === false` |
| `EMAIL_NOT_VERIFIED` | 403 | `user.isVerified === false` |
| `DB_UNAVAILABLE` | 503 | MongoDB network/timeout error |
| `CORS_BLOCKED` | 403 | Origin not in allowedOrigins |

### Client-Side Only (no server response)

| Code | Trigger |
|---|---|
| `NETWORK_ERROR` | `!error.response` + Network Error |
| `TIMEOUT` | `error.code === 'ECONNABORTED'` |

---

## 5. Structured Log Format

### Development (colourized text)
```
[2026-08-23 18:30:00] info: HTTP request completed {"event":"HTTP_REQUEST","requestId":"uuid","method":"POST","url":"/api/v1/auth/login","statusCode":200,"responseTimeMs":45.23,"ip":"::1","userRole":"STUDENT"}
```

### Production (JSON — one object per line)
```json
{
  "level": "info",
  "message": "HTTP request completed",
  "timestamp": "2026-08-23T18:30:00.000Z",
  "service": "internhub-api",
  "environment": "production",
  "version": "1.0.0",
  "event": "HTTP_REQUEST",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "url": "/api/v1/auth/login",
  "statusCode": 200,
  "responseTimeMs": 45.23,
  "ip": "203.0.113.1",
  "userAgent": "Mozilla/5.0 ...",
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "userRole": "STUDENT"
}
```

### Log Levels

| Level | When used |
|---|---|
| `error` | Server errors (5xx), DB connectivity errors, unhandled exceptions |
| `warn` | Client errors (4xx), auth failures, authz denials |
| `info` | HTTP requests (2xx/3xx), successful auth events, admin actions |
| `debug` | Development only — detailed execution traces |

### Log Level Configuration

Set via environment variable:
```
LOG_LEVEL=debug   # Override to debug in production for troubleshooting
LOG_LEVEL=warn    # Suppress info logs in high-traffic environments
```

Default: `info` in production, `debug` in development.

### Log Files (Production)

| File | Contents |
|---|---|
| `server/logs/combined.log` | All logs at INFO and above |
| `server/logs/error.log` | ERROR level only |

> [!TIP]
> In production, ship logs from these files to a log aggregator (Datadog, CloudWatch, Loki) instead of relying on the filesystem.

---

## 6. Audit Event Catalog

Every audit event is a structured log entry with `event` as the primary field.

### Authentication Events

| Event | Level | Trigger | Key Fields |
|---|---|---|---|
| `AUTH_FAILURE` | `warn` | Any authentication rejection | `reason`, `ip`, `requestId` |
| `LOGIN_SUCCESS` | `info` | Successful password login | `userId`, `email`, `role`, `ip` |
| `LOGIN_FAILURE` | `warn` | Login attempt rejected | `email`, `reason`, `ip` |
| `REGISTER_SUCCESS` | `info` | New user created | `userId`, `email`, `role` |
| `LOGOUT` | `info` | Session terminated | `userId` |
| `PASSWORD_RESET_REQUESTED` | `info` | Forgot-password submitted | `email`, `ip` |
| `EMAIL_VERIFIED` | `info` | Email verification completed | `userId` |

### Authorization Events

| Event | Level | Trigger | Key Fields |
|---|---|---|---|
| `AUTHZ_DENIED` | `warn` | Role check failed | `userId`, `userRole`, `requiredRoles`, `url` |
| `AUTHZ_DENIED` | `warn` | Email not verified | `userId`, `email`, `url` |

### Admin Action Events

| Event | Level | Trigger | Key Fields |
|---|---|---|---|
| `ADMIN_USER_STATUS_CHANGE` | `info` | User enabled/disabled/role-changed | `actorId`, `targetUserId`, `changes`, `ip` |
| `ADMIN_COMPANY_VERIFY` | `info` | Company verified/rejected | `actorId`, `companyId`, `changes`, `ip` |
| `ADMIN_INTERNSHIP_STATUS_CHANGE` | `info` | Internship published/suspended | `actorId`, `internshipId`, `changes` |
| `ADMIN_INTERNSHIP_DELETE` | `info` | Internship permanently deleted | `actorId`, `internshipId`, `ip` |
| `ADMIN_BROADCAST_NOTIFICATION` | `info` | Mass notification sent | `actorId`, `type`, `recipientCount` |

### Database Events

| Event | Level | Trigger |
|---|---|---|
| `DB_ERROR` | `error` | MongoDB network/timeout/selection error |
| `INTERNAL_ERROR` | `error` | Unhandled exception in request handler |

---

## 7. Sensitive Field Exclusion

The `sanitize()` function in `server/src/utils/logger.js` recursively scans every object before logging and replaces the following keys with `[REDACTED]`:

| Key | Why excluded |
|---|---|
| `password` | User credentials |
| `newPassword` | Password change payload |
| `currentPassword` | Password change payload |
| `confirmPassword` | Registration payload |
| `token` | Generic token field |
| `accessToken` | JWT access token |
| `refreshToken` | JWT refresh token |
| `resetToken` | Password reset token |
| `verificationToken` | Email verification token |
| `secret` | API secrets |
| `apiKey` | Third-party API keys |
| `privateKey` | Cryptographic private keys |
| `authorization` | Authorization header value |
| `cookie` | Cookie header (may contain refresh token) |
| `set-cookie` | Set-Cookie response header |
| `creditCard` | PCI data |
| `cardNumber` | PCI data |
| `cvv` | PCI data |
| `ssn` | PII |

> [!CAUTION]
> Never add `logger.info(req.body)` or `logger.info(req.headers)` directly without passing through `sanitize()`. The HTTP logger middleware never logs request bodies for this reason.

> [!IMPORTANT]
> The frontend `parseApiError()` utility never logs or stores raw Axios error objects. Only extracted `{code, message, status, requestId}` are surfaced to the UI.

---

## 8. Frontend Error Handling

### GlobalErrorBoundary

**File:** `client/src/components/common/ErrorBoundary.jsx`

Class-based React Error Boundary that wraps the entire application. Catches unhandled render/lifecycle errors and shows `ErrorFallback` instead of a blank screen.

```jsx
// Already wired in App.jsx — no additional setup needed.
// To use on a specific subtree:
<GlobalErrorBoundary fallback={({ error, onReset }) => <MyFallback />}>
  <SensitiveComponent />
</GlobalErrorBoundary>
```

**In development:** shows error name and message in a debug panel.  
**In production:** shows only "Something went wrong" with reload/home actions. No stack traces.

### parseApiError()

**File:** `client/src/utils/apiError.js`

Converts any Axios error into a typed `ParsedApiError` object:

```js
import { parseApiError } from '../utils/apiError.js';

try {
  const data = await apiClient.post('/auth/login', credentials);
} catch (error) {
  // error is already a ParsedApiError (Axios interceptor pre-processes it)
  // { code, message, status, requestId, errors[], isNetwork, isRetryable }
  toast.error(error.message);

  if (error.isRetryable) {
    // Schedule retry
  }

  if (error.code === 'VALIDATION_ERROR') {
    setFieldErrors(error.errors);
  }
}
```

### NetworkStatusBanner

**File:** `client/src/components/common/NetworkStatusBanner.jsx`

Listens to `window.online`/`window.offline` and the Redux `network` slice. Shows an amber sticky banner when the client is offline. Auto-dismisses when connectivity is restored.

### Redux networkSlice

**File:** `client/src/store/networkSlice.js`

```js
import { selectIsOnline } from '../store/networkSlice.js';

// In a component:
const isOnline = useSelector(selectIsOnline);

// Disable submit button when offline:
<button disabled={!isOnline}>Submit Application</button>
```

---

## 9. Database Error Handling

Mongoose errors are classified by the error middleware before any response is sent:

| Error | Mapped To | Code |
|---|---|---|
| `CastError` (invalid ObjectId) | 400 | `BAD_REQUEST` |
| `MongoError` code 11000 (duplicate key) | 409 | `CONFLICT` |
| `ValidationError` | 400 | `VALIDATION_ERROR` |
| `MongoNetworkError` | 503 | `DB_UNAVAILABLE` |
| `MongoServerSelectionError` | 503 | `DB_UNAVAILABLE` |
| `MongoTimeoutError` | 503 | `DB_UNAVAILABLE` |

DB connectivity errors are also logged at `error` level with the `DB_ERROR` event before the response is sent.

Mongoose connection events (connected, error, disconnected, reconnected) are structured and logged by `config/db.js`.

---

## 10. Future Monitoring Recommendations

### High Priority

- [ ] **Error Monitoring Service (Sentry / Datadog APM)**  
  Integrate Sentry in both client and server. Replace the `// reportError()` comment in `ErrorBoundary.jsx` with `Sentry.captureException(error)`. Provides stack traces, user context, and error frequency dashboards without exposing stacks to end users.

- [ ] **Log Aggregation (Datadog Logs / AWS CloudWatch / Grafana Loki)**  
  Ship `logs/combined.log` and `logs/error.log` to a cloud aggregator. Create alerts on:
  - `level: error` — any server error
  - `event: AUTH_FAILURE` rate > 10/minute per IP (brute force detection)
  - `event: DB_ERROR` — database connectivity issues
  - `responseTimeMs > 2000` — slow request detection

- [ ] **Health Check Enhancement**  
  Add `responseTimeMs` and structured fields to the `/api/v1/health` endpoint response for uptime monitoring services (Better Uptime, Pingdom).

### Medium Priority

- [ ] **Distributed Tracing (OpenTelemetry)**  
  Instrument Express with `@opentelemetry/sdk-node` and propagate `traceparent` headers for distributed tracing across microservices.

- [ ] **Real User Monitoring (web-vitals)**  
  Integrate the `web-vitals` package to capture real-user CWV (LCP, CLS, INP) and send to an analytics endpoint.

- [ ] **Rate Limit Monitoring**  
  Add an `event: RATE_LIMIT_TRIGGERED` log when `express-rate-limit` blocks a request. Currently the limiter sends a JSON response directly without going through the error handler.

### Low Priority

- [ ] **Request Body Size Logging**  
  Add `req.headers['content-length']` to HTTP log entries to detect unexpectedly large payloads.

- [ ] **Correlation ID Propagation**  
  If outbound HTTP calls are added (e.g., to external APIs), propagate `X-Request-Id` in those requests so traces span multiple services.
