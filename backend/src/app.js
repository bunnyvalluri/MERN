import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import studentRouter from './routes/student.routes.js';
import internshipRouter from './routes/internship.routes.js';
import companyRouter from './routes/company.routes.js';
import recruiterRouter from './routes/recruiter.routes.js';
import applicationRouter from './routes/application.routes.js';
import interviewRouter from './routes/interview.routes.js';
import notificationRouter from './routes/notification.routes.js';
import uploadRouter from './routes/upload.routes.js';
import adminRouter from './routes/admin.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { requestIdMiddleware } from './middleware/requestId.middleware.js';
import { httpLoggerMiddleware } from './middleware/httpLogger.middleware.js';

const app = express();

// ─── Request ID (must be FIRST so all downstream handlers have req.requestId) ─
app.use(requestIdMiddleware);

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Client-Version'],
  })
);

// ─── Global rate limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please try again later.',
  },
});
app.use(globalLimiter);

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ─── Structured HTTP logging (replaces morgan) ───────────────────────────────
app.use(httpLoggerMiddleware);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/students', studentRouter);
app.use('/api/v1/internships', internshipRouter);
app.use('/api/v1/companies', companyRouter);
app.use('/api/v1/recruiter', recruiterRouter);
app.use('/api/v1/applications', applicationRouter);
app.use('/api/v1/interviews', interviewRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/admin', adminRouter);
// app.use('/api/v1/analytics',     analyticsRouter);
// app.use('/api/v1/upload',        uploadRouter);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
