# InternHub — Production Security Specification & Controls

> **Last updated:** 2026-08-24  
> **Security Baseline:** OWASP Top 10 & CIS Node.js Benchmark Compliant

---

## Table of Contents

1. [Security Architecture & Threat Model](#1-security-architecture--threat-model)
2. [Authentication & Session Security](#2-authentication--session-security)
3. [Authorization & RBAC Enforcement](#3-authorization--rbac-enforcement)
4. [Input Validation & Injection Defense](#4-input-validation--injection-defense)
5. [Rate Limiting & DoS Protection](#5-rate-limiting--dos-protection)
6. [HTTP Security Headers (Helmet CSP)](#6-http-security-headers-helmet-csp)
7. [CORS Policy](#7-cors-policy)
8. [File Upload Security](#8-file-upload-security)
9. [Sensitive Data & Log Sanitization](#9-sensitive-data--log-sanitization)
10. [Audit Logging & Forensics](#10-audit-logging--forensics)

---

## 1. Security Architecture & Threat Model

InternHub employs defense-in-depth security principles across all architectural tiers:

| Layer | Threat Mitigated | Security Control |
|---|---|---|
| **Network & Edge** | DDoS, brute-force, open CORS | `express-rate-limit`, strict CORS whitelist, IP tracking |
| **Transport** | Man-in-the-Middle, packet sniffing | Strict HTTPS enforcement, TLS 1.3, `SameSite=Strict` cookies |
| **Authentication** | Credential stuffing, token replay | Dual JWT architecture, bcrypt hashing (work factor 12), token rotation |
| **Authorization** | Broken Access Control, IDOR | Role-based middleware (`requireRole`), document-level ownership checks |
| **Input / Execution** | NoSQL Injection, XSS, malformed payloads | Joi schema validation, Mongoose typed casting, strict JSON parsing |
| **File Storage** | Malware upload, remote code execution | In-memory Multer processing, MIME/extension whitelisting, Cloudinary storage |
| **Observability** | Sensitive credential leakage | Automated recursive key scrubbing (`sanitize()`), zero-stack prod responses |

---

## 2. Authentication & Session Security

### Password Hashing
- **Algorithm:** `bcryptjs` with salt rounds = **12**
- **Pre-save Trigger:** Passwords hashed only when `isModified('passwordHash') === true`
- **Projection Exclusions:** `passwordHash`, `verificationToken`, and `refreshToken` are configured with `select: false` in Mongoose to prevent accidental exposure in query results.

### Dual-Token JWT Design
- **Access Tokens:** Signed with `HS256` using `JWT_ACCESS_SECRET` (min 64 hex characters). 15-minute lifespan. Stored in client memory.
- **Refresh Tokens:** Signed with `JWT_REFRESH_SECRET`. 7-day lifespan. Stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
- **Token Invalidation:** Stored in MongoDB on the User document. Explicit logout (`POST /auth/logout`) and password change operations invalidate the token server-side immediately.

---

## 3. Authorization & RBAC Enforcement

### Role-Based Access Matrix
```
Endpoint Category          STUDENT    RECRUITER    ADMIN    SUPER_ADMIN
Public Discovery              ✓           ✓          ✓           ✓
Apply to Internship           ✓           ✗          ✗           ✗
Student Profile & Resume      ✓           ✗          ✗           ✗
Post / Edit Internships       ✗           ✓          ✓           ✓
Review Applications           ✗           ✓          ✓           ✓
Schedule Interviews           ✗           ✓          ✓           ✓
Platform Moderation / Metrics ✗           ✗          ✓           ✓
User Account Deactivation     ✗           ✗          ✓           ✓
System Administration         ✗           ✗          ✗           ✓
```

### IDOR (Insecure Direct Object Reference) Safeguards
Controllers verify document ownership before performing read or write operations:
- A recruiter can only view applications submitted to internships belonging to their company.
- A student can only view or withdraw their own applications.
- Users can only delete or access their own documents.

---

## 4. Input Validation & Injection Defense

### Joi Request Validation
Every mutating route (`POST`, `PUT`, `PATCH`, `DELETE`) is guarded by a Joi schema validator. Requests containing unexpected fields or malformed data are rejected with `400 VALIDATION_ERROR` before reaching business services:
- String length constraints (min/max)
- Strict regex validation on emails, URLs, and phone numbers
- Enum enforcement on role, status, remote preference, and category fields

### NoSQL Injection Defense
- Mongoose ODM enforces strict schema casting.
- Express parses request bodies strictly as JSON objects, neutralizing operator injection attacks (e.g. `{"$gt": ""}`).

---

## 5. Rate Limiting & DoS Protection

Implemented via `express-rate-limit`:

| Route / Scope | Rate Limit | Window | Action on Exceeded |
|---|---|---|---|
| Global API Gateway | 100 requests | 15 minutes | Returns 429 Too Many Requests |
| `/api/v1/auth/login`, `/register` | 10 requests | 15 minutes | Returns 429 Too Many Requests |
| `/api/v1/auth/forgot-password` | 5 requests | 15 minutes | Returns 429 Too Many Requests |

---

## 6. HTTP Security Headers (Helmet CSP)

The application uses `helmet()` middleware to enforce security headers:
- `Content-Security-Policy (CSP)`: Restricts script, style, and media origins
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing exploits
- `X-Frame-Options: SAMEORIGIN`: Prevents Clickjacking
- `Strict-Transport-Security (HSTS)`: Enforces HTTPS connections
- `X-DNS-Prefetch-Control: off`: Disables browser DNS prefetching

---

## 7. CORS Policy

CORS is strictly controlled via whitelist configuration in `server/src/app.js`:

```javascript
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS: Origin not permitted by security policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Client-Version'],
}));
```

---

## 8. File Upload Security

1. **In-Memory Buffer Processing:** Files are processed exclusively in RAM (`multer.memoryStorage()`) and streamed directly to Cloudinary. Zero temporary files are written to server local disks.
2. **File Size Caps:**
   - Resumes & Documents: **5MB** max
   - Avatars & Logos: **2MB** max
3. **MIME & Extension Whitelisting:**
   - Resumes: `application/pdf` (`.pdf` only)
   - Images: `image/jpeg`, `image/png`, `image/webp`
4. **Dangerous File Extension Blocking:** Executable extensions (`.exe`, `.sh`, `.bat`, `.js`, `.py`, `.php`, `.vbs`) are hard-blocked.
5. **Path Traversal Sanitization:** Original filenames are sanitized to strip `../`, `..\`, null bytes, and non-alphanumeric characters.

---

## 9. Sensitive Data & Log Sanitization

The `sanitize()` utility recursively scrubs sensitive keys from all logs, audit payloads, and error outputs:

**Redacted Keys:**
`password`, `newPassword`, `currentPassword`, `confirmPassword`, `token`, `accessToken`, `refreshToken`, `resetToken`, `verificationToken`, `secret`, `apiKey`, `privateKey`, `authorization`, `cookie`, `set-cookie`, `creditCard`, `cvv`, `ssn`.

**Production Error Safety:**
- Stack traces are **never** included in API error responses in production (`NODE_ENV === 'production'`).
- Generic internal error messages (`An unexpected error occurred.`) are returned for unexpected exceptions while detailed forensic context is logged server-side only.

---

## 10. Audit Logging & Forensics

Critical state-modifying actions write permanent, structured entries to MongoDB `auditLogs` collection:
- `USER_LOGIN_SUCCESS`, `USER_LOGIN_FAILURE`
- `USER_STATUS_CHANGE`, `USER_ROLE_CHANGE`
- `COMPANY_VERIFIED`, `COMPANY_REJECTED`
- `INTERNSHIP_PUBLISHED`, `INTERNSHIP_DELETED`
- `APPLICATION_STATUS_UPDATED`
- `ADMIN_BROADCAST_SENT`

Each audit log captures: `userId`, `action`, `resource`, `resourceId`, `changes`, `ipAddress`, `userAgent`, and `createdAt`.
