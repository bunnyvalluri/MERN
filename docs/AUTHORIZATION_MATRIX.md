# InternHub — Production Authorization & RBAC Matrix

> **Security Model:** Role-Based Access Control (RBAC) + Resource Ownership Verification (IDOR Protection)  
> **Version:** 1.0.0  
> **Status:** Implemented & Verified  

---

## 1. Security Architecture & Core Principles

InternHub enforces security through **defense-in-depth**:

1. **Frontend Route Protection:**
   - Used strictly for user experience (UX), avoiding UI disorientation and guiding users to their respective portals.
   - **Never trusted as a security boundary.**
2. **Backend Authentication Layer (`authenticateUser`):**
   - Cryptographically verifies short-lived JWT Access Tokens (`Authorization: Bearer <token>`).
   - Verifies user account existence and `isActive: true` status on every authenticated request.
3. **Backend Authorization Layer (`authorizeRoles` / `requireAdmin` / `requireSuperAdmin`):**
   - Strictly enforces role boundaries (`STUDENT`, `RECRUITER`, `ADMIN`, `SUPER_ADMIN`).
4. **Backend Resource Ownership Layer (`verifyOwnership`):**
   - Prevents Insecure Direct Object References (**IDOR**).
   - Even if an authenticated Recruiter changes the URL ID parameter to another company's internship, the request is rejected with `403 Forbidden`.

---

## 2. Role Definitions & Hierarchy

```
                   ┌─────────────────┐
                   │   SUPER_ADMIN   │ (Full system access & admin management)
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │      ADMIN      │ (Platform moderation, analytics & logs)
                   └────────┬────────┘
             ┌──────────────┴──────────────┐
             │                             │
    ┌────────▼────────┐           ┌────────▼────────┐
    │     STUDENT     │           │    RECRUITER    │
    └─────────────────┘           └─────────────────┘
```

| Role | Description | Scope | Self-Registration |
|---|---|---|---|
| **`STUDENT`** | Candidate looking for internships | Manages own profile, applications, documents, saves | ✅ Yes |
| **`RECRUITER`** | Corporate hiring manager | Manages own company, posts internships, manages applicants | ✅ Yes |
| **`ADMIN`** | Platform operations & moderator | Manages users, companies, internships, applications, logs | ❌ No (Invite/Seeded) |
| **`SUPER_ADMIN`** | System owner | Everything Admin can do + manages Admin accounts & config | ❌ No (Console Only) |

---

## 3. Comprehensive Permissions Matrix

