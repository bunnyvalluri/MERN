# InternHub — Project Architecture

> **Version:** 1.0.0  
> **Last Updated:** 2026-08-23  
> **Status:** Approved for Implementation

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Data Architecture & Models](#3-data-architecture--models)
4. [API Architecture](#4-api-architecture)
5. [Authentication & Authorization Flow](#5-authentication--authorization-flow)
6. [Frontend Architecture](#6-frontend-architecture)
7. [State Management Architecture](#7-state-management-architecture)
8. [Role-Based Access Control Matrix](#8-role-based-access-control-matrix)
9. [Module Dependency Map](#9-module-dependency-map)
10. [Error Handling Strategy](#10-error-handling-strategy)
11. [Security Architecture](#11-security-architecture)

---

## 1. System Overview

InternHub is a **multi-role SaaS platform** serving four distinct user types:

| Role | Description |
|---|---|
| **STUDENT** | Discover internships, build profiles, apply, track applications |
| **RECRUITER** | Post internships, manage candidates, schedule interviews |
| **ADMIN** | Moderate platform content, manage users, view analytics |
| **SUPER_ADMIN** | Full system access including admin management and audit logs |

### High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                    INTERNHUB PLATFORM                │
│                                                      │
│  ┌────────────────┐      ┌────────────────────────┐  │
│  │  React Client  │◄────►│  Express REST API       │  │
│  │  (Vite + RTK)  │      │  (Node.js + Express)   │  │
│  └────────────────┘      └──────────┬─────────────┘  │
│          ▲                          │                 │
│          │ HTTPS / REST             │ Mongoose ODM    │
│          │                          ▼                 │
│  ┌───────┴────────┐      ┌────────────────────────┐  │
│  │  Cloudinary    │      │   MongoDB Atlas         │  │
│  │  File Storage  │      │   (Cloud Database)      │  │
│  └────────────────┘      └────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 2. Monorepo Structure

```
internhub/                         # Monorepo root
├── client/                        # React + Vite frontend
├── server/                        # Express.js backend
├── docs/                          # Architecture & planning docs
│   ├── PROJECT_ARCHITECTURE.md    # This file
│   ├── DEVELOPMENT_PLAN.md        # Phased implementation plan
│   └── TECH_STACK.md              # Technology decisions
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Lint + test on push
│       └── deploy.yml             # Deploy on merge to main
└── README.md
```

---

## 3. Data Architecture & Models

### 3.1 Entity Relationship Overview

```
User (1) ──────────── (1) StudentProfile
User (1) ──────────── (1) RecruiterProfile
RecruiterProfile (1) ─ (M) Internship
RecruiterProfile (1) ─ (M) Company
Company (1) ────────── (M) Internship
Internship (1) ──────── (M) Application
Student (1) ─────────── (M) Application
Student (1) ─────────── (M) SavedInternship
Application (1) ──────── (M) Interview
User (1) ─────────────── (M) Notification
User (1) ─────────────── (M) AuditLog (via actions)
```

### 3.2 Core Models

#### User
```js
{
  _id, email, passwordHash, role, isEmailVerified,
  isActive, lastLogin, createdAt, updatedAt
}
```

#### StudentProfile
```js
{
  _id, userId (ref: User), firstName, lastName, avatar,
  phone, bio, university, degree, graduationYear, GPA,
  skills: [String], resumeUrl, linkedinUrl, portfolioUrl,
  preferredLocations: [String], preferredRoles: [String],
  experience: [{ title, company, duration, description }],
  education: [{ institution, degree, year }],
  createdAt, updatedAt
}
```

#### RecruiterProfile
```js
{
  _id, userId (ref: User), firstName, lastName, avatar,
  phone, companyId (ref: Company), designation,
  linkedinUrl, isVerified, createdAt, updatedAt
}
```

#### Company
```js
{
  _id, name, logo, website, industry, size,
  description, headquarters, foundedYear,
  createdBy (ref: User), isVerified, isActive,
  createdAt, updatedAt
}
```

#### Internship
```js
{
  _id, title, companyId (ref: Company),
  recruiterId (ref: User), description, requirements,
  responsibilities, skills: [String], location, locationType,
  stipend: { amount, currency, isPaid },
  duration: { value, unit }, openings,
  applicationDeadline, startDate, status,
  category, tags: [String], applicationCount,
  views, createdAt, updatedAt
}
Indexes: { companyId, status }, { skills }, { location }, { category }
```

#### Application
```js
{
  _id, internshipId (ref: Internship),
  studentId (ref: User), coverLetter,
  resumeUrl, status, statusHistory: [{ status, note, changedAt }],
  appliedAt, updatedAt
}
Indexes: { internshipId, studentId } (unique), { studentId, status }
```

#### Interview
```js
{
  _id, applicationId (ref: Application),
  internshipId (ref: Internship), studentId (ref: User),
  scheduledAt, duration, type, meetingLink, notes,
  status, feedback: { rating, comment }, createdAt
}
```

#### Notification
```js
{
  _id, userId (ref: User), title, message,
  type, isRead, relatedEntity: { model, id }, createdAt
}
Index: { userId, isRead }
```

#### AuditLog
```js
{
  _id, actorId (ref: User), action, targetModel,
  targetId, metadata: {}, ipAddress, userAgent, createdAt
}
Index: { actorId }, { targetModel, targetId }
```

#### SavedInternship
```js
{
  _id, studentId (ref: User), internshipId (ref: Internship),
  savedAt
}
Index: { studentId, internshipId } (unique)
```

---

## 4. API Architecture

### 4.1 Base URL & Versioning

```
/api/v1/
```

### 4.2 Route Groups

| Route Prefix | Controller | Roles |
|---|---|---|
| `/api/v1/auth` | auth.controller | Public |
| `/api/v1/users` | user.controller | Authenticated |
| `/api/v1/students` | student.controller | STUDENT, ADMIN |
| `/api/v1/recruiters` | recruiter.controller | RECRUITER, ADMIN |
| `/api/v1/companies` | company.controller | RECRUITER, ADMIN |
| `/api/v1/internships` | internship.controller | All (read); RECRUITER (write) |
| `/api/v1/applications` | application.controller | STUDENT, RECRUITER |
| `/api/v1/interviews` | interview.controller | RECRUITER, STUDENT |
| `/api/v1/notifications` | notification.controller | Authenticated |
| `/api/v1/admin` | admin.controller | ADMIN, SUPER_ADMIN |
| `/api/v1/analytics` | analytics.controller | RECRUITER, ADMIN |
| `/api/v1/upload` | upload.controller | Authenticated |

### 4.3 Standardized API Response Format

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Internships fetched successfully",
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 250, "pages": 25 }
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [ { "field": "email", "message": "Invalid email format" } ]
}
```

### 4.4 Key Auth Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/verify-email/:token
GET    /api/v1/auth/me
```

### 4.5 Key Internship Endpoints

```
GET    /api/v1/internships              # List (public, paginated, filterable)
GET    /api/v1/internships/:id          # Detail (public)
POST   /api/v1/internships              # Create (RECRUITER)
PUT    /api/v1/internships/:id          # Update (RECRUITER, owner)
DELETE /api/v1/internships/:id          # Delete (RECRUITER, owner / ADMIN)
GET    /api/v1/internships/saved        # My saved (STUDENT)
POST   /api/v1/internships/:id/save     # Save/unsave (STUDENT)
```

### 4.6 Key Application Endpoints

```
POST   /api/v1/applications             # Apply (STUDENT)
GET    /api/v1/applications/mine        # My applications (STUDENT)
GET    /api/v1/applications/:id         # Detail
PATCH  /api/v1/applications/:id/status  # Update status (RECRUITER)
GET    /api/v1/internships/:id/applications  # List applicants (RECRUITER)
```

---

## 5. Authentication & Authorization Flow

### 5.1 Login Flow

```
Client                          Server                          MongoDB
  │──── POST /auth/login ──────►│                               │
  │     { email, password }     │──── find user by email ──────►│
  │                             │◄─── user document ────────────│
  │                             │── bcrypt.compare() ──────────►│
  │                             │── generateAccessToken() ──────│
  │                             │── generateRefreshToken() ─────│
  │◄─── 200 OK ─────────────────│
  │     accessToken (body)      │──── store refreshToken ───────►│
  │     refreshToken (cookie)   │
```

### 5.2 Token Refresh Flow

```
Client                          Server
  │──── POST /auth/refresh ────►│
  │     refreshToken (cookie)   │── verify refreshToken ────────│
  │                             │── issue new accessToken ───────│
  │◄─── 200 OK ─────────────────│
  │     newAccessToken (body)   │
```

### 5.3 RBAC Middleware Chain

```
Request → verifyToken → requireRole([...roles]) → controller → service
```

---

## 6. Frontend Architecture

### 6.1 Route Structure

```
/                          → Landing Page (public)
/auth/login                → Login
/auth/register             → Register
/auth/forgot-password      → Forgot Password
/auth/reset-password/:token→ Reset Password
/auth/verify-email/:token  → Email Verification

/student/                  → Student Layout
  dashboard                → Student Dashboard
  profile                  → Profile Editor
  internships              → Internship Discovery
  internships/:id          → Internship Detail
  saved                    → Saved Internships
  applications             → My Applications
  applications/:id         → Application Detail
  notifications            → Notifications
  settings                 → Account Settings

/recruiter/                → Recruiter Layout
  dashboard                → Recruiter Dashboard
  company                  → Company Profile
  internships              → Manage Postings
  internships/new          → Create Posting
  internships/:id/edit     → Edit Posting
  internships/:id/applicants → View Applicants
  applications/:id         → Application Detail
  interviews               → Interview Manager
  analytics                → Recruiter Analytics
  notifications            → Notifications
  settings                 → Settings

/admin/                    → Admin Layout (ADMIN, SUPER_ADMIN)
  dashboard                → Admin Dashboard
  users                    → User Management
  internships              → All Internships
  companies                → Company Management
  applications             → All Applications
  audit-logs               → Audit Logs
  analytics                → Platform Analytics
  settings                 → Platform Settings
```

### 6.2 Component Hierarchy

```
App
└── Router
    ├── PublicLayout
    │   ├── LandingPage
    │   ├── LoginPage
    │   └── RegisterPage
    ├── ProtectedRoute (role: STUDENT)
    │   └── StudentLayout (Sidebar + Topbar)
    │       └── [student/* pages]
    ├── ProtectedRoute (role: RECRUITER)
    │   └── RecruiterLayout (Sidebar + Topbar)
    │       └── [recruiter/* pages]
    └── ProtectedRoute (role: ADMIN | SUPER_ADMIN)
        └── AdminLayout (Sidebar + Topbar)
            └── [admin/* pages]
```

---

## 7. State Management Architecture

### 7.1 Redux Store Slices

```
store/
├── authSlice           # user, token, isAuthenticated, role
├── internshipsSlice    # list, filters, selectedInternship
├── applicationsSlice   # myApplications, selectedApplication
├── notificationsSlice  # list, unreadCount
├── uiSlice             # sidebar open/close, modals, loading
└── RTK Query APIs
    ├── authApi
    ├── internshipsApi
    ├── applicationsApi
    ├── studentsApi
    ├── recruitersApi
    ├── adminApi
    └── analyticsApi
```

### 7.2 RTK Query Caching Strategy

| Endpoint | Cache Time | Invalidation Trigger |
|---|---|---|
| `getInternships` | 5 min | internship create/update/delete |
| `getApplications` | 2 min | application status change |
| `getNotifications` | 1 min | new notification |
| `getProfile` | 10 min | profile update |

---

## 8. Role-Based Access Control Matrix

| Feature | STUDENT | RECRUITER | ADMIN | SUPER_ADMIN |
|---|:---:|:---:|:---:|:---:|
| View internships | ✅ | ✅ | ✅ | ✅ |
| Apply to internship | ✅ | ❌ | ❌ | ❌ |
| Save internship | ✅ | ❌ | ❌ | ❌ |
| Post internship | ❌ | ✅ | ❌ | ✅ |
| Manage own internships | ❌ | ✅ | ❌ | ✅ |
| Review applications | ❌ | ✅ | ✅ | ✅ |
| Schedule interviews | ❌ | ✅ | ❌ | ✅ |
| Manage company | ❌ | ✅ | ✅ | ✅ |
| View platform analytics | ❌ | ✅* | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |
| View audit logs | ❌ | ❌ | ✅ | ✅ |
| Manage admins | ❌ | ❌ | ❌ | ✅ |
| Platform settings | ❌ | ❌ | ✅ | ✅ |

*Recruiter sees only their own analytics

---

## 9. Module Dependency Map

```
Landing ─────────────────► Auth ──────────────────────► Profile Setup
                                                         │
                           Auth ──────────────────────► Dashboard (by role)
                                                         │
Student Dashboard ────────► Internship Discovery ───────► Internship Detail
                                                         │
Internship Detail ────────► Application Submit ─────────► Application Tracking
                                                         │
Recruiter Dashboard ──────► Internship Management ──────► Candidate Management
                                                         │
Candidate Management ─────► Interview Management ───────► Notifications
                                                         │
Admin Dashboard ──────────► User Management ────────────► Audit Logs
```

---

## 10. Error Handling Strategy

### Backend
1. All async controllers wrapped with `asyncHandler()` utility
2. Operational errors thrown as `new ApiError(statusCode, message)`
3. Global `error.middleware.js` catches all errors and returns standardized JSON
4. Mongoose validation errors mapped to 400 responses
5. JWT errors mapped to 401 responses
6. Unhandled rejections and uncaught exceptions logged and gracefully shut down

### Frontend
1. Axios interceptors catch 401 → trigger token refresh → retry
2. RTK Query `baseQuery` wraps errors in unified error shape
3. React Error Boundaries wrap all route pages
4. Toast notifications display user-facing error messages

---

## 11. Security Architecture

| Layer | Control |
|---|---|
| Transport | HTTPS only (enforced by platform) |
| Auth | JWT with short-lived access tokens |
| Session | Refresh tokens in HttpOnly cookies |
| CORS | Strict origin whitelist |
| Headers | Helmet (CSP, XSS, HSTS, etc.) |
| Rate Limiting | Per-IP throttling on auth routes |
| Input Validation | Joi on all write endpoints |
| File Uploads | MIME type allowlist; size limits; Cloudinary scanning |
| Passwords | bcryptjs (12 rounds) |
| Audit Trail | AuditLog model for all sensitive actions |
| Role Enforcement | Server-side RBAC; never trust client role claims |

---

*End of PROJECT_ARCHITECTURE.md*
