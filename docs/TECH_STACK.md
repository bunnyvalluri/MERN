# InternHub — Technology Stack

> **Version:** 1.0.0  
> **Last Updated:** 2026-08-23  
> **Status:** Approved for Implementation

---

## Table of Contents

1. [Frontend Stack](#1-frontend-stack)
2. [Backend Stack](#2-backend-stack)
3. [Database Layer](#3-database-layer)
4. [Authentication & Security](#4-authentication--security)
5. [File Storage](#5-file-storage)
6. [Email & Notifications](#6-email--notifications)
7. [Development Tooling](#7-development-tooling)
8. [Testing Stack](#8-testing-stack)
9. [Deployment & DevOps](#9-deployment--devops)
10. [Third-Party Integrations](#10-third-party-integrations)
11. [Version Pinning Strategy](#11-version-pinning-strategy)

---

## 1. Frontend Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Runtime | **Node.js** | 20 LTS | LTS stability; required for Vite |
| Bundler | **Vite** | ^5.x | Fast HMR, ESM-native, minimal config |
| UI Framework | **React** | ^18.x | Hooks-first, concurrent mode ready |
| Language | **JavaScript (ES2022+)** | — | As specified; JSX via Babel plugin |
| Routing | **React Router v6** | ^6.x | Nested routes, data loaders |
| State Management | **Redux Toolkit (RTK)** | ^2.x | Opinionated Redux; RTK Query for server state |
| HTTP Client | **Axios** | ^1.x | Interceptor support, request cancellation |
| Styling | **Tailwind CSS** | ^3.x | Utility-first; JIT engine |
| Icons | **Lucide React** | ^0.x | Consistent SVG icon set |
| Forms | **React Hook Form** | ^7.x | Performant uncontrolled form management |
| Validation | **Zod** | ^3.x | Schema-based validation |
| Date Handling | **date-fns** | ^3.x | Tree-shakeable date utilities |
| Charts | **Recharts** | ^2.x | Composable React charts for analytics |
| Toasts | **react-hot-toast** | ^2.x | Lightweight notification toasts |
| File Uploads | **react-dropzone** | ^14.x | Drag-and-drop resume/document uploads |
| Table | **TanStack Table** | ^8.x | Headless table with sorting/filtering |
| Animations | **Framer Motion** | ^11.x | Production-grade animation library |

### Frontend Directory Structure (Feature-Oriented)

```
client/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── store.js               # Redux store configuration
│   │   └── rootReducer.js         # Combined root reducer
│   ├── assets/                    # Static images, fonts
│   ├── components/                # Shared/global UI components
│   │   ├── ui/                    # Primitive components
│   │   ├── layout/                # AppLayout, Sidebar, Navbar, Footer
│   │   └── common/                # Reusable: Button, Modal, Table, etc.
│   ├── features/                  # Feature-sliced modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── authSlice.js
│   │   │   └── authApi.js
│   │   ├── student/
│   │   ├── recruiter/
│   │   ├── admin/
│   │   ├── internships/
│   │   ├── applications/
│   │   ├── notifications/
│   │   ├── search/
│   │   └── analytics/
│   ├── hooks/                     # Custom hooks
│   ├── lib/                       # axios instance, utils
│   ├── pages/                     # Route-level page components
│   ├── routes/                    # Route definitions, guards
│   └── main.jsx                   # App entry point
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 2. Backend Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Runtime | **Node.js** | 20 LTS | LTS; non-blocking I/O |
| Framework | **Express.js** | ^4.x | Mature, minimal, composable |
| Language | **JavaScript (ES2022+)** | — | ESM modules |
| ODM | **Mongoose** | ^8.x | Schema validation, middleware hooks |
| Auth | **jsonwebtoken** | ^9.x | JWT access + refresh token strategy |
| Password | **bcryptjs** | ^2.x | Pure-JS bcrypt |
| Validation | **Joi** | ^17.x | Server-side request validation |
| File Upload | **Multer** | ^1.x | Multipart form-data middleware |
| Cloud Files | **Cloudinary SDK** | ^1.x | Resume/avatar storage |
| Email | **Nodemailer** | ^6.x | SMTP email dispatch |
| CORS | **cors** | ^2.x | Fine-grained CORS control |
| Rate Limiting | **express-rate-limit** | ^7.x | Per-route throttling |
| Logging | **Morgan** | ^1.x | HTTP request logger |
| Structured Logs | **Winston** | ^3.x | Multi-transport logging |
| Security | **Helmet** | ^7.x | Secure HTTP headers |
| Env Vars | **dotenv** | ^16.x | .env management |
| Dev Reload | **Nodemon** | ^3.x | Auto-restart on file changes |
| Process Mgr | **PM2** (prod) | ^5.x | Cluster mode, zero-downtime restarts |

### Backend Directory Structure (Separation of Concerns)

```
server/
├── src/
│   ├── config/
│   │   ├── db.js                  # MongoDB Atlas connection
│   │   ├── cloudinary.js          # Cloudinary config
│   │   └── email.js               # Nodemailer transporter
│   ├── controllers/               # HTTP handlers (thin layer)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── student.controller.js
│   │   ├── recruiter.controller.js
│   │   ├── internship.controller.js
│   │   ├── application.controller.js
│   │   ├── interview.controller.js
│   │   ├── notification.controller.js
│   │   ├── company.controller.js
│   │   ├── admin.controller.js
│   │   ├── analytics.controller.js
│   │   └── upload.controller.js
│   ├── services/                  # Business logic (pure functions)
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── student.service.js
│   │   ├── recruiter.service.js
│   │   ├── internship.service.js
│   │   ├── application.service.js
│   │   ├── interview.service.js
│   │   ├── notification.service.js
│   │   ├── company.service.js
│   │   ├── admin.service.js
│   │   ├── analytics.service.js
│   │   ├── email.service.js
│   │   └── upload.service.js
│   ├── models/                    # Mongoose schemas
│   │   ├── User.model.js
│   │   ├── StudentProfile.model.js
│   │   ├── RecruiterProfile.model.js
│   │   ├── Company.model.js
│   │   ├── Internship.model.js
│   │   ├── Application.model.js
│   │   ├── Interview.model.js
│   │   ├── Notification.model.js
│   │   ├── AuditLog.model.js
│   │   └── SavedInternship.model.js
│   ├── routes/                    # Express routers (thin, no logic)
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── student.routes.js
│   │   ├── recruiter.routes.js
│   │   ├── internship.routes.js
│   │   ├── application.routes.js
│   │   ├── interview.routes.js
│   │   ├── notification.routes.js
│   │   ├── company.routes.js
│   │   ├── admin.routes.js
│   │   ├── analytics.routes.js
│   │   └── upload.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # verifyToken, requireRole
│   │   ├── error.middleware.js     # Global error handler
│   │   ├── validate.middleware.js  # Joi schema validation wrapper
│   │   ├── upload.middleware.js    # Multer config
│   │   ├── rateLimiter.middleware.js
│   │   └── audit.middleware.js     # Audit log writer
│   ├── validators/                 # Joi schema definitions
│   │   ├── auth.validator.js
│   │   ├── internship.validator.js
│   │   ├── application.validator.js
│   │   └── company.validator.js
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   ├── ApiResponse.js         # Standardized response wrapper
│   │   ├── asyncHandler.js        # try/catch wrapper
│   │   ├── generateToken.js       # JWT generation util
│   │   ├── paginate.js            # Pagination helper
│   │   └── logger.js              # Winston logger instance
│   └── app.js                     # Express app setup (no listen)
├── server.js                      # Entry point
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
└── package.json
```

---

## 3. Database Layer

| Aspect | Choice |
|---|---|
| Database | **MongoDB Atlas** (cloud-hosted) |
| ODM | **Mongoose 8.x** |
| Connection Pooling | Mongoose default pool (5 connections) |
| Indexing Strategy | Compound indexes on frequently queried fields |
| Schema Validation | Mongoose schema-level + Joi at request boundary |

---

## 4. Authentication & Security

| Concern | Approach |
|---|---|
| Auth Strategy | JWT (Access Token 15m + Refresh Token 7d) |
| Token Storage | Access: memory (Redux); Refresh: HttpOnly cookie |
| Password Hashing | bcryptjs, salt rounds = 12 |
| RBAC | Role enum: STUDENT, RECRUITER, ADMIN, SUPER_ADMIN |
| CORS | Whitelist-based; credentials: true |
| Rate Limiting | 100 req/15min global; 5 req/15min on auth routes |
| Helmet | All default security headers enabled |
| Input Sanitization | Joi validation on all mutation endpoints |
| Audit Logging | All admin & sensitive actions logged to AuditLog |

---

## 5. File Storage

| File Type | Storage | Max Size |
|---|---|---|
| Resume (PDF) | Cloudinary (raw) | 5 MB |
| Profile Avatar | Cloudinary (image) | 2 MB |
| Company Logo | Cloudinary (image) | 1 MB |
| Documents | Cloudinary (raw) | 10 MB |

---

## 6. Email & Notifications

| Channel | Technology | Use Cases |
|---|---|---|
| Transactional Email | Nodemailer + SMTP (Gmail OAuth2 or SendGrid) | Registration, password reset, application updates |
| In-App Notifications | MongoDB-backed polling / SSE | Real-time alerts, status updates |

---

## 7. Development Tooling

| Tool | Purpose |
|---|---|
| **ESLint** | Linting (Airbnb config) |
| **Prettier** | Code formatting |
| **Husky** | Git pre-commit hooks |
| **lint-staged** | Run linters on staged files only |
| **dotenv** | Environment variable management |
| **Postman** | API testing collection |
| **concurrently** | Run client + server simultaneously |

---

## 8. Testing Stack

| Layer | Framework | Scope |
|---|---|---|
| Backend Unit | **Jest** | Services, utils, validators |
| Backend Integration | **Supertest** | API endpoints |
| Frontend Unit | **Vitest** | Components, hooks, slices |
| Frontend E2E | **Playwright** | Critical user flows |

---

## 9. Deployment & DevOps

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway or Render |
| Database | MongoDB Atlas |
| File Storage | Cloudinary |
| CI/CD | GitHub Actions |

---

## 10. Third-Party Integrations

| Integration | Purpose | Priority |
|---|---|---|
| Cloudinary | File storage | Phase 1 |
| Nodemailer / SendGrid | Email | Phase 2 |
| MongoDB Atlas | Database | Phase 1 |
| Google OAuth 2.0 | Social login | Phase 3 |
| Stripe | Premium recruiter plans | Phase 4 |

---

## 11. Version Pinning Strategy

- All packages use caret ranges (^) to allow patch/minor updates.
- package-lock.json committed for both client/ and server/.
- Dependabot configured on GitHub to auto-PR dependency updates weekly.

---

*End of TECH_STACK.md*
