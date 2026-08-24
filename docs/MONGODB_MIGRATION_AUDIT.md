# InternHub MongoDB Atlas Migration Audit

**Date:** 2026-08-24  
**Status:** AUDIT COMPLETE — Ready for execution

---

## 1. Current Architecture

**Frontend:** React 18 + Vite, Redux Toolkit, React Router v6, Axios (→ /api/v1)  
**Backend:** Node.js + Express, Mongoose 8, JWT auth, Joi validation, Winston logs  
**Database:** MongoDB Atlas — cluster0.uzbawnu.mongodb.net — DB: internhub  
**Status:** ✅ CONNECTED — 316 internships, 7 users, 5 companies seeded

---

## 2. Existing Models (All in backend/src/models/)

User ✅ | StudentProfile ✅ | Company ✅ | Internship ✅ | Application ✅  
SavedInternship ✅ | Document ✅ | Interview ✅ | Notification ✅  
AuditLog ✅ | SyncJob ✅  
**Missing:** DataSource, AnalyticsEvent

---

## 3. Critical Issues (Mock/Fallback Data to Remove)

### Backend
1. `auth.service.js` DEMO_ACCOUNTS (lines 14-67) — bypasses real DB auth
2. `auth.service.js` offline registration fallback (lines 81-104) — creates fake users
3. `auth.service.js` offline login fallback (lines 180+) — creates fake sessions
4. `admin.service.js` DEMO_ADMIN_USERS (lines 11-66) — hardcoded user list
5. `admin.service.js` DEMO_AUDIT_LOGS (lines 68-101) — hardcoded audit logs
6. `admin.service.js` REAL_INTERNSHIPS undefined variable (lines 464, 522, 566) — RUNTIME ERROR
7. `admin.service.js` REAL_COMPANIES undefined variable (lines 355, 417) — RUNTIME ERROR
8. `application.service.js` REAL_INTERNSHIPS undefined variable (line 51) — RUNTIME ERROR

### Frontend
9. `companies/data/companiesData.js` (64KB) — hardcoded company profiles
10. `companies/services/companiesService.js` — reads static file, no API calls
11. Companies page is NOT connected to backend — 100% static data

---

## 4. What Is Already Working (DB-Driven)

✅ Internship listing/search/filter/pagination (InternshipsPage → /api/v1/internships → MongoDB)  
✅ Internship detail (InternshipDetailPage → /api/v1/internships/:id)  
✅ Save/Unsave toggle (authenticated students)  
✅ Applications submit/list/track  
✅ Recruiter: create/update internships, company management  
✅ Admin: users, companies, internships, audit logs  
✅ SSE real-time stream  
✅ Health check (/api/v1/health returns DB status)

---

## 5. Priority Action Plan

**CRITICAL (fix before production):**
1. Fix undefined REAL_INTERNSHIPS/REAL_COMPANIES references → runtime crashes
2. Remove/gate DEMO_ACCOUNTS fallback in auth
3. Add GET /api/v1/companies public route
4. Connect Companies frontend page to API

**HIGH:**
5. Add DataSource model + admin routes
6. Add AnalyticsEvent model
7. Add expiration worker (auto-expire past-deadline internships)

**MEDIUM:**
8. Atlas Search integration for fuzzy search
9. Documentation updates
