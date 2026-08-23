# InternHub — Backend API & Microservices

<div align="center">

**A production-ready Node.js 20 LTS REST API built with Express.js, MongoDB Atlas (Mongoose 8), JWT Authentication, and Cloudinary Streaming.**

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-339933.svg?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express Version](https://img.shields.io/badge/express-4.19-000000.svg?style=flat-square&logo=express)](https://expressjs.com)
[![MongoDB Atlas](https://img.shields.io/badge/mongodb-7.0%2B-47A248.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Mongoose](https://img.shields.io/badge/mongoose-8.6-880000.svg?style=flat-square&logo=mongoose)](https://mongoosejs.com)
[![Jest Testing](https://img.shields.io/badge/tested%20with-jest-C21325.svg?style=flat-square&logo=jest)](https://jestjs.io)

</div>

---

## 📖 Overview

The `backend/` directory contains the complete REST API for **InternHub**. It orchestrates user authentication, role-based access control (RBAC), weighted job search, Cloudinary file uploads in RAM memory buffers, candidate application workflows, calendar interview dispatch, and immutable forensic security audit logs.

---

## 📂 Architecture & Directory Structure

```text
backend/
├── scripts/                      # Operational & verification scripts
│   └── verify_production_readiness.js # Automated pre-flight health check
│
├── src/
│   ├── config/                   # Infrastructure Configurations
│   │   ├── cloudinary.js         # Cloudinary SDK storage connection
│   │   ├── db.js                 # MongoDB Atlas connection with retry logic
│   │   └── mailer.js             # Nodemailer SMTP relay with HTML templates
│   │
│   ├── controllers/              # Request Orchestrators (HTTP layer)
│   │   ├── admin.controller.js   # Platform KPIs, moderation, audit trail, broadcasts
│   │   ├── application.controller.js # Submit applications, status transitions, review
│   │   ├── auth.controller.js    # Register, login, refresh, logout, password resets
│   │   ├── company.controller.js # Company branding, verification requests
│   │   ├── health.controller.js  # Live database & system status checks
│   │   ├── internship.controller.js # Weighted search, filters, CRUD operations
│   │   ├── interview.controller.js  # Schedule, reschedule, cancel interviews
│   │   ├── notification.controller.js# User notifications, mark-read, delete
│   │   ├── student.controller.js # Student profile, skills, bookmarks, resume
│   │   └── upload.controller.js  # Cloudinary resume/avatar streaming uploads
│   │
│   ├── middleware/               # Express Pipeline Middleware
│   │   ├── auth.middleware.js    # JWT verification & user session hydration
│   │   ├── authorization.middleware.js # Role-based access control guard (RBAC)
│   │   ├── error.middleware.js   # Global structured error handler
│   │   ├── httpLogger.middleware.js # Structured request logging
│   │   ├── rateLimiter.middleware.js # Express rate limiters for auth & mutations
│   │   ├── requestId.middleware.js # UUID v4 request tracing (`X-Request-Id`)
│   │   └── upload.middleware.js  # Multer RAM file buffer validation
│   │
│   ├── models/                   # Mongoose Database Schemas (10 Collections)
│   │   ├── Application.model.js  # Application lifecycle with unique compound index
│   │   ├── AuditLog.model.js     # Immutable security and moderation audit records
│   │   ├── Company.model.js      # Corporate profiles & recruiter relationships
│   │   ├── Document.model.js     # File upload metadata & Cloudinary identifiers
│   │   ├── Internship.model.js   # Job opportunity schema with text & compound indexes
│   │   ├── Interview.model.js    # Scheduled interviews & meeting link integrations
│   │   ├── Notification.model.js # User notifications & unread tracking
│   │   ├── SavedInternship.model.js # Student bookmarked internships
│   │   ├── StudentProfile.model.js # Student resumes, education, skills, projects
│   │   ├── User.model.js         # Core user identities, bcrypt passwords & roles
│   │   └── index.js              # Central barrel export for all schemas
│   │
│   ├── routes/                   # Express REST Route Declarations
│   │   ├── admin.routes.js       # Admin panel moderation & audit endpoints
│   │   ├── application.routes.js # Candidate application lifecycle routes
│   │   ├── auth.routes.js        # Authentication & password management
│   │   ├── company.routes.js     # Company profile & directory routes
│   │   ├── health.routes.js      # Health check probes
│   │   ├── internship.routes.js  # Job search, filters, CRUD routes
│   │   ├── interview.routes.js   # Calendar scheduling & interview routes
│   │   ├── notification.routes.js# Notification center endpoints
│   │   ├── recruiter.routes.js   # Recruiter dashboard & ATS routes
│   │   ├── student.routes.js     # Student profile & saved jobs endpoints
│   │   └── upload.routes.js      # Cloudinary upload endpoints
│   │
│   ├── services/                 # Pure Business Logic Layer
│   │   ├── admin.service.js      # Platform operations logic
│   │   ├── application.service.js# ATS state transitions & application logic
│   │   ├── auth.service.js       # Token generation & credential verification
│   │   ├── company.service.js    # Company profile management
│   │   ├── internship.service.js # Search queries & filter builders
│   │   ├── interview.service.js  # Interview scheduling operations
│   │   ├── notification.service.js# In-app alerts & notifications
│   │   ├── recruiter.service.js  # Recruiter ATS workflows
│   │   ├── storage.service.js    # Cloudinary buffer upload streams
│   │   └── student.service.js    # Profile & resume update operations
│   │
│   ├── utils/                    # Shared Utilities & Helpers
│   │   ├── ApiError.js           # Standard operational error class
│   │   ├── ApiResponse.js        # Uniform JSON response structure
│   │   ├── asyncHandler.js       # Async wrapper eliminating try/catch boilerplate
│   │   ├── logger.js             # Winston structured logger with PII masking
│   │   └── token.utils.js        # JWT generation, cookie setters & validation
│   │
│   ├── validators/               # Joi Request Validation Schemas
│   │   ├── application.validator.js
│   │   ├── auth.validator.js
│   │   ├── company.validator.js
│   │   ├── internship.validator.js
│   │   ├── interview.validator.js
│   │   ├── notification.validator.js
│   │   └── student.validator.js
│   │
│   └── app.js                    # Express app initialization & middleware stack
│
├── tests/                        # Comprehensive Test Suites
│   ├── integration/              # Supertest HTTP integration tests
│   └── unit/                     # Business logic & model unit tests
│
├── .env.example                  # Environment configuration template
├── package.json                  # Backend dependencies & script definitions
├── server.js                     # HTTP server entry point with graceful shutdown
└── README.md                     # Backend developer guide
```

---

## 🚀 Running Backend Commands

```bash
# Start backend in development mode (with nodemon hot-reload)
npm run dev

# Start in production mode
npm start

# Run all unit and integration tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run ESLint validation
npm run lint

# Run Prettier code formatting
npm run format
```
