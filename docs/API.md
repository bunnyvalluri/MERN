# InternHub REST API & Real-Time SSE Stream Specification

## Base URL
- Local Development: `http://localhost:5000/api/v1`
- Production: `https://api.internhub.dev/api/v1`

---

## 1. Discovery API Endpoints

### `GET /internships`
Fetches a paginated, filtered, and sorted list of authentic internships.

**Query Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | String | `""` | Full-text query on title, company, skills, description |
| `location` | String | `""` | City, country, or state filter |
| `remote` / `workMode` | String | `"ALL"` | `"REMOTE"`, `"HYBRID"`, `"ONSITE"`, or `"ALL"` |
| `category` | String | `"ALL"` | Job category / industry classification |
| `skills` | String | `""` | Comma-separated list of required technologies |
| `minStipend` / `maxStipend` | Number | `null` | Compensation thresholds |
| `sortBy` | String | `"latest"` | `"latest"`, `"deadline"`, `"stipend_high"`, `"stipend_low"`, `"popularity"` |
| `datePosted` | String | `"all"` | `"24h"`, `"7d"`, `"30d"`, or `"all"` |
| `page` | Integer | `1` | Page number |
| `limit` | Integer | `12` | Items per page (max 50) |

**Sample Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64b1f2a3c9e77a0012345681",
        "title": "Systems Engineering Intern",
        "slug": "systems-engineering-intern-at-stripe-9f2b1c",
        "companyName": "Stripe",
        "companyLogo": "https://www.google.com/s2/favicons?domain=stripe.com&sz=128",
        "source": "Arbeitnow API",
        "sourceType": "API",
        "workMode": "REMOTE",
        "location": { "city": "Dublin", "country": "Ireland" },
        "stipend": { "amount": 8500, "currency": "USD", "period": "MONTH" },
        "skills": ["Go", "Distributed Systems", "Kubernetes"],
        "freshnessState": "LIVE",
        "applicationMethod": "EXTERNAL",
        "applicationUrl": "https://stripe.com/jobs/9f2b1c",
        "lastVerifiedAt": "2026-08-24T14:30:00.000Z",
        "createdAt": "2026-08-24T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 148,
      "totalPages": 13
    },
    "lastSyncedAt": "2026-08-24T14:30:00.000Z"
  }
}
```

---

### `GET /internships/:idOrSlug`
Retrieves full details of a specific internship by its MongoDB `_id` or unique `slug`.

**Sample Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "internship": {
      "_id": "64b1f2a3c9e77a0012345681",
      "title": "Systems Engineering Intern",
      "slug": "systems-engineering-intern-at-stripe-9f2b1c",
      "companyName": "Stripe",
      "description": "Join our infrastructure team designing payment core systems.",
      "skills": ["Go", "Distributed Systems", "Kubernetes"],
      "stipend": { "amount": 8500, "currency": "USD", "period": "MONTH" },
      "source": "Arbeitnow API",
      "canonicalUrl": "https://stripe.com/jobs/9f2b1c",
      "sources": [
        {
          "name": "Arbeitnow API",
          "externalId": "arbeitnow_4921",
          "url": "https://arbeitnow.com/jobs/4921",
          "lastSeenAt": "2026-08-24T14:30:00.000Z"
        }
      ],
      "lastVerifiedAt": "2026-08-24T14:30:00.000Z"
    },
    "isSaved": false,
    "hasApplied": false
  }
}
```

---

## 2. Real-Time Server-Sent Events (SSE) Stream

### `GET /internships/stream`
Establishes a persistent Server-Sent Events HTTP connection for live discovery streaming.

**Headers:**
- `Accept: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

**Stream Event Protocol:**

```
: keepalive

event: internship.created
data: {"_id":"64b1...","title":"AI Engineer Intern","companyName":"OpenAI","source":"Jobicy API","stipend":{"amount":9500,"currency":"USD"}}

event: internship.expired
data: {"id":"64b1...","title":"Frontend Intern"}

event: internship.sync_completed
data: {"source":"Arbeitnow API","itemsCreated":4,"itemsUpdated":12,"timestamp":"2026-08-24T14:45:00.000Z"}
```

---

## 3. Admin Ingestion & Telemetry Endpoints

### `GET /admin/sources`
Returns all registered ingestion connectors and their real-time health telemetry.

**Headers:** `Authorization: Bearer <ADMIN_JWT>`

**Sample Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Arbeitnow API",
      "type": "API",
      "enabled": true,
      "status": "HEALTHY",
      "circuitOpen": false,
      "failureCount": 0,
      "totalFetchedCount": 240,
      "lastSuccessfulSync": "2026-08-24T14:30:00.000Z",
      "syncIntervalMinutes": 30
    },
    {
      "name": "Jobicy API",
      "type": "API",
      "enabled": true,
      "status": "HEALTHY",
      "circuitOpen": false,
      "failureCount": 0,
      "totalFetchedCount": 180,
      "lastSuccessfulSync": "2026-08-24T14:30:00.000Z",
      "syncIntervalMinutes": 30
    }
  ]
}
```

---

### `POST /admin/sync-jobs/trigger`
Manually triggers an immediate ingestion cycle for a specific connector or all connectors.

**Headers:** `Authorization: Bearer <ADMIN_JWT>`

**Request Body:**
```json
{
  "source": "Arbeitnow API"
}
```

**Sample Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Sync run initiated successfully for Arbeitnow API",
  "data": {
    "source": "Arbeitnow API",
    "status": "COMPLETED",
    "itemsProcessed": 50,
    "itemsCreated": 3,
    "itemsUpdated": 47,
    "durationMs": 842
  }
}
```

---

### `GET /admin/sync-jobs`
Retrieves paginated audit logs of all past ingestion execution runs.

**Headers:** `Authorization: Bearer <ADMIN_JWT>`
