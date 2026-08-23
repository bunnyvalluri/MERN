# InternHub — Development Plan

> **Version:** 1.0.0  
> **Last Updated:** 2026-08-23  
> **Status:** Approved for Phased Execution

---

## Overview

InternHub is built in **6 sequential phases**. Each phase has:
- A clear scope boundary
- Defined deliverables
- A verification checklist before proceeding to the next phase

No phase is started until the previous phase passes its verification checklist.

---

## Phase Summary

| Phase | Name | Scope | Status |
|---|---|---|---|
| 0 | Architecture & Planning | Docs, repo setup, env | ✅ Complete |
| 1 | Foundation | Project init, backend skeleton, DB, auth | ⬜ Next |
| 2 | Core Backend APIs | All REST endpoints, models, validation | ⬜ Pending |
| 3 | Core Frontend | Auth, student flows, internship discovery | ⬜ Pending |
| 4 | Recruiter & Admin | Recruiter dashboard, admin panel | ⬜ Pending |
| 5 | Advanced Features | File uploads, analytics, notifications, search | ⬜ Pending |
| 6 | Polish & Production | Testing, CI/CD, deployment, documentation | ⬜ Pending |

---

## Phase 0 — Architecture & Planning ✅

**Goal:** Define the complete architecture before any code is written.

### Deliverables
- [x] Workspace discovery (empty confirmed)
- [x] `/docs/TECH_STACK.md`
- [x] `/docs/PROJECT_ARCHITECTURE.md`
- [x] `/docs/DEVELOPMENT_PLAN.md`

### Decisions Made
- Monorepo: `/client`, `/server`, `/docs`
- Frontend: React 18 + Vite 5 + Redux Toolkit 2 + Tailwind 3
- Backend: Express 4 + Mongoose 8 + JWT + bcryptjs
- Database: MongoDB Atlas
- File Storage: Cloudinary
- Auth: Dual-token (access 15m / refresh 7d via HttpOnly cookie)
- RBAC roles: STUDENT, RECRUITER, ADMIN, SUPER_ADMIN

---

## Phase 1 — Foundation

**Goal:** Working project skeleton with database connectivity, server running, client scaffolded.

### 1.1 Repository Setup
- [ ] Initialize Git repo (`git init` at monorepo root)
- [ ] Create `.gitignore` (node_modules, .env, dist, build)
- [ ] Create root `README.md` with project description
- [ ] Create GitHub Actions CI stub (`.github/workflows/ci.yml`)

### 1.2 Backend Initialization
- [ ] `cd server && npm init -y`
- [ ] Configure `"type": "module"` in package.json (ESM)
- [ ] Install all production dependencies:
  - express, mongoose, jsonwebtoken, bcryptjs, joi
  - cors, helmet, morgan, winston, dotenv
  - multer, cloudinary, nodemailer
  - express-rate-limit, cookie-parser
- [ ] Install dev dependencies:
  - nodemon, eslint, prettier, jest, supertest
- [ ] Scaffold full directory structure:
  - `src/config/`, `src/controllers/`, `src/services/`
  - `src/models/`, `src/routes/`, `src/middleware/`
  - `src/validators/`, `src/utils/`
- [ ] Create `server.js` (entry point)
- [ ] Create `src/app.js` (Express app, middleware registration)
- [ ] Create `src/config/db.js` (MongoDB Atlas connection)
- [ ] Create `src/utils/ApiError.js`
- [ ] Create `src/utils/ApiResponse.js`
- [ ] Create `src/utils/asyncHandler.js`
- [ ] Create `src/utils/logger.js` (Winston)
- [ ] Create `src/middleware/error.middleware.js`
- [ ] Create `.env.example` with all required variables
- [ ] Create `.env` (gitignored, actual values)
- [ ] Verify server starts and connects to MongoDB Atlas

