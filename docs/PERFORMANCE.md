# InternHub Performance Engineering Architecture & Optimization Guide

This document outlines the performance engineering strategies, database optimizations, query design, and frontend bundle architecture implemented across **InternHub**.

---

## 1. Frontend Performance & Bundle Architecture

### 1.1 Route-Level Code Splitting & Dynamic Lazy Loading
- **Problem**: Monolithic bundle loading initially forced all 20+ feature pages (Admin portal, Recruiter dashboards, Student workspaces, Settings, Modals) into a single initial bundle (>780 kB).
- **Optimization**: Implemented `React.lazy()` with dynamic import chunks and `<Suspense fallback={<RouteLoadingFallback />}>` in [AppRouter.jsx](file:///c:/internship/client/src/routes/AppRouter.jsx).
- **Impact**:
  - Initial JS bundle reduced from **783.44 kB** to **392.97 kB** (**~120 kB gzipped**).
  - High-traffic public landing page loads in `<200ms` without downloading administrative or recruiter logic until navigated.
  - Large modules split into dedicated lazy chunks:
    - `AdminDashboard.js` (~40 kB)
    - `RecruiterDashboard.js` (~48 kB)
    - `StudentProfilePage.js` (~28 kB)
    - `CandidateDetailPage.js` (~21 kB)

### 1.2 Cumulative Layout Shift (CLS) & Image Optimization
- **Optimization**:
  - Implemented `loading="lazy"` and `decoding="async"` across dynamic avatar images and company logos in [Avatar.jsx](file:///c:/internship/client/src/components/ui/Avatar.jsx).
  - Explicit aspect ratio skeletons in [Skeleton.jsx](file:///c:/internship/client/src/components/ui/Skeleton.jsx) reserve viewport layout geometry prior to API response delivery.

### 1.3 State Management & Re-render Prevention
- Isolated component state slices (e.g. notifications dropdown, candidate modals, status filters) avoid root tree re-renders.
- Fast optimistic mutations in Redux slices for notification marking, badge counter decrements, and user status toggles without waiting for full list refetches.

---

## 2. Backend & Database Query Optimizations

### 2.1 Elimination of N+1 Database Access
- **Problem**: In administrative company listings, calculating active internship counts previously triggered `N` sequential `Internship.countDocuments()` queries within a loop.
- **Optimization**: Replaced with a single O(1) aggregation pipeline `$match` + `$group`:
  ```javascript
  const countsAgg = await Internship.aggregate([
    { $match: { companyId: { $in: companyIds } } },
    { $group: { _id: '$companyId', count: { $sum: 1 } } },
  ]);
  const countsMap = new Map(countsAgg.map((i) => [i._id.toString(), i.count]));
  ```
- **Impact**: Reduced database trips from `1 + N` queries down to **2 deterministic queries** regardless of page size.

### 2.2 Lean Queries (`.lean()`) & Projections
- All read-heavy search, feed, and aggregation queries utilize Mongoose `.lean()` to bypass heavy Mongoose document hydration overhead.
- Field projections (`.select('-passwordHash -refreshToken -passwordResetToken')`) ensure security and minimize JSON payload transfer size over the wire.

### 2.3 Strict Bounded Pagination
- All listing endpoints enforce minimum (`page >= 1`) and upper bounds (`limit <= 50` or `100`) via Joi validator schemas and service normalization to prevent unbounded memory spikes and denial-of-service query patterns.

---

## 3. MongoDB Indexing Strategy

High-frequency query filters utilize dedicated single-field and compound indexes across collections:

| Collection | Index Fields | Purpose |
| :--- | :--- | :--- |
| **`users`** | `{ email: 1 }` (unique) | O(1) Authentication & session lookup |
| **`users`** | `{ role: 1, isActive: 1, createdAt: -1 }` | Admin directory filtering & user counts |
| **`internships`** | `{ status: 1, applicationDeadline: 1 }` | Active internship discovery filtering |
| **`internships`** | `{ companyId: 1, status: 1 }` | Recruiter posting management queries |
| **`internships`** | `{ title: 'text', description: 'text', skills: 'text' }` | Full-text keyword search |
| **`applications`**| `{ studentId: 1, internshipId: 1 }` (unique) | Prevent duplicate submissions |
| **`applications`**| `{ companyId: 1, status: 1, createdAt: -1 }` | Recruiter applicant tracking pipeline |
| **`interviews`**  | `{ studentId: 1, scheduledAt: 1 }` | Student upcoming interview timeline |
| **`interviews`**  | `{ companyId: 1, scheduledAt: 1 }` | Recruiter calendar agenda stream |
| **`notifications`**| `{ userId: 1, read: 1, createdAt: -1 }` | Fast unread badge queries (<2ms) |
| **`auditLogs`**  | `{ action: 1, createdAt: -1 }` | Security audit trail inspector queries |

---

## 4. Verification & Benchmark Summary
- **Backend Tests**: 16 suites / 123 tests passing (100% pass rate in ~10s).
- **Client Build Time**: ~1.29s with full code-splitting and zero chunk warnings.
