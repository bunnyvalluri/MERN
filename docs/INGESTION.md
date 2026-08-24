# InternHub Ingestion Pipeline & Deduplication Engine

## 1. Pipeline Stages

```
   ┌───────────────┐
   │ 1. FETCH      │  Connectors fetch raw batches with AbortController timeout & rate limiter
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ 2. VALIDATE   │  Filters invalid listings (short title, missing company name, missing source)
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ 3. NORMALIZE  │  Converts raw payload to canonical InternHub schema
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ 4. SANITIZE   │  Strips dangerous HTML script and iframe tags
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ 5. FINGERPRINT│  Calculates SHA-256 hash from normalized company, title, location, canonicalUrl
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ 6. UPSERT     │  Atomic MongoDB upsert; appends source reference without duplication
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ 7. EMIT & LOG │  Emits SSE event and records execution run in SyncJob ledger
   └───────────────┘
```

---

## 2. Ingestion Lifecycle Details

### Stage 1: Safe Fetch
Each connector executes `safeFetch(url, options)` with an isolated `AbortController` signal enforcing a maximum timeout (15,000ms). If the upstream server fails with 5xx or times out, the connector records the failure and increments its circuit breaker counter.

### Stage 2: Validation
Rejects empty or malformed objects. Enforces:
- `title.trim().length >= 2`
- `companyName.trim().length >= 2`
- `canonicalUrl` or valid application link

### Stage 3: Normalization
Maps disparate provider models to canonical format:
- Extracts work mode: `REMOTE`, `HYBRID`, `ONSITE`
- Parses compensation amounts, currency, and pay period (default: `MONTH`)
- Extracts and normalizes skills array: `['React', 'TypeScript', 'Node.js']`

### Stage 4: HTML Sanitization
Uses regular expressions and string transforms to strip `<script>` and `<iframe>` blocks, preserving safe markdown/text descriptions.

### Stage 5: Deduplication via SHA-256 Fingerprinting
```javascript
export function generateFingerprint(company, title, location, canonicalUrl) {
  const normCompany = (company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normTitle = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normLocation = (typeof location === 'object' ? `${location.city || ''} ${location.country || ''}` : location || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const normUrl = (canonicalUrl || '')
    .trim()
    .toLowerCase()
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');

  const rawKey = `${normCompany}|${normTitle}|${normLocation}|${normUrl}`;
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}
```

### Stage 6: Database Upsert
1. Queries database by `fingerprint`.
2. **If Document Exists**:
   - Updates `lastVerifiedAt` to `now`.
   - Appends `{ name, externalId, url, lastSeenAt: now }` to `sources[]` if not already present.
   - Refreshes freshness state to `LIVE`.
   - Increments `itemsUpdated`.
3. **If Document Is New**:
   - Generates unique slug: `generateSlug(title, company)`.
   - Sets `freshnessState: 'LIVE'`.
   - Inserts document into `internships`.
   - Increments `itemsCreated`.

### Stage 7: Event Bus Emission & Sync Audit
- Emits `SYSTEM_EVENTS.INTERNSHIP_CREATED` with the new listing object.
- Finalizes `SyncJob` record with `itemsProcessed`, `itemsCreated`, `itemsUpdated`, `itemsSkipped`, `errorsCount`, and `durationMs`.
