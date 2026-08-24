# InternHub Architecture & Codebase Audit Report

**Date:** 2026-08-24  
**Auditor:** Principal Software Architect & Senior Engineering Team  
**Scope:** Full-Stack Repository (`/backend`, `/frontend`, `/database`, `/docs`)  
**Target:** Transform InternHub Internship Discovery System into a Production-Grade, Real-Data, Continuously Synchronized Platform (Naukri/Internshala/Unstop Class Architecture).

---

## 1. Executive Summary

InternHub is structured as a full-stack JavaScript/Node.js monorepo with an Express REST API backend and a Vite + React 19 frontend styled with Tailwind CSS. The platform contains extensive role-based UI flows for Students, Recruiters, and Admins.

However, the current internship discovery system operates primarily as a **static prototype with synthetic/mock data**:
- Hardcoded 135KB static dataset files (`realInternshipsData.js` in backend, `realInternships.js` in frontend) generate pseudo-randomized salaries, application counts, and artificial deadlines via `Math.random()`.
- Client-side direct fetching from public endpoints (`Arbeitnow`, `Jobicy`) occurs directly in the browser (`liveJobsService.js`), violating backend aggregation and rate-limiting principles.
- Fallback in-memory query routines bypass MongoDB when the database is empty or unavailable.
- No automated source connector architecture, data provenance tracking, cryptographic deduplication, freshness lifecycle states (`LIVE`, `RECENT`, `STALE`, `EXPIRED`, `REMOVED`), or Server-Sent Events (SSE) stream exist.

This audit document details the existing implementation across all subsystems and outlines the architectural blueprint and migration strategy to elevate InternHub to an enterprise-grade discovery platform.

---

## 2. Existing Technology Stack

| Layer | Technologies / Libraries | Purpose |
|---|---|---|
| **Monorepo / Scripts** | npm workspaces / `concurrently` | Orchestrates dev/build/test scripts across backend & frontend |
| **Backend Framework** | Node.js (ESM), Express.js v4.19 | REST API endpoints, routing, controllers |
| **Database** | MongoDB Atlas / Local MongoDB, Mongoose v8.6 | Persistent document store, schema models, query pipelines |
| **Security & Middleware**| Helmet, express-rate-limit, cors, cookie-parser | HTTP headers, CORS whitelisting, IP rate limiting |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs` | Access (15m) + Refresh (7d) tokens, cookie/header transport |
| **Validation** | Joi v17.13 | Input schema validation on query params and request bodies |
| **Logging** | Winston v3.14, custom request ID middleware | Structured JSON logging with `X-Request-Id` correlation |
| **Frontend Framework** | React v19.2, Vite v6.0 | Single-page application, code-splitting (`React.lazy`) |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit` v2.2), React-Redux | Centralized store (`authSlice`, `internshipSlice`, `adminSlice`, etc.) |
| **Styling & Icons** | Tailwind CSS v3.4, `lucide-react`, `framer-motion` | Light-theme UI design system, modern micro-animations |
| **Routing** | React Router v6.26 | Declarative client routing with `ProtectedRoute` guards |
| **Testing** | Jest v29 (backend), Vitest v2.1 + Testing Library (frontend) | Unit and integration test suites |

---

## 3. Existing Routes & Navigation

### 3.1 Backend REST API Endpoints (`/api/v1`)

