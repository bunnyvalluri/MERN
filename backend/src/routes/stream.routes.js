import { Router } from 'express';
import { eventBus, SYSTEM_EVENTS } from '../utils/eventBus.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/v1/internships/stream
 * Public Server-Sent Events (SSE) stream for real-time internship discovery updates.
 */
router.get('/', (req, res) => {
  // Set SSE response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
  });

  const clientId = req.requestId || Math.random().toString(36).slice(2, 9);
  logger.info(`[SSE Stream] Client connected: ${clientId}`);

  // Send initial handshake
  res.write(
    `data: ${JSON.stringify({
      type: 'connected',
      clientId,
      timestamp: new Date().toISOString(),
      message: 'Connected to InternHub Live 24/7 Discovery Stream',
    })}\n\n`
  );

  // Event handler callback
  const handleEvent = (eventName, data) => {
    try {
      res.write(
        `event: ${eventName}\ndata: ${JSON.stringify({
          type: eventName,
          ...data,
          emittedAt: new Date().toISOString(),
        })}\n\n`
      );
    } catch {
      // Client stream might be closed
    }
  };

  // Register event listeners
  const onCreated = (data) => handleEvent(SYSTEM_EVENTS.INTERNSHIP_CREATED, data);
  const onUpdated = (data) => handleEvent(SYSTEM_EVENTS.INTERNSHIP_UPDATED, data);
  const onExpired = (data) => handleEvent(SYSTEM_EVENTS.INTERNSHIP_EXPIRED, data);
  const onSyncCompleted = (data) => handleEvent(SYSTEM_EVENTS.SYNC_COMPLETED, data);

  eventBus.on(SYSTEM_EVENTS.INTERNSHIP_CREATED, onCreated);
  eventBus.on(SYSTEM_EVENTS.INTERNSHIP_UPDATED, onUpdated);
  eventBus.on(SYSTEM_EVENTS.INTERNSHIP_EXPIRED, onExpired);
  eventBus.on(SYSTEM_EVENTS.SYNC_COMPLETED, onSyncCompleted);

  // Keep-alive heartbeat every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 25_000);

  // Clean up on disconnect
  req.on('close', () => {
    logger.info(`[SSE Stream] Client disconnected: ${clientId}`);
    clearInterval(heartbeat);
    eventBus.removeListener(SYSTEM_EVENTS.INTERNSHIP_CREATED, onCreated);
    eventBus.removeListener(SYSTEM_EVENTS.INTERNSHIP_UPDATED, onUpdated);
    eventBus.removeListener(SYSTEM_EVENTS.INTERNSHIP_EXPIRED, onExpired);
    eventBus.removeListener(SYSTEM_EVENTS.SYNC_COMPLETED, onSyncCompleted);
  });
});

export default router;