### 1.3 Frontend Initialization
- [ ] `cd client && npx create-vite@latest . -- --template react`
- [ ] Install all production dependencies:
  - react-router-dom, @reduxjs/toolkit, react-redux
  - axios, tailwindcss, postcss, autoprefixer
  - lucide-react, react-hook-form, zod, @hookform/resolvers
  - date-fns, recharts, react-hot-toast
  - react-dropzone, framer-motion
- [ ] Install dev dependencies:
  - eslint, prettier, vitest, @testing-library/react
- [ ] Configure Tailwind CSS (`tailwind.config.js`, `postcss.config.js`)
- [ ] Create `src/app/store.js` (Redux store)
- [ ] Create `src/lib/axios.js` (Axios instance with interceptors)
- [ ] Create base layout components (AppLayout, PublicLayout)
- [ ] Create router setup with public + role-based protected routes
- [ ] Verify client starts with `npm run dev`

### 1.4 Root Configuration
- [ ] Create root `package.json` with workspace scripts:
  - `npm run dev` → starts both client and server via `concurrently`
  - `npm run lint` → runs ESLint on both
  - `npm run test` → runs all tests
- [ ] Verify `npm run dev` from root starts both services

### Phase 1 Verification
- [ ] `GET /api/v1/health` returns `{ status: "ok", timestamp: "..." }`
- [ ] MongoDB Atlas connection confirmed in logs
- [ ] React client loads at `http://localhost:5173`
- [ ] No ESLint errors in either workspace
- [ ] Environment variables loaded correctly

---

## Phase 2 — Core Backend APIs

**Goal:** All REST endpoints implemented, tested via Postman.

### 2.1 All Mongoose Models
- [ ] `User.model.js` — with pre-save password hash hook
- [ ] `StudentProfile.model.js`
- [ ] `RecruiterProfile.model.js`
- [ ] `Company.model.js`
- [ ] `Internship.model.js` — with compound indexes
- [ ] `Application.model.js` — unique compound index
- [ ] `Interview.model.js`
- [ ] `Notification.model.js`
- [ ] `AuditLog.model.js`
- [ ] `SavedInternship.model.js`

### 2.2 Auth Module
- [ ] `auth.validator.js` — register, login, forgotPassword, resetPassword schemas
- [ ] `auth.service.js` — register, login, logout, refreshToken, forgotPassword, resetPassword, verifyEmail
- [ ] `auth.controller.js` — thin, delegates to service
- [ ] `auth.routes.js` — register all auth routes
- [ ] `auth.middleware.js` — verifyToken, requireRole
- [ ] Email verification token generation
- [ ] Refresh token stored in DB (on User model)

### 2.3 User Module
- [ ] `user.service.js` — getMe, updatePassword
- [ ] `user.controller.js`
- [ ] `user.routes.js`

### 2.4 Student Module
- [ ] `student.service.js` — getProfile, updateProfile, uploadAvatar, uploadResume
- [ ] `student.controller.js`
- [ ] `student.routes.js`

### 2.5 Recruiter Module
- [ ] `recruiter.service.js` — getProfile, updateProfile
- [ ] `recruiter.controller.js`
- [ ] `recruiter.routes.js`

### 2.6 Company Module
- [ ] `company.validator.js`
- [ ] `company.service.js` — create, update, getById, list
- [ ] `company.controller.js`
- [ ] `company.routes.js`

### 2.7 Internship Module
- [ ] `internship.validator.js`
- [ ] `internship.service.js` — create, update, delete, list (with filters/pagination), getById, save/unsave
- [ ] `internship.controller.js`
- [ ] `internship.routes.js`
- [ ] Filtering: keyword, location, skills, stipend, duration, category, status
- [ ] Pagination utility integrated

### 2.8 Application Module
- [ ] `application.validator.js`
- [ ] `application.service.js` — apply, getMyApplications, getByInternship, updateStatus, withdraw
- [ ] `application.controller.js`
- [ ] `application.routes.js`

### 2.9 Interview Module
- [ ] `interview.service.js` — schedule, update, cancel, list
- [ ] `interview.controller.js`
- [ ] `interview.routes.js`

