# InternHub Database Architecture & Indexes Specification

## 1. Overview
InternHub utilizes MongoDB Atlas with Mongoose ODM, configured for high-concurrency read queries, deduplicated writes, weighted full-text search, and automated audit logging.

---

## 2. Collections & Schemas

### A. `internships` Collection (`Internship.model.js`)

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique document identifier |
| `title` | String | required, indexed | Opportunity title (e.g. "Distributed Systems Intern") |
| `slug` | String | required, unique | SEO-optimized URL slug |
| `companyId` | ObjectId | ref: 'Company', optional | Reference to verified employer profile if registered |
| `companyName` | String | required, indexed | Company or organization name |
| `companyLogo` | String | optional | Clean CDN logo URL or favicon fallback |
| `companyWebsite`| String | optional | Official employer homepage URL |
| `source` | String | indexed, default: 'InternHub' | Sponsoring platform or source name (e.g., "Arbeitnow API") |
| `sourceType` | String | enum: `INTERNAL`, `API`, `ATS_PUBLIC`, `PARTNER_FEED` | Ingestion pipeline taxonomy |
| `externalId` | String | indexed, sparse | Source provider's native identifier |
| `canonicalUrl` | String | optional | Canonical employer application link |
| `fingerprint` | String | unique, sparse, indexed | SHA-256 hash for deduplication |
| `sources` | Array | `[{ name, externalId, url, lastSeenAt }]` | Multi-source provenance ledger |
| `status` | String | enum: `DRAFT`, `PUBLISHED`, `CLOSED`, `EXPIRED`, `REMOVED` | Moderation & lifecycle state |
| `freshnessState`| String | enum: `LIVE`, `RECENT`, `STALE`, `EXPIRED`, `REMOVED` | Real-time discovery freshness tier |
| `description` | String | required | Sanitized Markdown or plain text role description |
| `shortDescription`| String | optional | Truncated snippet for fast card rendering |
| `skills` | Array[String]| indexed | Technical skills and stack tags |
| `location` | Mixed | `{ city, state, country, remote }` | Structured location object |
| `workMode` | String | enum: `REMOTE`, `HYBRID`, `ONSITE` | Workplace policy |
| `stipend` | Object | `{ amount, currency, period, isUnpaid, minAmount, maxAmount }` | Authentic compensation structure |
| `salaryMin` | Number | indexed, optional | Lower compensation threshold for range queries |
| `salaryMax` | Number | indexed, optional | Upper compensation threshold for range queries |
| `applicationDeadline`| Date | indexed | Applications cutoff timestamp |
| `lastVerifiedAt`| Date | indexed, default: now | Timestamp when source feed last confirmed listing is live |
| `createdAt` | Date | indexed | Initial discovery / creation timestamp |

---

### B. `syncjobs` Collection (`SyncJob.model.js`)

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique sync run identifier |
| `jobId` | String | required, unique | Formatted string (e.g., `sync_arbeitnow_api_1740...`) |
| `source` | String | required, indexed | Source connector name |
| `sourceType` | String | enum: `INTERNAL`, `API`, `ATS_PUBLIC`, `PARTNER_FEED` | Source classification |
| `trigger` | String | enum: `SCHEDULED_SYNC`, `MANUAL_ADMIN`, `INITIAL_BOOT` | Execution trigger |
| `status` | String | enum: `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED` | Execution state |
| `itemsProcessed`| Number | default: 0 | Total raw records ingested in batch |
| `itemsCreated` | Number | default: 0 | New unique internships created |
| `itemsUpdated` | Number | default: 0 | Existing listings refreshed with updated metadata |
| `itemsSkipped` | Number | default: 0 | Duplicates or invalid records skipped |
| `errorsCount` | Number | default: 0 | Number of errors encountered during sync |
| `durationMs` | Number | default: null | Execution duration in milliseconds |
| `startedAt` | Date | default: now | Sync start timestamp |
| `completedAt` | Date | default: null | Sync termination timestamp |

---

## 3. Database Indexes

### Compound Indexes on `internships`:
```javascript
// 1. Primary Discovery Compound Filter Index
{ status: 1, freshnessState: 1, workMode: 1, createdAt: -1 }

// 2. Compensation Filter Index
{ status: 1, 'stipend.amount': -1, createdAt: -1 }

// 3. Deadline Expiration Sweeper Index
{ status: 1, applicationDeadline: 1 }

// 4. Source Provenance Index
{ source: 1, lastVerifiedAt: -1 }

// 5. Deduplication Unique Index
{ fingerprint: 1 }, { unique: true, sparse: true }
```

### Full-Text Weighted Search Index on `internships`:
```javascript
{
  title: 'text',
  companyName: 'text',
  skills: 'text',
  description: 'text',
  category: 'text'
},
{
  weights: {
    title: 10,
    companyName: 8,
    skills: 6,
    category: 4,
    description: 2
  },
  name: 'InternshipTextSearchIndex'
}
```

---

## 4. Production MongoDB Atlas Configuration
- **Connection Pooling**: `maxPoolSize: 50`, `minPoolSize: 10`, `serverSelectionTimeoutMS: 5000`.
- **Read Preference**: `secondaryPreferred` for discovery search queries to distribute load across replicas.
- **Write Concern**: `w: 'majority'` for critical user applications and `w: 1` for high-throughput batch ingestion upserts.
