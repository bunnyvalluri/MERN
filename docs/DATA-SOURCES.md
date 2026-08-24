# InternHub Authorized Data Sources & Legal Compliance

## 1. Legal & Ethical Ingestion Principles

InternHub strictly adheres to modern internet data rights, provider terms of service, and anti-abuse policies:

1. **No Unauthorized Scraping**: InternHub does not scrape web pages without permission, bypass CAPTCHA systems, circumvent Cloudflare/anti-bot mechanisms, or evade `robots.txt` directives.
2. **Authorized Public Feeds**: All ingested records originate from published, publicly documented REST endpoints and developer feeds intended for job syndication.
3. **Attribution & Provenance**: Every listing prominently credits its original source (e.g. `Arbeitnow API`, `Jobicy API`, `Greenhouse ATS`, `InternHub Verified`) with canonical backlinks directly to the employer or board.
4. **Resilient Rate-Limiting**: Connectors enforce conservative rate limits with polite request throttling, exponential backoff, and circuit breakers.

---

## 2. Integrated Source Connectors

### A. Arbeitnow Public Job Board API
- **Connector**: `ArbeitnowConnector.js`
- **Type**: `API`
- **Endpoint**: `https://www.arbeitnow.com/api/job-board-api`
- **Protocol**: HTTP GET JSON
- **Terms / License**: Public developer API for job search syndication.
- **Sync Cadence**: Every 30 minutes.
- **Focus**: Global & European Software Engineering, Full-Stack, and Cloud internships.

### B. Jobicy Public Engineering Feed
- **Connector**: `JobicyConnector.js`
- **Type**: `API`
- **Endpoint**: `https://jobicy.com/api/v2/remote-jobs?count=50&industry=engineering`
- **Protocol**: HTTP GET JSON
- **Terms / License**: Public developer endpoint for remote tech opportunities.
- **Sync Cadence**: Every 30 minutes.
- **Focus**: Remote engineering, AI, DevOps, and systems development.

### C. Greenhouse Public Careers ATS
- **Connector**: `GreenhousePublicConnector.js`
- **Type**: `ATS_PUBLIC`
- **Endpoint**: `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`
- **Protocol**: HTTP GET JSON
- **Terms / License**: Public company job boards hosted on Greenhouse ATS.
- **Sync Cadence**: Every 60 minutes.
- **Focus**: Early-career roles at leading tech organizations.

### D. Direct Employer & Recruiter Postings
- **Connector**: `InternalEmployerConnector.js`
- **Type**: `INTERNAL`
- **Protocol**: Database Reconciler
- **Sync Cadence**: Every 15 minutes.
- **Focus**: Verified opportunities published directly by registered employer partners.

---

## 3. Connector Health & Circuit Breaker Thresholds

| Connector | Sync Interval | Timeout | Max Retries | Failure Threshold | Cooldown |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Arbeitnow API** | 30 mins | 15,000ms | 2 | 3 consecutive failures | 300 seconds |
| **Jobicy API** | 30 mins | 15,000ms | 2 | 3 consecutive failures | 300 seconds |
| **Greenhouse ATS** | 60 mins | 15,000ms | 2 | 3 consecutive failures | 300 seconds |
| **Internal Employer** | 15 mins | 5,000ms | 1 | 3 consecutive failures | 60 seconds |
