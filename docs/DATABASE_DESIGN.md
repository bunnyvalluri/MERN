# InternHub — Database Architecture & Schema Specification

> **Database Engine:** MongoDB Atlas (v7.0+)  
> **ODM:** Mongoose (v8.x)  
> **Version:** 1.0.0  
> **Status:** Active & Implemented  

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Entity Relationship Architecture](#2-entity-relationship-architecture)
3. [Collections & Schema Definitions](#3-collections--schema-definitions)
   - [Users (`users`)](#users)
   - [Student Profiles (`studentProfiles`)](#student-profiles)
   - [Companies (`companies`)](#companies)
   - [Internships (`internships`)](#internships)
   - [Applications (`applications`)](#applications)
   - [Notifications (`notifications`)](#notifications)
   - [Saved Internships (`savedInternships`)](#saved-internships)
   - [Interviews (`interviews`)](#interviews)
   - [Documents (`documents`)](#documents)
   - [Audit Logs (`auditLogs`)](#audit-logs)
4. [Indexing Strategy & Optimization](#4-indexing-strategy--optimization)
5. [Data Integrity & Duplicate Prevention](#5-data-integrity--duplicate-prevention)
6. [Connection Management & Resilience](#6-connection-management--resilience)

---

## 1. Architectural Overview

InternHub's database architecture leverages a **hybrid relational-document design**:
- **Normalized Root Documents:** Entities with independent lifecycles (`users`, `companies`, `internships`, `applications`) are normalized into distinct collections and linked via `ObjectId` references.
- **Embedded Subdocuments:** Tightly-coupled, bounded entities (`education`, `experience`, `projects`, `timeline`, `recruiterNotes`) are embedded directly inside their parent documents to minimize expensive `$lookup` aggregations during high-frequency profile and dashboard reads.
- **Strict Bounded Arrays:** Subdocuments in arrays are strictly bounded to prevent 16MB BSON document limits.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          MONGODB ATLAS CLUSTER                         │
│                                                                        │
│   ┌──────────────┐         1:1         ┌─────────────────────────┐    │
│   │    users     │────────────────────►│     studentProfiles     │    │
│   └──────┬───────┘                     └─────────────────────────┘    │
│          │                                                            │
│          │ 1:M (owner)                                                │
│          ▼                                                            │
│   ┌──────────────┐         1:M         ┌─────────────────────────┐    │
│   │  companies   │────────────────────►│       internships       │    │
│   └──────────────┘                     └────────────┬────────────┘    │
│                                                     │                 │
│                                                     │ 1:M             │
│                                                     ▼                 │
│   ┌──────────────┐         1:M         ┌─────────────────────────┐    │
│   │    users     │────────────────────►│      applications       │    │
│   │  (students)  │                     └────────────┬────────────┘    │
│   └──────┬───────┘                                  │                 │
│          │                                          │ 1:M             │
│          │ 1:M                                      ▼                 │
│          ▼                             ┌─────────────────────────┐    │
│   ┌──────────────┐                     │       interviews        │    │
│   │notifications │                     └─────────────────────────┘    │
│   └──────────────┘                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Entity Relationship Architecture

| Source Collection | Target Collection | Cardinality | Reference Field | Strategy |
|---|---|---|---|---|
| `users` | `studentProfiles` | 1 : 1 | `studentProfiles.userId` | Normalized, unique index |
| `users` | `companies` | 1 : M | `companies.ownerId` | Normalized, indexed |
| `companies` | `internships` | 1 : M | `internships.companyId` | Normalized, indexed |
| `users` (student) | `applications` | 1 : M | `applications.studentId` | Normalized, indexed |
| `internships` | `applications` | 1 : M | `applications.internshipId` | Compound unique index `(internshipId, studentId)` |
| `applications` | `interviews` | 1 : M | `interviews.applicationId` | Normalized, indexed |
| `users` | `notifications` | 1 : M | `notifications.userId` | Normalized, compound indexed |
| `users` | `savedInternships` | 1 : M | `savedInternships.studentId` | Compound unique index `(studentId, internshipId)` |
| `users` | `documents` | 1 : M | `documents.userId` | Normalized, indexed |
| `users` | `auditLogs` | 1 : M | `auditLogs.userId` | Immutable append-only log |

---

## 3. Collections & Schema Definitions

### Users (`users`)
Authenticates all roles (STUDENT, RECRUITER, ADMIN, SUPER_ADMIN).

```javascript
{
  _id: ObjectId,
  name: String (required, minlength: 2, maxlength: 100),
  email: String (required, unique, lowercase, trimmed),
  passwordHash: String (required, select: false),
  role: Enum ['STUDENT', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN'] (default: 'STUDENT'),
  avatar: String (URL or null),
  isActive: Boolean (default: true),
  isVerified: Boolean (default: false),
  verificationToken: String (select: false),
  verificationTokenExpiresAt: Date (select: false),
  passwordResetToken: String (select: false),
  passwordResetExpiresAt: Date (select: false),
  refreshToken: String (select: false),
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Student Profiles (`studentProfiles`)
Houses comprehensive academic background, verified skills, and career preferences.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required, unique),
  headline: String (maxlength: 200),
  bio: String (maxlength: 3000),
  phone: String,
  location: { city: String, state: String, country: String },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    gpa: String
  }],
  skills: [String] (multikey index),
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  projects: [{
    title: String,
    description: String,
    link: String,
    githubUrl: String,
    technologies: [String]
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String
  }],
  resume: { url: String, publicId: String, fileName: String, uploadedAt: Date },
  portfolio: String,
  github: String,
  linkedin: String,
  preferences: {
    desiredRoles: [String],
    targetLocations: [String],
    remotePreference: Enum ['REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE'],
    expectedStipend: { amount: Number, currency: String, period: String }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Companies (`companies`)
Verified corporate hiring entities.

```javascript
{
  _id: ObjectId,
  name: String (required, maxlength: 150),
  slug: String (required, unique, lowercase, trimmed),
  logo: String,
  description: String (required, maxlength: 5000),
  website: String,
  industry: String (required),
  location: { city: String, state: String, country: String, address: String },
  companySize: Enum ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
  foundedYear: Number (min: 1800),
  verified: Boolean (default: false),
  ownerId: ObjectId (ref: 'User', required),
  createdAt: Date,
  updatedAt: Date
}
```

### Internships (`internships`)
Job postings with compensation, deadlines, and skill tagging.

```javascript
{
  _id: ObjectId,
  companyId: ObjectId (ref: 'Company', required),
  title: String (required, maxlength: 200),
  slug: String (required, unique, lowercase),
  description: String (required, maxlength: 10000),
  responsibilities: [String],
  requirements: [String],
  skills: [String] (required, multikey indexed),
  location: { city: String, state: String, country: String },
  remote: Enum ['REMOTE', 'HYBRID', 'ONSITE'] (default: 'REMOTE'),
  type: Enum ['FULL_TIME', 'PART_TIME'] (default: 'FULL_TIME'),
  duration: String,
  stipend: {
    amount: Number (default: 0),
    currency: String (default: 'USD'),
    period: Enum ['HOUR', 'MONTH', 'TOTAL'],
    isUnpaid: Boolean (default: false)
  },
  openings: Number (default: 1, min: 1),
  applicationDeadline: Date (required),
  status: Enum ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'] (default: 'DRAFT'),
  category: String,
  viewsCount: Number (default: 0),
  applicationsCount: Number (default: 0),
  createdBy: ObjectId (ref: 'User', required),
  createdAt: Date,
  updatedAt: Date
}
```

### Applications (`applications`)
Central tracking entity linking a student to an internship opportunity.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: 'User', required),
  internshipId: ObjectId (ref: 'Internship', required),
  companyId: ObjectId (ref: 'Company', required),
  resume: { url: String, publicId: String, fileName: String },
  coverLetter: String (maxlength: 5000),
  status: Enum [
    'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED',
    'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'
  ] (default: 'APPLIED'),
  timeline: [{
    status: String,
    changedAt: Date,
    changedBy: ObjectId (ref: 'User'),
    note: String
  }],
  notes: [{
    authorId: ObjectId (ref: 'User'),
    content: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 4. Indexing Strategy & Optimization

Indexes are designed to satisfy equality, sort, and range (`ESR` rule) query patterns.

### Unique Indexes (Guaranteed Uniqueness)
| Collection | Fields | Constraint Purpose |
|---|---|---|
| `users` | `{ email: 1 }` | Prevents duplicate user accounts |
| `studentProfiles` | `{ userId: 1 }` | Guarantees 1:1 user-to-profile mapping |
| `companies` | `{ slug: 1 }` | Unique SEO URL identifiers |
| `internships` | `{ slug: 1 }` | Unique opportunity URLs |
| `applications` | `{ internshipId: 1, studentId: 1 }` | **Prevents duplicate applications** |
| `savedInternships` | `{ studentId: 1, internshipId: 1 }` | Prevents saving an internship multiple times |

### Compound Indexes (High-Speed Filtering & Sorting)
```javascript
// internships: Category discovery & deadline queries
internships.createIndex({ companyId: 1, status: 1 });
internships.createIndex({ status: 1, applicationDeadline: 1 });
internships.createIndex({ status: 1, remote: 1, createdAt: -1 });
internships.createIndex({ skills: 1, status: 1 });

// applications: Recruiter & candidate pipeline queries
applications.createIndex({ studentId: 1, status: 1, createdAt: -1 });
applications.createIndex({ companyId: 1, status: 1, createdAt: -1 });
applications.createIndex({ internshipId: 1, status: 1 });

// notifications: Unread badge counters
notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });

// interviews: Calendar schedule views
interviews.createIndex({ studentId: 1, scheduledAt: 1, status: 1 });
interviews.createIndex({ companyId: 1, scheduledAt: 1, status: 1 });

// auditLogs: Fast forensic lookup
auditLogs.createIndex({ resource: 1, resourceId: 1, createdAt: -1 });
auditLogs.createIndex({ userId: 1, createdAt: -1 });
auditLogs.createIndex({ action: 1, createdAt: -1 });
```

### Full-Text Search Indexes
```javascript
// Weighted keyword discovery across titles, skills, and descriptions
internships.createIndex(
  { title: 'text', skills: 'text', description: 'text' },
  { weights: { title: 10, skills: 6, description: 1 }, name: 'internship_text_index' }
);

studentProfiles.createIndex(
  { headline: 'text', skills: 'text', bio: 'text' },
  { weights: { skills: 10, headline: 5, bio: 1 }, name: 'student_text_index' }
);
```

---

## 5. Data Integrity & Duplicate Prevention

1. **Duplicate Application Prevention:**
   Enforced at database layer through `{ internshipId: 1, studentId: 1 }` unique index. Even in high-concurrency race conditions, MongoDB will reject duplicate insertions with error code `11000`.
2. **Duplicate Bookmark Prevention:**
   Enforced via `{ studentId: 1, internshipId: 1 }` on `savedInternships`.
3. **Email Normalization:**
   Mongoose schema forces `lowercase: true` and `trim: true` on user registration before indexing.
4. **Referential Integrity:**
   All references use standard `mongoose.Schema.Types.ObjectId` pointing to their respective models.

---

## 6. Connection Management & Resilience

InternHub's connection module in `server/src/config/db.js` provides:
- **Connection Pool Tuning:** `maxPoolSize: 10`, `minPoolSize: 2`
- **Timeout Protection:** `serverSelectionTimeoutMS: 5000`, `socketTimeoutMS: 45000`
- **Automatic Reconnection:** Event listeners automatically detect and log cluster state transitions
- **Health Check Integration:** `getDBStatus()` executes real-time `admin().ping()` probes for automated container orchestration.

---

*End of DATABASE_DESIGN.md*
