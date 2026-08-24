# InternHub System Architecture & Discovery Engine

## 1. Overview
InternHub is a production-grade, multi-source internship and early-career job discovery platform engineered for high-throughput aggregation, verified data provenance, SHA-256 deduplication, continuous background synchronization, and real-time Server-Sent Events (SSE) updates.

```
                                 ┌──────────────────────────────────────────────┐
                                 │              External Sources                │
                                 │  (Arbeitnow API, Jobicy, Greenhouse ATS)     │
                                 └──────────────────────┬───────────────────────┘
                                                        │ (Authorized HTTP Feeds)
                                                        ▼
┌──────────────────────┐         ┌──────────────────────────────────────────────┐
│  Recruiter Postings  ├────────►│       Pluggable Connector Framework          │
└──────────────────────┘         │   (Circuit Breaker, Rate Limiter, Retry)     │
                                 └──────────────────────┬───────────────────────┘
                                                        │ (Normalized Raw Items)
                                                        ▼
                                 ┌──────────────────────────────────────────────┐
                                 │         Ingestion & Pipeline Engine          │
                                 │  1. Validation & Schema Enforcement          │
                                 │  2. HTML Sanitization & Safety               │
                                 │  3. Deterministic SHA-256 Fingerprinting     │
                                 │  4. Deduplication & Source Merging           │
                                 │  5. Upsert & Compound Indexing               │
                                 └──────────────┬───────────────────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        ┌─────────────────────────────┐                   ┌─────────────────────────────┐
        │        MongoDB Atlas        │                   │     EventBus (EventEmitter) │
        │ (Compound Indexes, FTS)     │                   └──────────────┬──────────────┘
        └──────────────┬──────────────┘                                  │
                       │ (Indexed Queries)                               ▼
                       ▼                                  ┌─────────────────────────────┐
        ┌─────────────────────────────┐                   │ Real-Time SSE Stream Route  │
        │      Discovery REST API     │                   │ GET /api/v1/internships/    │
        │   (/api/v1/internships)     │                   │     stream                  │
        └──────────────┬──────────────┘                   └──────────────┬──────────────┘
                       │                                                 │
                       └────────────────────────┬────────────────────────┘
                                                │
                                                ▼
                                 ┌─────────────────────────────┐
                                 │   Frontend React 19 Client  │
                                 │  (Redux Toolkit, Tailwind,  │
                                 │   Real-Time Ingestion Toast)│
                                 └─────────────────────────────┘
```

---

## 2. Core Architecture Principles

1. **Zero Fake or Synthetic Data Fallbacks**: All listings originate from authenticated employer submissions or authorized public API feeds with complete provenance tracking (`source`, `sourceType`, `sourceUrl`, `canonicalUrl`, `lastVerifiedAt`).
2. **Pluggable Source Connector Framework**: Modular connectors extending `JobSourceConnector` provide dedicated normalization, rate-limiting, exponential backoff, and circuit breaker trip thresholds.
3. **Deterministic SHA-256 Deduplication**: Identical opportunities published across multiple boards are merged into a canonical document containing a `sources[]` ledger without duplicates.
4. **Lifecycle & Freshness Transitions**: Dynamic state management (`LIVE` -> `RECENT` -> `STALE` -> `EXPIRED` -> `REMOVED`) ensures closed roles are automatically retired from discovery feeds.
5. **Real-time Event-Driven Distribution**: Server-Sent Events (`EventSource`) push live sync notifications to client browsers with zero polling.

---

## 3. Component Breakdown

### A. Pluggable Source Connector Framework (`backend/src/connectors/`)
- `JobSourceConnector.js`: Abstract base class implementing rate-limiting, timeout guards (15s default), exponential retry with jitter, circuit breaker mechanics (trips after 3 consecutive failures, 5-minute cooldown), and telemetry tracking.
- `ArbeitnowConnector.js`: Ingests authorized European/Global tech internship and software job feeds.
- `JobicyConnector.js`: Ingests engineering and technology roles via Jobicy public JSON endpoints.
- `GreenhousePublicConnector.js`: Ingests verified early-career job boards directly from Greenhouse ATS career portals.
- `InternalEmployerConnector.js`: Reconciles directly submitted recruiter requisitions with the discovery index.
- `SourceRegistry.js`: Centralized catalog providing runtime connector registration, dynamic enable/disable controls, and metrics aggregation.

### B. Ingestion & Deduplication Pipeline (`backend/src/services/ingestion.service.js`)
1. **Fetch**: Connectors retrieve raw batches with timeouts and rate limits.
2. **Validate**: Ensures minimum title length, company name, and source validity.
3. **Normalize**: Maps vendor-specific data structures into canonical InternHub schema.
4. **Sanitize**: Strips `<script>`, `<iframe>`, and dangerous HTML elements.
5. **Fingerprint**: Computes SHA-256 hash:
   $$\text{Hash} = \text{SHA256}(\text{normCompany} \parallel \text{normTitle} \parallel \text{normLocation} \parallel \text{normCanonicalUrl})$$
6. **Upsert**: Performs atomic database upsert. If fingerprint exists, adds new source reference to `sources[]` array and updates `lastVerifiedAt`.
7. **Audit & Emit**: Records execution in `SyncJob` collection and emits `internship.created` / `internship.updated` events over `eventBus`.

### C. Background Scheduler & Freshness Worker (`backend/src/services/`)
- `scheduler.service.js`: Background task runner executing periodic ingestion cycles and freshness sweeps.
- `freshness.service.js`: Inspects application deadlines, marks passed deadlines as `EXPIRED`, and transitions active listings (`LIVE` < 24h, `RECENT` < 7d, `STALE` > 7d).

### D. Discovery API & Query Engine (`backend/src/services/internship.service.js`)
- Full-text weighted search indexing (`title`: 10, `companyName`: 8, `skills`: 6, `description`: 2).
- Compound filters: location regex, workMode (`REMOTE`/`HYBRID`/`ONSITE`), category, skill arrays, minimum/maximum compensation, and duration.
- Sorting options: `latest`, `deadline`, `stipend_high`, `stipend_low`, `popularity`.

---

## 4. Fault Tolerance & Resiliency Patterns

| Mechanism | Implementation | Purpose |
| :--- | :--- | :--- |
| **Circuit Breaker** | 3 consecutive failures -> `OPEN` (5m cooldown) | Prevents cascade failures when external APIs experience outages. |
| **Timeout Guard** | `AbortController` (15,000ms max) | Prevents hung socket connections from depleting thread pools. |
| **Exponential Backoff** | $1000\text{ms} \times 2^{\text{retry}}$ with jitter | Gracefully retries transient network glitches. |
| **Graceful Shutdown** | SIGINT/SIGTERM handlers in `server.js` | Drains pending sync jobs and closes MongoDB connections cleanly. |