```
/api/v1
├── /health              GET    -> API & DB connection health check
├── /auth
│   ├── /register        POST   -> User registration
│   ├── /login           POST   -> User authentication (returns tokens)
│   ├── /refresh-token   POST   -> Exchange refresh token for new access token
│   ├── /logout          POST   -> Invalidate session
│   ├── /me              GET    -> Get authenticated profile
│   ├── /forgot-password POST   -> Issue password reset token
│   ├── /reset-password  POST   -> Reset password with token
│   └── /verify-email    POST   -> Verify account email
├── /internships
│   ├── /                GET    -> Discovery list (search, filter, paginate)
│   ├── /saved           GET    -> Authenticated student saved bookmarks
│   ├── /:id             GET    -> Single internship details (by ID or slug)
│   └── /:id/save        POST   -> Toggle saved bookmark
├── /students
│   ├── /profile         GET/PUT-> Student profile management
│   └── /resume          POST   -> Upload & parse student resume
├── /recruiter
│   ├── /dashboard       GET    -> Recruiter stats
│   ├── /internships     GET/POST -> Manage company internship postings
│   ├── /internships/:id PUT/DELETE -> Edit / archive posting
│   └── /company         GET/PUT-> Recruiter company profile
├── /applications
│   ├── /                GET/POST -> Student & Recruiter application lifecycle
│   └── /:id             GET/PATCH -> Application status transitions & recruiter notes
├── /interviews
│   ├── /                GET/POST -> Interview scheduling & candidate invites
│   └── /:id             GET/PATCH -> Update interview schedule/feedback
├── /notifications
│   ├── /                GET    -> Fetch notifications
│   └── /:id/read        PATCH  -> Mark notification as read
├── /upload              POST   -> Multi-part file upload (resumes, logos)
└── /admin
    ├── /metrics         GET    -> Platform KPIs & counts
    ├── /users           GET    -> User administration & ban/unban
    ├── /companies       GET/PATCH -> Company verification & audit
    ├── /internships     GET/PATCH/DELETE -> Global internship moderation
    ├── /applications    GET    -> Global application ledger
    ├── /audit-logs      GET    -> System security audit trail
    └── /broadcast       POST   -> System-wide broadcast alerts
```

### 3.2 Frontend Route Map

| Path | Component | Access | Description |
|---|---|---|---|
| `/` | `LandingPage.jsx` | Public | Hero landing, feature showcase, value proposition |
| `/internships` | `InternshipsPage.jsx` | Public | Main internship discovery engine (search, filter, drawer, split view) |
| `/internships/:id` | `InternshipDetailPage.jsx` | Public | Full-page detail view with requirements, company info & apply CTA |
| `/companies` | `CompaniesPage.jsx` | Public | Company directory & search |
| `/companies/:id` | `CompanyDetailPage.jsx` | Public | Company profile, culture & active openings |
| `/saved-internships` | *Pending routing* | Student | Dedicated saved internships management view |
| `/login`, `/register` | `LoginPage`, `RegisterPage` | Public | Authentication portals |
| `/student/*` | Student Portal | Student | Dashboard, Profile, Applications, Interviews, Resume, Settings |
| `/recruiter/*` | Recruiter Portal | Recruiter | Dashboard, Postings, Applications, Candidate Review, Company Profile |
| `/admin/*` | `AdminDashboard.jsx` | Admin | Dashboard overview, moderation & platform analytics |

---

## 4. Existing Database Models

The MongoDB schema currently includes 10 models in `backend/src/models/`:

1. **`User.model.js`**: Core identity (email, password hash, role: `STUDENT` / `RECRUITER` / `ADMIN` / `SUPER_ADMIN`, verification tokens).
2. **`StudentProfile.model.js`**: Education, graduation year, degree, branch, skills, experience, portfolio links, resume metadata.
3. **`Company.model.js`**: Name, slug, logo, description, website, industry, location, companySize, foundedYear, verification status (`verified: boolean`).
4. **`Internship.model.js`**: Company reference (`companyId`), title, slug, description, responsibilities, requirements, skills, location (city, state, country), remote mode (`REMOTE`, `HYBRID`, `ONSITE`), type (`FULL_TIME`, `PART_TIME`), duration, stipend (`amount`, `currency`, `period`, `isUnpaid`), openings, applicationDeadline, status (`DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`), category, viewsCount, applicationsCount, createdBy.
5. **`Application.model.js`**: `studentId`, `internshipId`, `companyId`, `resume`, `coverLetter`, `status` (`APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`, `WITHDRAWN`), timeline audit history, recruiter notes. Unique compound index `{ internshipId: 1, studentId: 1 }`.
6. **`SavedInternship.model.js`**: `studentId`, `internshipId`, timestamps. Unique compound index `{ studentId: 1, internshipId: 1 }`.
7. **`Interview.model.js`**: Application, student, company references, scheduledAt, meetingLink, interviewer info, status.
8. **`Notification.model.js`**: User notification channel, type, message, read state.
9. **`AuditLog.model.js`**: System audit trail (action, actor, target entity, IP, metadata).
10. **`Document.model.js`**: Uploaded file assets and resume references.

---

