# InternHub Observability, Ingestion Monitoring & Telemetry

## 1. System Health & Observability Metrics

InternHub provides real-time telemetry across all ingestion pipelines, database operations, and user discovery flows:

1. **Connector Health Metrics**:
   - Status: `HEALTHY`, `WARNING`, `ERROR`, `DISABLED`
   - Circuit Breaker State: `CLOSED`, `HALF_OPEN`, `OPEN`
   - Consecutive Failures count & Cooldown timers
   - Total items fetched, processed, and skipped
   - Latency per upstream request
2. **Ingestion Audit Ledger (`SyncJob`)**:
   - Records every execution run, trigger type (`SCHEDULED_SYNC`, `MANUAL_ADMIN`, `INITIAL_BOOT`), duration in milliseconds, and detailed error logs.
3. **Real-time SSE Connection Telemetry**:
   - Active client stream connections count
   - Broadcast message distribution rate

---

## 2. Admin Telemetry API

### Endpoint: `GET /api/v1/admin/sources`
Returns live JSON status for each connector:
```json
[
  {
    "name": "Arbeitnow API",
    "type": "API",
    "status": "HEALTHY",
    "circuitOpen": false,
    "failureCount": 0,
    "totalFetchedCount": 240,
    "lastSuccessfulSync": "2026-08-24T14:30:00.000Z",
    "syncIntervalMinutes": 30
  }
]
```

---

## 3. Log Structured Format (Winston)

```json
{
  "timestamp": "2026-08-24 14:30:00",
  "level": "info",
  "message": "[Ingestion] Ingestion completed for [Arbeitnow API] in 745ms",
  "metadata": {
    "source": "Arbeitnow API",
    "itemsProcessed": 50,
    "itemsCreated": 4,
    "itemsUpdated": 46,
    "durationMs": 745
  }
}
```
