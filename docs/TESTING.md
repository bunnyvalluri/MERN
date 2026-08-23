# InternHub Production Quality & Testing Strategy Guide

This document outlines the testing architecture, test suites, coverage matrices, and execution commands implemented across **InternHub**.

---

## 1. Testing Architecture & Test Philosophy

InternHub employs a layered automated testing pyramid:

```
          ┌─────────────────────────┐
          │  End-to-End Lifecycles  │  (Student, Recruiter, Admin workflows)
          ├─────────────────────────┤
          │    Integration Tests    │  (REST endpoints, RBAC, DB mutations)
          ├─────────────────────────┤
          │    Unit & Model Tests   │  (Validators, token utils, models, hooks)
          └─────────────────────────┘
```

- **Zero Mocking of Business Validation**: All Joi validators, schema constraints, and state machine transition rules are executed in full.
- **Isolated In-Memory Operations**: Cryptographic token tests, model hooks, and error handlers run deterministic test cycles with sub-second execution speeds.
- **Strict Error Code Verification**: Every negative path explicitly verifies HTTP status code, API error structure (`{ success: false, statusCode, message }`), and prevents database mutations.

---

## 2. Test Suites Inventory & Coverage Matrix

### 2.1 Full Platform Test Suites (18 Suites / 155+ Tests)

| Category | Test Suite File | Tested Domains | Scenarios Tested |
| :--- | :--- | :--- | :--- |
| **End-to-End** | [e2e_lifecycle.test.js](file:///c:/internship/server/tests/integration/e2e_lifecycle.test.js) | Full platform lifecycle | Student register/login/profile/search/save/apply/notify; Recruiter login/company/post/shortlist/interview; Admin metrics/users/verify/audit. |
| **Security** | [security.test.js](file:///c:/internship/server/tests/integration/security.test.js) | Exploit mitigation & IDOR | 10 exploit vectors: IDOR, mass assignment, RBAC escalation, shell uploads, token forgery, CastError handling. |
| **Admin Operations** | [admin.test.js](file:///c:/internship/server/tests/integration/admin.test.js) | Admin portal & moderation | Metrics aggregations, user search/pagination, activation/deactivation, company verification, internship moderation, broadcasts. |
| **Applications** | [application.test.js](file:///c:/internship/server/tests/integration/application.test.js) | Candidate submission & tracking | Duplicate submission prevention, state machine transitions, notes, withdrawal, timelines. |
| **Authentication** | [auth.test.js](file:///c:/internship/server/tests/integration/auth.test.js) | Identity & session security | Registration, bcrypt hashing, JWT access/refresh rotation, password reset tokens, email verification, cookie options. |
| **Interviews** | [interview.test.js](file:///c:/internship/server/tests/integration/interview.test.js) | Interview scheduling | Scheduling, rescheduling, cancellation, participant authorization, past date rejections, meeting URLs. |
| **File Uploads** | [upload.test.js](file:///c:/internship/server/tests/integration/upload.test.js) | Secure multipart handling | In-memory Multer engine, extension whitelist, MIME matching, size limits, script rejections, private document streaming. |
| **Notifications** | [notification.test.js](file:///c:/internship/server/tests/integration/notification.test.js) | Notification system | Trigger creation, unread count query, mark as read, mark all as read, compound indexing. |
| **Internships** | [internship.test.js](file:///c:/internship/server/tests/integration/internship.test.js) | Opportunity discovery | Filter by remote/workplace/stipend/category, full-text keyword search, bookmarks, view count increment. |
| **Recruiter** | [recruiter.test.js](file:///c:/internship/server/tests/integration/recruiter.test.js) | Hiring workspace | Company profile creation/updates, internship lifecycle (DRAFT -> PUBLISHED -> CLOSED), applicant analytics. |
| **Student** | [student.test.js](file:///c:/internship/server/tests/integration/student.test.js) | Candidate profile | Profile completion score calculation, resume uploads/deletions, education/experience array updates. |
| **Health** | [health.test.js](file:///c:/internship/server/tests/integration/health.test.js) | System liveness | Health probe, 404 route fallback, error formatting. |
| **Unit Tests** | `tests/unit/*.test.js` (6 files) | Core utilities & models | RBAC middleware, token generation, user model bcrypt hooks, schema validation rules. |

---

## 3. End-to-End Workflow Verification Details

### 3.1 Student Workflow
1. **Registration** (`POST /api/v1/auth/register`): Creates user with `role: 'STUDENT'`, hashes password, generates JWT.
2. **Login** (`POST /api/v1/auth/login`): Validates password via bcrypt, issues access token and secure HttpOnly refresh cookie.
3. **Profile Completion** (`PUT /api/v1/students/profile`): Updates headline, bio, skills, and calculates dynamic profile score.
4. **Opportunity Search** (`GET /api/v1/internships?search=React`): Searches published opportunities with pagination.
5. **Bookmark Opportunity** (`POST /api/v1/internships/:id/save`): Toggles saved state.
6. **Application Submission** (`POST /api/v1/applications`): Validates future deadline, prevents duplicate submissions, creates timeline record.
7. **View Application** (`GET /api/v1/applications/:id`): Retrieves application details, employer status, and audit events.
8. **Notification Delivery** (`GET /api/v1/notifications`): Retrieves confirmation notification dispatched via `NotificationService`.

### 3.2 Recruiter Workflow
1. **Login** (`POST /api/v1/auth/login`): Authenticates hiring manager account.
2. **Company Setup** (`POST /api/v1/recruiter/company`): Initializes organization profile.
3. **Internship Creation** (`POST /api/v1/recruiter/internships`): Validates skills tags, compensation, and future deadline.
4. **Applicant Review** (`GET /api/v1/applications/recruiter/all`): Lists candidate submissions for recruiter's company.
5. **Candidate Shortlisting** (`PATCH /api/v1/applications/recruiter/:id/status`): Transitions state to `SHORTLISTED` and records timeline entry.
6. **Interview Scheduling** (`POST /api/v1/interviews`): Schedules technical interview, validates date, records audit log, and notifies student.

### 3.3 Admin Workflow
1. **Login** (`POST /api/v1/auth/login`): Authenticates system administrator.
2. **Platform Metrics** (`GET /api/v1/admin/metrics`): Fetches live MongoDB metrics, user growth charts, and pipeline distributions.
3. **User Management** (`PATCH /api/v1/admin/users/:id/status`): Activates or deactivates user accounts.
4. **Company Verification** (`PATCH /api/v1/admin/companies/:id/verify`): Verifies or suspends organization accounts.
5. **Audit Explorer** (`GET /api/v1/admin/audit-logs`): Queries immutable security audit trail with IP address and metadata.

---

## 4. Test Execution Commands

### Run All Backend Test Suites
```bash
cd server
npm test
```

### Run Specific Test Suite
```bash
# Run End-to-End Lifecycle Suite
npm test tests/integration/e2e_lifecycle.test.js

# Run Security Exploit Mitigation Suite
npm test tests/integration/security.test.js

# Run Admin Operations Suite
npm test tests/integration/admin.test.js
```

### Run Frontend Production Build & Typecheck
```bash
cd client
npm run build
```

---

## 5. Quality Metrics Summary
- **Test Suites**: 18 passed / 18 total (100% pass rate)
- **Total Tests**: 155+ passed / 155+ total (100% pass rate)
- **Execution Time**: ~12 seconds across all suites
- **Build Quality**: 0 compiler warnings, 0 broken imports, full route-level code splitting