### 2.10 Notification Module
- [ ] `notification.service.js` — create, getMyNotifications, markRead, markAllRead, delete
- [ ] `notification.controller.js`
- [ ] `notification.routes.js`

### 2.11 Upload Module
- [ ] `cloudinary.js` config
- [ ] `upload.middleware.js` (Multer: memory storage)
- [ ] `upload.service.js` — uploadToCloudinary, deleteFromCloudinary
- [ ] `upload.controller.js`
- [ ] `upload.routes.js`

### 2.12 Admin Module
- [ ] `admin.service.js` — listUsers, updateUserStatus, deleteUser, listAllInternships, moderate
- [ ] `admin.controller.js`
- [ ] `admin.routes.js`
- [ ] `audit.middleware.js` — writes to AuditLog on every admin action

### 2.13 Analytics Module
- [ ] `analytics.service.js` — recruiter stats, platform stats (admin)
- [ ] `analytics.controller.js`
- [ ] `analytics.routes.js`

### Phase 2 Verification
- [ ] Postman collection tests all 50+ endpoints
- [ ] Auth flow: register → verify → login → refresh → logout
- [ ] RBAC tested: each role can/cannot access correct endpoints
- [ ] Pagination working correctly on list endpoints
- [ ] File upload to Cloudinary confirmed
- [ ] Email sent on registration and password reset
- [ ] All inputs validated; invalid inputs return proper 400 errors
- [ ] Jest unit tests pass for all services

---

## Phase 3 — Core Frontend (Student Flows)

**Goal:** Students can register, login, discover internships, apply, and track applications.

### 3.1 Global Setup
- [ ] Design system: Tailwind theme tokens (colors, fonts, spacing)
- [ ] Google Fonts integrated (Inter)
- [ ] Global CSS reset and base styles
- [ ] Axios interceptors: attach Bearer token; refresh on 401
- [ ] Redux persist for auth state

### 3.2 Shared Components
- [ ] `Button` (variants: primary, secondary, ghost, danger, sizes: sm/md/lg)
- [ ] `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`
- [ ] `Modal`, `Drawer`, `Tooltip`
- [ ] `Badge`, `Tag`
- [ ] `LoadingSpinner`, `Skeleton`
- [ ] `EmptyState`
- [ ] `Pagination`
- [ ] `Avatar`
- [ ] `FileUpload` (drag-and-drop)
- [ ] `DataTable` (TanStack Table wrapper)
- [ ] `ErrorBoundary`
- [ ] `Toast` (react-hot-toast integration)

### 3.3 Layout Components
- [ ] `PublicLayout` (Navbar + Footer for landing/auth pages)
- [ ] `StudentLayout` (collapsible sidebar + topbar + outlet)
- [ ] `RecruiterLayout`
- [ ] `AdminLayout`
- [ ] `ProtectedRoute` HOC
- [ ] `RoleRedirect` (redirects to correct dashboard by role)

### 3.4 Landing Page
- [ ] Hero section (headline, CTA buttons)
- [ ] Features section
- [ ] How it works section
- [ ] Stats section
- [ ] Footer
- [ ] Fully responsive, animated with Framer Motion

### 3.5 Auth Pages
- [ ] Register page (role selection: student/recruiter)
- [ ] Login page
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Email verification page
- [ ] Auth slice (Redux): login, logout, setCredentials, refreshToken
- [ ] Persist auth state across page refresh

### 3.6 Student Profile
- [ ] View profile page
- [ ] Edit profile form (personal info, education, experience, skills)
- [ ] Resume upload (Cloudinary integration)
- [ ] Avatar upload
- [ ] Profile completion progress indicator

### 3.7 Internship Discovery
- [ ] Internship listing page with card grid
- [ ] Search bar (debounced, 300ms)
- [ ] Filter sidebar (location, skills, stipend range, duration, category)
- [ ] Sort options (newest, stipend, deadline)
- [ ] Pagination
- [ ] Internship card component (company logo, title, stipend, location, tags)
- [ ] Save/unsave toggle on cards

