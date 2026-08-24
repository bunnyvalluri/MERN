# InternHub Real-Time Server-Sent Events (SSE) Stream

## 1. Architecture Overview

InternHub implements HTTP Server-Sent Events (SSE) for low-latency, battery-efficient, unidirectional live updates from the backend to client discovery feeds.

```
┌─────────────────────────┐          ┌───────────────────────┐
│ Ingestion / Freshness   │          │ Central EventBus      │
│ Services                ├─────────►│ (Node.js EventEmitter)│
└─────────────────────────┘          └───────────┬───────────┘
                                                 │
                                                 │ eventBus.on(...)
                                                 ▼
                                     ┌───────────────────────┐
                                     │ SSE Express Handler   │
                                     │ GET /stream           │
                                     └───────────┬───────────┘
                                                 │
                                                 │ text/event-stream
                                                 ▼
                                     ┌───────────────────────┐
                                     │ React useSSEStream    │
                                     │ (Client Browser)      │
                                     └───────────────────────┘
```

---

## 2. Server Implementation (`backend/src/routes/stream.routes.js`)

### Response Headers
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

### Keep-Alive Heartbeat
To prevent intermediate proxies, firewalls, and load balancers from terminating idle HTTP connections, the server sends a keep-alive comment every 25 seconds:
```javascript
const keepAliveTimer = setInterval(() => {
  res.write(': keepalive\n\n');
}, 25000);
```

### Event Formatting
```javascript
function sendEvent(res, eventName, data) {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}
```

---

## 3. Supported Event Types

| Event Name | Payload | Client Action |
| :--- | :--- | :--- |
| `internship.created` | New Internship document | Increments `newArrivalsCount` and displays banner. |
| `internship.updated` | Updated Internship document | Refreshes card timestamps in-place. |
| `internship.expired` | `{ id: "..." }` | Removes expired card from current view if present. |
| `internship.sync_completed` | `{ source, itemsCreated, timestamp }` | Logs sync telemetry to debug console. |

---

## 4. Frontend Integration (`frontend/src/hooks/useSSEStream.js`)

```javascript
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { incomingInternshipCreated, incomingInternshipExpired } from '../features/internships/internshipSlice.js';

export function useSSEStream(enabled = true) {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const es = new EventSource('/api/v1/internships/stream', { withCredentials: true });

    es.onopen = () => setIsConnected(true);
    es.addEventListener('internship.created', (e) => {
      dispatch(incomingInternshipCreated(JSON.parse(e.data)));
    });
    es.addEventListener('internship.expired', (e) => {
      dispatch(incomingInternshipExpired(JSON.parse(e.data)));
    });
    es.onerror = () => setIsConnected(false);

    return () => es.close();
  }, [enabled, dispatch]);

  return { isConnected };
}
```