| Resource | Action | Endpoint | Public | STUDENT | RECRUITER | ADMIN | SUPER_ADMIN | Ownership Rule Enforced |
|---|---|---|:---:|:---:|:---:|:---:|:---:|---|
| **Authentication** | Register | `POST /api/v1/auth/register` | ✅ | ✅ | ✅ | ❌ | ❌ | Restricted to STUDENT & RECRUITER |
| | Login | `POST /api/v1/auth/login` | ✅ | ✅ | ✅ | ✅ | ✅ | Validates credentials |
| | Logout | `POST /api/v1/auth/logout` | ❌ | ✅ | ✅ | ✅ | ✅ | Authenticated user only |
| | Refresh Session | `POST /api/v1/auth/refresh` | ✅ | ✅ | ✅ | ✅ | ✅ | Validates refresh token cookie |
| | Forgot Password | `POST /api/v1/auth/forgot-password` | ✅ | ✅ | ✅ | ✅ | ✅ | Generic response (anti-enumeration) |
| | Reset Password | `POST /api/v1/auth/reset-password` | ✅ | ✅ | ✅ | ✅ | ✅ | Validates one-time reset token |
| | Verify Email | `POST /api/v1/auth/verify-email` | ✅ | ✅ | ✅ | ✅ | ✅ | Validates one-time verification token |
| | Get Current User | `GET /api/v1/auth/me` | ❌ | ✅ | ✅ | ✅ | ✅ | Authenticated user only |
| **Student Profiles** | View Public Profile | `GET /api/v1/students/:id` | ❌ | ✅ | ✅ | ✅ | ✅ | Authenticated users |
| | Update Own Profile | `PUT /api/v1/students/me` | ❌ | ✅ (Own) | ❌ | ✅ | ✅ | `userId === req.user._id` |
| | Upload Resume/Doc | `POST /api/v1/documents` | ❌ | ✅ (Own) | ❌ | ✅ | ✅ | `userId === req.user._id` |
| | Delete Document | `DELETE /api/v1/documents/:id` | ❌ | ✅ (Own) | ❌ | ✅ | ✅ | `verifyDocumentOwnership` |
| **Internships** | Browse & Search | `GET /api/v1/internships` | ✅ | ✅ | ✅ | ✅ | ✅ | Public discovery |
| | View Details | `GET /api/v1/internships/:id` | ✅ | ✅ | ✅ | ✅ | ✅ | Public discovery |
| | Create Internship | `POST /api/v1/internships` | ❌ | ❌ | ✅ | ✅ | ✅ | Requires verified company |
| | Update Internship | `PUT /api/v1/internships/:id` | ❌ | ❌ | ✅ (Own) | ✅ | ✅ | `verifyInternshipOwnership` |
| | Delete Internship | `DELETE /api/v1/internships/:id` | ❌ | ❌ | ✅ (Own) | ✅ | ✅ | `verifyInternshipOwnership` |
| | Save Internship | `POST /api/v1/internships/:id/save` | ❌ | ✅ | ❌ | ❌ | ❌ | Student bookmarking only |
| **Applications** | Submit Application | `POST /api/v1/applications` | ❌ | ✅ | ❌ | ❌ | ❌ | Student only + unicity check |
| | View My Applications | `GET /api/v1/applications/student` | ❌ | ✅ (Own) | ❌ | ❌ | ❌ | Returns only applicant's rows |
| | View Job Applications | `GET /api/v1/applications/internship/:id` | ❌ | ❌ | ✅ (Own) | ✅ | ✅ | Must own the internship listing |
| | Update App Status | `PATCH /api/v1/applications/:id/status` | ❌ | ❌ | ✅ (Own) | ✅ | ✅ | `verifyApplicationOwnership` |
| | Withdraw Application | `PATCH /api/v1/applications/:id/withdraw`| ❌ | ✅ (Own) | ❌ | ✅ | ✅ | `studentId === req.user._id` |
| **Interviews** | Schedule Interview | `POST /api/v1/interviews` | ❌ | ❌ | ✅ (Own) | ✅ | ✅ | Must own internship application |
| | View Interviews | `GET /api/v1/interviews` | ❌ | ✅ (Own) | ✅ (Own) | ✅ | ✅ | Scoped to user participation |
| | Submit Feedback | `POST /api/v1/interviews/:id/feedback`| ❌ | ❌ | ✅ (Own) | ✅ | ✅ | Recruiter interviewer only |
| **Administration** | Manage User Accounts | `* /api/v1/admin/users/*` | ❌ | ❌ | ❌ | ✅ | ✅ | Admin portal only |
| | Manage Admins | `* /api/v1/admin/super/admins/*` | ❌ | ❌ | ❌ | ❌ | ✅ | Super Admin exclusive |
| | View Platform Audit Logs | `GET /api/v1/admin/audit-logs` | ❌ | ❌ | ❌ | ✅ | ✅ | Admin portal only |
| | Platform Analytics | `GET /api/v1/admin/analytics` | ❌ | ❌ | ❌ | ✅ | ✅ | Admin portal only |

---

## 4. Ownership Verification Rules (IDOR Protection)

### Rule A: Student Profile & Documents
- A student can only edit the profile and documents where `userId === req.user._id`.
- Attempts by Student A to modify Student B's resume or profile URL result in `403 Forbidden`.

### Rule B: Recruiter Listings & Candidates
- A recruiter can only edit, publish, or delete internships where `createdBy === req.user._id` (or `company.ownerId === req.user._id`).
- A recruiter can only view applicants and change statuses for applications submitted to **their own company listings**.
- Attempts by Recruiter A to access candidate submissions for Recruiter B result in `403 Forbidden`.

### Rule C: Administrative Moderation Override
- Users with role `ADMIN` or `SUPER_ADMIN` can view and moderate cross-tenant resources (to suspend fraudulent internships, deactivate bad actors, or review appeals).

---

## 5. Middleware Usage Guide

```javascript
import {
  authenticateUser,
  authorizeRoles,
  requireStudent,
  requireRecruiter,
  requireAdmin,
  requireSuperAdmin,
  verifyInternshipOwnership,
  verifyApplicationOwnership,
} from '../middleware/auth.middleware.js';

// 1. Role-restricted route
router.post('/internships', authenticateUser, requireRecruiter, createInternship);

// 2. Ownership-restricted route (IDOR Protected)
router.put('/internships/:id', authenticateUser, requireRecruiter, verifyInternshipOwnership, updateInternship);

// 3. Multi-role authorized route
router.get('/applications/:id', authenticateUser, verifyApplicationOwnership, getApplicationDetails);

// 4. Super Admin exclusive route
router.post('/admin/create-admin', authenticateUser, requireSuperAdmin, createAdminAccount);
```

---

*End of AUTHORIZATION_MATRIX.md*