### 3.8 Internship Detail
- [ ] Full detail page
- [ ] Apply button (opens application modal)
- [ ] Application modal (cover letter, resume select)
- [ ] Already applied state
- [ ] Deadline expired state
- [ ] Company info section
- [ ] Similar internships

### 3.9 Saved Internships
- [ ] Saved internships list
- [ ] Remove from saved
- [ ] Quick apply from saved list

### 3.10 Application Tracking
- [ ] Applications list with status badges
- [ ] Status filter tabs (All, Pending, Shortlisted, Rejected, Accepted)
- [ ] Application detail drawer (timeline, status history)
- [ ] Interview schedule display (if any)

### 3.11 Notifications
- [ ] Notification bell in topbar (unread count badge)
- [ ] Notification drawer
- [ ] Notification list page
- [ ] Mark read / mark all read

### Phase 3 Verification
- [ ] Complete student journey works end-to-end
- [ ] All API calls succeed with real data from MongoDB
- [ ] Error states handled (network error, 400, 401, 500)
- [ ] Responsive on mobile, tablet, desktop
- [ ] No console errors

---

## Phase 4 — Recruiter & Admin Panels

**Goal:** Recruiters can post and manage internships. Admins can moderate the platform.

### 4.1 Recruiter Dashboard
- [ ] Dashboard home (stats: postings, applications, interviews)
- [ ] Quick actions

### 4.2 Company Management
- [ ] Create company profile
- [ ] Edit company profile
- [ ] Upload company logo
- [ ] Company detail view

### 4.3 Internship Management
- [ ] Create internship (multi-step form)
- [ ] Edit internship
- [ ] Publish / unpublish toggle
- [ ] Delete internship
- [ ] Internship list with status and application counts

### 4.4 Candidate Management
- [ ] Applicants list per internship
- [ ] Application detail with student profile
- [ ] Status update (shortlist, reject, accept)
- [ ] Send notification on status change
- [ ] Add recruiter notes

### 4.5 Interview Management
- [ ] Schedule interview (datetime, type: video/phone/in-person, link)
- [ ] Interview list (upcoming, past)
- [ ] Edit/cancel interview
- [ ] Add interview feedback
- [ ] Student notified on schedule

### 4.6 Recruiter Analytics
- [ ] Applications per internship chart
- [ ] Application status breakdown pie chart
- [ ] Top skill sets among applicants
- [ ] Weekly application trend

### 4.7 Admin Dashboard
- [ ] Platform stats (total users, internships, applications)
- [ ] Recent activity feed

### 4.8 Admin User Management
- [ ] Users table (searchable, sortable)
- [ ] User detail modal
- [ ] Activate / deactivate user
- [ ] Change user role
- [ ] Delete user

### 4.9 Admin Internship Management
- [ ] All internships table
- [ ] Approve / reject / remove internship
- [ ] View any internship detail

### 4.10 Admin Audit Logs
- [ ] Audit log table with actor, action, target, timestamp
- [ ] Filter by date range, actor, action type
- [ ] Export to CSV

### 4.11 Platform Analytics (Admin)
- [ ] User registration trend (line chart)
- [ ] Internship posting trend
- [ ] Application volume trend
- [ ] Top companies by postings
- [ ] Top skills in demand

### Phase 4 Verification
- [ ] Recruiter can complete full posting-to-hire flow
- [ ] Admin can moderate all content
- [ ] All analytics data is real (from MongoDB aggregations)
- [ ] Audit log captures admin actions

---

## Phase 5 — Advanced Features

**Goal:** Search, file uploads, notifications, and advanced UX.

### 5.1 Advanced Search & Filtering
- [ ] Full-text search on internship title, description, skills
- [ ] MongoDB text indexes on Internship model
- [ ] URL-persisted filters (query params sync with filter state)
- [ ] Search history (localStorage)

### 5.2 Email Notifications
- [ ] Registration confirmation email
- [ ] Email verification email
- [ ] Password reset email
- [ ] Application status change email (to student)
- [ ] New application received email (to recruiter)
- [ ] Interview scheduled email (to student)
- [ ] Email templates (HTML)