## 5. Identification of Fake / Static / Client-Side Mock Data

During our code audit, we identified several sources of fake data:

1. **`backend/src/data/realInternshipsData.js` (135 KB)**:
   - Contains 72 hardcoded JavaScript objects with fabricated IDs (`real_intern_google_ai_001`, etc.), mocked descriptions, and placeholder company references.
2. **`frontend/src/features/internships/data/realInternships.js` (135 KB)**:
   - Contains identical static data and dynamic simulation functions (`getDynamicRealInternships`) that dynamically roll dates forward and synthesize random stipend numbers using `Math.random()`.
3. **`frontend/src/services/liveJobsService.js`**:
   - Executes direct client-side `fetch()` requests from the user's browser to `arbeitnow.com` and `jobicy.com`.
   - Synthesizes random stipend amounts: `amount: Math.floor(Math.random() * 3000) + 6500` ($6,500 - $9,500/mo).
   - Generates random openings, random views count (`Math.random() * 800 + 200`), and random application count (`Math.random() * 30 + 5`).
4. **`backend/src/services/internship.service.js`**:
   - Contains `queryRealInternshipsInMemory()`, falling back to `REAL_INTERNSHIPS` array when MongoDB has 0 items or is disconnected.
5. **`frontend/src/features/internships/internshipSlice.js`**:
   - Merges client-side live jobs and local mock lists when API responses are empty.

---

## 6. Problems Discovered & Gap Analysis

| # | Domain | Problem Identified | Impact |
|---|---|---|---|
| 1 | **Data Integrity** | Fake stipends, fake views, fake application counts generated via `Math.random()` | Misleads students, destroys platform credibility |
| 2 | **Architecture** | External API feeds fetched directly from the browser | Violates API rate limits, exposes client IP, causes CORS issues, lacks central deduplication |
| 3 | **Database Schema** | Current `Internship` schema lacks external tracking fields: `externalId`, `source`, `sourceType`, `sourceUrl`, `canonicalUrl`, `lastVerifiedAt`, `verificationStatus`, `fingerprint`, `sources[]` | Cannot synchronize multi-source feeds or audit provenance |
| 4 | **Deduplication** | No deterministic fingerprinting hash (`sha256`) across company name, title, location, and application URL | Multiple connectors posting the same job will create duplicate listings |
| 5 | **Freshness Lifecycle** | No automated expiration or freshness states (`LIVE`, `RECENT`, `STALE`, `EXPIRED`, `REMOVED`) | Expired jobs remain active indefinitely unless manually closed |
| 6 | **Background Workers** | No backend ingestion pipeline, cron scheduler, or rate-limited connector orchestrator | Cannot synchronize data 24/7 or maintain freshness |
| 7 | **Real-Time Streaming** | Frontend has no Server-Sent Events (SSE) or WebSocket connection for live job updates | Users must manually refresh to see newly ingested opportunities |
| 8 | **Admin Ingestion Ops** | Admin dashboard lacks source health monitoring, sync job history, manual sync triggers, and duplicate inspector | Admins cannot observe or control data feeds |
| 9 | **Database Resilience** | Local MongoDB failure causes fallback to synthetic data rather than proper dev seeding and error handling | Conceals connection issues and prevents database-first verification |

---

## 7. Recommended Target Architecture

```
                                  ┌────────────────────────┐
                                  │   Authorized Sources   │
                                  │  (APIs, ATS, RSS/Atom, │
                                  │   Recruiter Postings)  │
                                  └───────────┬────────────┘
                                              │
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND INGESTION PIPELINE                              │
│                                                                                        │
│  ┌──────────────────────┐    ┌─────────────────────┐    ┌───────────────────────────┐  │
│  │ Base Connector Engine│───>│ Validation & Sanitize│───>│ Normalization & Enrichment│  │
│  └──────────────────────┘    └─────────────────────┘    └─────────────┬─────────────┘  │
│                                                                       │                │
│  ┌──────────────────────┐    ┌─────────────────────┐                  ▼                │
│  │ SyncJob Audit Ledger │<───│  Upsert & Indexing  │<───┌───────────────────────────┐  │
│  └──────────────────────┘    └──────────┬──────────┘    │ SHA-256 Deduplication     │  │
│                                         │               │ & Provenance Consolidation│  │
│                                         ▼               └───────────────────────────┘  │
│                              ┌─────────────────────┐                                   │
│                              │ Event Stream Emitter│───> [ Server-Sent Events (SSE) ]  │
│                              └─────────────────────┘                     │             │
└─────────────────────────────────────────┬────────────────────────────────┼─────────────┘
                                          │                                │
                                          ▼                                ▼
                              ┌───────────────────────┐       ┌────────────────────────┐
                              │  MongoDB Atlas Store  │       │  Frontend React App    │
                              │  (Indexes + Search)   │       │  (/internships, SSE,   │
                              │                       │       │   Filters, Live Badge) │
                              └───────────────────────┘       └────────────────────────┘
```

