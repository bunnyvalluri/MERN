# InternHub — Dedicated Database Layer

This directory contains the database management layer for the InternHub full-stack platform: automated seeders, index managers, diagnostics, data fixtures, and schema definitions for MongoDB.

```
database/
├── indexes/
│   └── ensure_indexes.js     # Builds, validates & audits all MongoDB schema indexes
├── schemas/
│   └── README.md             # ER diagrams, relation maps & data dictionary
├── scripts/
│   ├── db_status.js          # Connection check, latency test & collection statistics
│   └── reset_db.js           # Safe development database wipe, re-indexing & re-seeding
├── seeds/
│   ├── data/
│   │   └── mockData.js       # Production-realistic fixtures (Admins, Recruiters, Students, Jobs)
│   └── seed.js               # Idempotent master seed runner
└── README.md                 # Database layer overview & CLI reference
```

---

## Quickstart Database Commands

All database commands can be executed from the root of the project:

### 1. Seed Database with Realistic Data
Populates the database with default accounts (Admin, Recruiters, Students), companies, realistic internship postings, sample applications, interviews, and notifications.
```bash
npm run db:seed
```

### 2. Check Database Health & Stats
Connects to MongoDB, measures round-trip latency, and prints document counts across all 9 collections along with index tallies:
```bash
npm run db:status
```

### 3. Ensure & Synchronize Indexes
Builds and verifies all compound indexes, unique constraints, and full-text search indexes:
```bash
npm run db:indexes
```

### 4. Full Reset (Wipe + Re-seed + Re-index)
Drops collections in development, rebuilds indexes, and executes the master seeder:
```bash
npm run db:reset
```

---

## Seed Accounts & Credentials

| Role | Email | Default Password | Notes |
|:-----|:------|:-----------------|:------|
| **Admin** | `admin@internhub.dev` | `AdminPassword123!` | Platform ops & analytics access |
| **Recruiter** (Stripe) | `sarah.jenkins@stripe.com` | `RecruiterPassword123!` | Manages Stripe internship listings |
| **Recruiter** (Google) | `mchen@google.com` | `RecruiterPassword123!` | Manages Google postings & reviews |
| **Recruiter** (Microsoft) | `elena.rostova@microsoft.com` | `RecruiterPassword123!` | Manages Microsoft postings |
| **Student** (Stanford) | `jordan.lee@stanford.edu` | `StudentPassword123!` | Full profile with education & apps |
| **Student** (MIT) | `maya.patel@mit.edu` | `StudentPassword123!` | ML/AI specialist with apps |
| **Student** (Berkeley) | `lucas.wright@berkeley.edu` | `StudentPassword123!` | Frontend & UI engineer profile |

---

## Docker MongoDB Local Setup

If you do not have MongoDB running locally, you can start a pre-configured MongoDB 7.0 container via Docker Compose from the project root:

```bash
# Start MongoDB in the background
docker-compose up -d mongodb

# Seed the newly created MongoDB instance
npm run db:seed
```