### 5.3 Real-Time Notifications (Server-Sent Events)
- [ ] SSE endpoint: `GET /api/v1/notifications/stream`
- [ ] Client SSE connection in notification hook
- [ ] Auto-dismiss and badge update on new notification

### 5.4 Settings Pages
- [ ] Account settings (email, password change)
- [ ] Notification preferences (which emails to receive)
- [ ] Privacy settings
- [ ] Delete account

### 5.5 Profile Completeness Score
- [ ] Algorithm to calculate student profile score
- [ ] Visual progress bar on dashboard
- [ ] Suggestions for what to complete

### Phase 5 Verification
- [ ] Emails delivered successfully (confirmed in test inbox)
- [ ] SSE notification appears in real-time
- [ ] Search returns accurate, relevant results
- [ ] URL filters survive page refresh

---

## Phase 6 — Polish & Production

**Goal:** Production-ready, tested, deployed application.

### 6.1 Testing
- [ ] Jest unit tests for all backend services (>80% coverage)
- [ ] Supertest integration tests for all API endpoints
- [ ] Vitest unit tests for Redux slices and utility functions
- [ ] Playwright E2E tests for critical flows:
  - Student registration and login
  - Internship application flow
  - Recruiter posting and candidate management
  - Admin user moderation

### 6.2 Performance
- [ ] MongoDB indexes verified with `explain()`
- [ ] API response times < 200ms for all list endpoints
- [ ] Frontend bundle size analyzed with `vite-bundle-visualizer`
- [ ] Lazy loading for all route pages
- [ ] Image optimization via Cloudinary transformations

### 6.3 Security Hardening
- [ ] CSP headers configured
- [ ] Rate limiting tested under load
- [ ] All secrets in environment variables (none in code)
- [ ] Dependency audit (`npm audit`) — no high/critical vulnerabilities
- [ ] OWASP Top 10 checklist reviewed

### 6.4 CI/CD Pipeline
- [ ] GitHub Actions: lint + test on every PR
- [ ] GitHub Actions: auto-deploy to Vercel (frontend) on merge to `main`
- [ ] GitHub Actions: auto-deploy to Railway (backend) on merge to `main`
- [ ] Branch protection: PRs require CI pass before merge

### 6.5 Documentation
- [ ] Root `README.md` — setup instructions, env variables, architecture overview
- [ ] `server/README.md` — API documentation
- [ ] `client/README.md` — frontend setup
- [ ] Postman collection exported to `/docs/InternHub.postman_collection.json`

### 6.6 Deployment
- [ ] MongoDB Atlas production cluster configured (M10 or higher)
- [ ] Cloudinary production account configured
- [ ] Frontend deployed to Vercel (production URL confirmed)
- [ ] Backend deployed to Railway (production URL confirmed)
- [ ] Environment variables set on deployment platforms
- [ ] Custom domain configured (optional)
- [ ] PM2 ecosystem file for backend

### Phase 6 Verification
- [ ] All E2E tests pass on production environment
- [ ] Lighthouse score > 85 (performance, accessibility, SEO)
- [ ] Zero console errors in production
- [ ] All environment variables correctly set

---

## Implementation Rules

1. **Never skip phases.** Each phase builds the foundation for the next.
2. **No placeholder data.** All data comes from MongoDB via the real API.
3. **No dead buttons.** Every interactive element performs a real action.
4. **No business logic in routes.** Controllers call services; services contain logic.
5. **Every endpoint is validated.** Joi validation on all mutation endpoints.
6. **Every error is handled.** No unhandled promises; no generic "Something went wrong".
7. **No duplicate components.** If a component is needed in two features, it moves to `components/common/`.
8. **Technology lock-in.** No technology changes after Phase 0 without a documented decision.

---

## Environment Variables Reference

### Server (`server/.env`)
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/internhub

# JWT
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<app-password>
EMAIL_FROM=noreply@internhub.com
```

### Client (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=InternHub
```

---

*End of DEVELOPMENT_PLAN.md*