---

## 8. Recommended Migration Strategy

1. **Step 1: Database Model & Indexes Enhancement**
   - Enhance `Internship.model.js` with full production fields: `source`, `sourceType` (`INTERNAL`, `API`, `ATS`, `FEED`, `EMPLOYER`), `externalId`, `sourceUrl`, `canonicalUrl`, `fingerprint`, `sources[]`, `freshnessState` (`LIVE`, `RECENT`, `STALE`, `EXPIRED`, `REMOVED`), `lastVerifiedAt`, `eligibility`, `salaryMin`, `salaryMax`, `currency`.
   - Create `SyncJob.model.js` for full audit trails of ingestion runs.
   - Build composite indexes for fast query resolution and text search.

2. **Step 2: Backend Connector Framework (`/connectors`)**
   - Implement `JobSourceConnector` abstract base class with error isolation, rate limiting, and circuit breaker.
   - Implement authorized connectors:
     - `ArbeitnowConnector` (API)
     - `JobicyConnector` (API)
     - `InternalEmployerConnector` (Employer postings)
     - `GreenhousePublicConnector` & `LeverPublicConnector` (ATS career endpoints where permitted)
   - Implement `SourceRegistry` to manage intervals, status, and health metrics.

3. **Step 3: Ingestion, Deduplication & Freshness Pipeline**
   - Implement `IngestionService` (Fetch -> Validate -> Normalize -> Sanitize -> Deduplicate with SHA-256 -> Upsert -> Audit SyncJob).
   - Implement `FreshnessService` & `DeadlineWorker` to transition expired/stale records.
   - Implement `SchedulerService` running configurable intervals with exponential backoff.

4. **Step 4: Real-Time Server-Sent Events (SSE) Hub**
   - Implement `/api/v1/internships/stream` SSE endpoint with client broadcast.
   - Emit `internship.created`, `internship.updated`, `internship.expired`, `internship.sync_completed`.

5. **Step 5: Discovery API Modernization**
   - Refactor `/api/v1/internships` to query MongoDB directly with complete support for search, filters (location, mode, category, skills, stipend, duration, experience, date posted), sorting, pagination, and real `lastSyncedAt` timestamps.
   - Remove all synthetic random fallback data from `internship.service.js`.

6. **Step 6: Frontend State & Discovery Page Redesign**
   - Remove client-side fake generators and external API calls.
   - Connect Redux slice directly to `/api/v1/internships`.
   - Integrate SSE stream listener with toast notification: *"X new internships available — [View new internships]"*.
   - Update `InternshipCard` and `InternshipDetailPage` to display authentic data, source provenance badges (e.g., `Arbeitnow API`, `InternHub Verified`, `Company Careers`), last verified relative timestamps, and clean light-theme UI.
   - Add `/saved-internships` student bookmarks route.

7. **Step 7: Admin Ingestion & Source Health Hub**
   - Add `/admin/sources`, `/admin/sync-jobs`, `/admin/duplicates` management views.
   - Provide real-time sync trigger and source toggle controls.

8. **Step 8: Development Database Seeder & Documentation**
   - Provide `npm run seed` flagged strictly with `environment = development`.
   - Generate complete documentation in `/docs` (`ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `DATA-SOURCES.md`, `INGESTION.md`, `REALTIME.md`, `SECURITY.md`, `DEPLOYMENT.md`, `MONITORING.md`, `TESTING.md`).
   - Run tests and linting to ensure 100% test passing and zero regressions.

---

**Approval:** Proceed to Implementation Plan review and stage-by-stage execution.
