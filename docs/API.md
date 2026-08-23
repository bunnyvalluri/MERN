# InternHub — REST API Specification

> **Base URL:** `http://localhost:5000/api/v1` (Development) or `https://api.internhub.dev/api/v1` (Production)  
> **Protocol:** HTTPS / JSON  
> **Version:** 1.0.0

---

## Table of Contents

1. [Standard Response Envelope](#1-standard-response-envelope)
2. [Standard Error Envelope](#2-standard-error-envelope)
3. [Authentication & Request Headers](#3-authentication--request-headers)
4. [Health Endpoints](#4-health-endpoints)
5. [Authentication Endpoints](#5-authentication-endpoints)
6. [Internship Discovery Endpoints](#6-internship-discovery-endpoints)
7. [Student Applications Endpoints](#7-student-applications-endpoints)
8. [Student Profile Endpoints](#8-student-profile-endpoints)
9. [Recruiter Management Endpoints](#9-recruiter-management-endpoints)
10. [Interview Scheduling Endpoints](#10-interview-scheduling-endpoints)
11. [Upload & Document Endpoints](#11-upload--document-endpoints)
12. [Notification Endpoints](#12-notification-endpoints)
13. [Admin & Platform Moderation Endpoints](#13-admin--platform-moderation-endpoints)

---

## 1. Standard Response Envelope

Every successful API response follows a consistent JSON structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully.",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

## 2. Standard Error Envelope

Every error response returns a standardized machine-readable payload:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "status": 400,
  "message": "Validation failed.",
  "requestId": "6a9e1d84-c8c3-4d7a-8b1e-0cf43875a611",
  "timestamp": "2026-08-24T00:15:00.000Z",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" }
  ]
}
```

---

## 3. Authentication & Request Headers

| Header | Description | Required |
|---|---|---|
| `Authorization` | `Bearer <access_token>` | For all protected routes |
| `Content-Type` | `application/json` (or `multipart/form-data` for uploads) | Yes |
| `X-Request-Id` | Client/proxy tracking UUID | Optional (auto-generated if omitted) |
| `X-Client-Version` | Frontend client semver | Optional |

---

## 4. Health Endpoints

### `GET /health`
Returns system status, active database state, and server uptime.

- **Auth:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "InternHub API is healthy",
  "environment": "production",
  "timestamp": "2026-08-24T00:00:00.000Z",
  "uptimeSeconds": 86400,
  "database": {
    "state": "connected",
    "isConnected": true,
    "host": "cluster0.mongodb.net",
    "name": "internhub",
    "pingMs": 14
  }
}
```

---

## 5. Authentication Endpoints

Base route: `/auth`

### `POST /auth/register`
Creates a new account (`STUDENT` or `RECRUITER`) and sets the HttpOnly refresh token cookie.

- **Auth:** Public (Rate limited: 10 req/15 min)
- **Body:**
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "SecurePassword123!",
  "role": "STUDENT"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "_id": "66c7f1a2b3c4d5e6f7a8b9c0",
      "name": "Alex Johnson",
      "email": "alex@example.com",
      "role": "STUDENT",
      "isVerified": false,
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### `POST /auth/login`
Authenticates a user, returns an access token in JSON, and sets an HttpOnly `refreshToken` cookie.

- **Auth:** Public (Rate limited: 10 req/15 min)
- **Body:**
```json
{
  "email": "alex@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Authentication successful.",
  "data": {
    "user": {
      "_id": "66c7f1a2b3c4d5e6f7a8b9c0",
      "name": "Alex Johnson",
      "email": "alex@example.com",
      "role": "STUDENT",
      "isVerified": true,
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### `POST /auth/refresh`
Rotates the session refresh token cookie and issues a fresh 15-minute access token.

- **Auth:** Cookie (`refreshToken`)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### `POST /auth/logout`
Invalidates the refresh token in the database and clears the client cookie.

- **Auth:** Authenticated (`Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully."
}
```

### `POST /auth/forgot-password`
Initiates a password reset flow and emails a time-limited reset token.

- **Auth:** Public (Rate limited: 5 req/15 min)
- **Body:** `{ "email": "alex@example.com" }`
- **Response (200 OK):** `{ "success": true, "message": "Password reset email sent if account exists." }`

### `POST /auth/reset-password`
Resets user password given a valid reset token.

- **Auth:** Public
- **Body:** `{ "token": "a1b2c3d4...", "newPassword": "NewSecurePassword456!" }`
- **Response (200 OK):** `{ "success": true, "message": "Password reset successfully." }`

### `POST /auth/verify-email`
Verifies user email address given the verification token.

- **Auth:** Public
- **Body:** `{ "token": "v1e2r3i4..." }`
- **Response (200 OK):** `{ "success": true, "message": "Email address has been verified successfully." }`

### `GET /auth/me`
Retrieves currently authenticated user profile.

- **Auth:** Authenticated
- **Response (200 OK):** Current User object with populated profile details.

---

## 6. Internship Discovery Endpoints

Base route: `/internships`

### `GET /internships`
Full-text search, filter, and paginate published internships.

- **Auth:** Public (optional auth enables user-specific bookmark flags)
- **Query Parameters:**
  - `search`: Keyword string (matches title, description, skills)
  - `category`: Category string (e.g. `Frontend`, `Backend`, `AI / ML`)
  - `remote`: `REMOTE` | `HYBRID` | `ONSITE`
  - `type`: `FULL_TIME` | `PART_TIME`
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 10, max: 50)
  - `sort`: `newest` | `deadline` | `popular`
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Internships retrieved successfully.",
  "data": [
    {
      "_id": "66c801a2b3c4d5e6f7a8b9c1",
      "title": "Software Engineer Intern (Full-Stack)",
      "slug": "software-engineer-intern-full-stack-66c801",
      "companyId": {
        "_id": "66c7a1a2b3c4d5e6f7a8b9c0",
        "name": "Stripe",
        "logo": "https://res.cloudinary.com/.../stripe.png",
        "verified": true
      },
      "skills": ["React", "Node.js", "TypeScript", "PostgreSQL"],
      "remote": "REMOTE",
      "type": "FULL_TIME",
      "duration": "3 Months",
      "stipend": {
        "amount": 55,
        "currency": "USD",
        "period": "HOUR",
        "isUnpaid": false
      },
      "openings": 4,
      "applicationDeadline": "2026-10-31T23:59:59.000Z",
      "status": "PUBLISHED",
      "isSaved": false
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 128, "totalPages": 13 }
}
```

### `GET /internships/:id`
Retrieves detailed information for a single internship by MongoDB ID or slug.

- **Auth:** Public (optional auth)
- **Response (200 OK):** Full Internship object including company details and application status.

### `POST /internships/:id/save`
Toggles bookmark status for the authenticated student.

- **Auth:** Authenticated (`STUDENT` role)
- **Response (200 OK):** `{ "success": true, "data": { "isSaved": true } }`

### `GET /internships/saved`
Retrieves bookmarked internships for the logged-in student.

- **Auth:** Authenticated (`STUDENT` role)
- **Response (200 OK):** Array of saved internship objects with pagination.

---

## 7. Student Applications Endpoints

Base route: `/applications`

### `POST /applications`
Submits an application for an active internship posting.

- **Auth:** Authenticated (`STUDENT` role, Verified email required)
- **Body:**
```json
{
  "internshipId": "66c801a2b3c4d5e6f7a8b9c1",
  "resume": {
    "url": "https://res.cloudinary.com/.../alex_resume.pdf",
    "publicId": "internhub/resumes/alex_resume_123",
    "fileName": "Alex_Johnson_Resume.pdf"
  },
  "coverLetter": "I am excited to apply for the Software Engineer internship..."
}
```
- **Response (201 Created):** Created Application object with timeline status `APPLIED`.

### `GET /applications/me`
Retrieves the logged-in student's application history.

- **Auth:** Authenticated (`STUDENT` role)
- **Query Parameters:** `status`, `page`, `limit`
- **Response (200 OK):** Array of application records with populated internship and company details.

### `GET /applications/:id`
Retrieves full details and timeline progression for a student's application.

- **Auth:** Authenticated (`STUDENT` role, Owner verification enforced)
- **Response (200 OK):** Single Application record with timeline history and interview details.

### `PATCH /applications/:id/withdraw`
Withdraws an active application.

- **Auth:** Authenticated (`STUDENT` role)
- **Body:** `{ "reason": "Accepted another offer" }`
- **Response (200 OK):** Updated Application record with status `WITHDRAWN`.

---

## 8. Student Profile Endpoints

Base route: `/student`

### `GET /student/profile`
Retrieves the student's complete professional profile.

- **Auth:** Authenticated (`STUDENT` role)
- **Response (200 OK):** StudentProfile object containing education, experience, projects, certifications, skills, preferences, and uploaded resume.

### `PUT /student/profile`
Updates student profile fields, structured experiences, and career preferences.

- **Auth:** Authenticated (`STUDENT` role)
- **Body:**
```json
{
  "headline": "Junior CS Student @ UC Berkeley | Full-Stack Developer",
  "bio": "Passionate about distributed systems and cloud infrastructure.",
  "skills": ["JavaScript", "React", "Node.js", "Python", "Docker"],
  "preferences": {
    "desiredRoles": ["Software Engineer", "Frontend Developer"],
    "remotePreference": "REMOTE"
  }
}
```
- **Response (200 OK):** Updated profile record.

---

## 9. Recruiter Management Endpoints

Base route: `/recruiter`

### `GET /recruiter/company`
Retrieves company profile owned by the authenticated recruiter.

- **Auth:** Authenticated (`RECRUITER` role)
- **Response (200 OK):** Company record.

### `PUT /recruiter/company`
Updates company branding, bio, website, industry, and headquarter location.

- **Auth:** Authenticated (`RECRUITER` role)
- **Body:** Company profile update payload.

### `GET /recruiter/internships`
Lists all internship postings created by the recruiter's company.

- **Auth:** Authenticated (`RECRUITER` role)
- **Query Parameters:** `status`, `page`, `limit`

### `POST /recruiter/internships`
Creates a new internship listing (initial status: `DRAFT` or `PUBLISHED`).

- **Auth:** Authenticated (`RECRUITER` role, Verified company required)
- **Body:** Full internship creation payload.

### `PUT /recruiter/internships/:id`
Updates internship requirements, stipend, duration, or openings (IDOR checked).

### `PATCH /recruiter/internships/:id/publish`
Publishes a draft internship to the public discovery feed.

### `PATCH /recruiter/internships/:id/close`
Closes applications for an active listing.

### `DELETE /recruiter/internships/:id`
Soft-archives or deletes an internship posting (ownership verified).

### `GET /recruiter/analytics`
Retrieves high-level hiring metrics, application counts, and pipeline conversion rates.

---

## 10. Interview Scheduling Endpoints

Base route: `/interviews`

### `POST /interviews/schedule`
Schedules an interview for an applicant.

- **Auth:** Authenticated (`RECRUITER` role)
- **Body:**
```json
{
  "applicationId": "66c811a2b3c4d5e6f7a8b9c2",
  "scheduledAt": "2026-09-15T15:00:00.000Z",
  "durationMinutes": 45,
  "type": "VIDEO",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "interviewer": {
    "name": "Sarah Miller",
    "email": "sarah@stripe.com"
  },
  "notes": "Technical screening focusing on data structures and system design."
}
```
- **Response (201 Created):** Created Interview record. Application timeline automatically updated to `INTERVIEW`.

### `PATCH /interviews/:id/reschedule`
Reschedules an interview and dispatches email/app notifications to candidate.

### `PATCH /interviews/:id/cancel`
Cancels an interview with an optional cancellation rationale.

### `POST /interviews/:id/feedback`
Submits recruiter rating (1-5) and interview assessment notes.

---

## 11. Upload & Document Endpoints

Base route: `/upload`

### `POST /upload/resume`
Uploads a student resume PDF (max 5MB) to cloud object storage.

- **Auth:** Authenticated (`STUDENT` role)
- **Content-Type:** `multipart/form-data`
- **Form Field:** `file` (PDF)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../resume_abc.pdf",
    "publicId": "internhub/resumes/resume_abc",
    "fileName": "Resume_2026.pdf",
    "fileSize": 412030,
    "mimeType": "application/pdf"
  }
}
```

### `POST /upload/avatar`
Uploads profile avatar image (`JPEG`, `PNG`, `WEBP`, max 2MB).

### `POST /upload/company-logo`
Uploads company branding logo image (`JPEG`, `PNG`, `WEBP`, `SVG`, max 2MB).

### `GET /upload/documents`
Lists all uploaded documents owned by the user.

### `DELETE /upload/documents/:id`
Deletes a document from both cloud storage and MongoDB.

---

## 12. Notification Endpoints

Base route: `/notifications`

### `GET /notifications`
Retrieves in-app notifications for the logged-in user.

- **Auth:** Authenticated
- **Query Parameters:** `read` (`true` | `false`), `page`, `limit`
- **Response (200 OK):** Notification array with unread counts.

### `PATCH /notifications/:id/read`
Marks a specific notification as read.

### `PATCH /notifications/read-all`
Marks all user notifications as read.

---

## 13. Admin & Platform Moderation Endpoints

Base route: `/admin`

All admin endpoints require an active session with role `ADMIN` or `SUPER_ADMIN`.

### `GET /admin/metrics`
Aggregates live platform metrics across users, companies, listings, and applications.

### `GET /admin/users`
Lists, searches, and filters all registered platform users.

### `PATCH /admin/users/:id/status`
Activates, deactivates, or alters role assignments for a user account (audited).

### `GET /admin/companies`
Lists companies pending manual verification.

### `PATCH /admin/companies/:id/verify`
Toggles verified badge status for a company (audited).

### `GET /admin/audit-logs`
Retrieves structured security and administrative audit event trail.

### `POST /admin/broadcast`
Sends a broadcast notification to all students, all recruiters, or all users.
