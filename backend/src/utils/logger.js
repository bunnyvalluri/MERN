import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// ─── Sensitive Field Scrubber ─────────────────────────────────────────────────
/**
 * List of keys whose values must NEVER appear in logs.
 * Covers passwords, tokens, secrets, and PII-adjacent credentials.
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'newpassword',
  'currentpassword',
  'confirmpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'resettoken',
  'verificationtoken',
  'secret',
  'apikey',
  'privatekey',
  'authorization',
  'cookie',
  'set-cookie',
  'creditcard',
  'cardnumber',
  'cvv',
  'ssn',
]);

/**
 * Recursively sanitizes an object by replacing sensitive field values with '[REDACTED]'.
 * Safe to call on any value — non-objects are returned as-is.
 *
 * @param {*} obj - Value to sanitize
 * @param {number} [depth=0] - Current recursion depth (max 5 to prevent circular ref issues)
 * @returns {*}
 */
export const sanitize = (obj, depth = 0) => {
  if (depth > 5 || obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => sanitize(item, depth + 1));

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value, depth + 1);
    } else {
      clean[key] = value;
    }
  }
  return clean;
};

// ─── Formats ─────────────────────────────────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp: ts, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(sanitize(meta))}` : '';
    return stack
      ? `[${ts}] ${level}: ${message}${metaStr}\n${stack}`
      : `[${ts}] ${level}: ${message}${metaStr}`;
  })
);

/**
 * Production format: structured JSON with static base fields on every entry.
 * These fields make it trivial to filter by service/environment in log aggregators.
 */
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format((info) => {
    // Attach static base fields
    info.service = 'internhub-api';
    info.environment = process.env.NODE_ENV || 'production';
    info.version = process.env.npm_package_version || '1.0.0';
    // Sanitize any metadata passed alongside the log message
    const { level, message, timestamp: ts, service, environment, version, stack, ...meta } = info;
    return {
      level,
      message,
      timestamp: ts,
      service,
      environment,
      version,
      ...(stack ? { stack } : {}),
      ...sanitize(meta),
    };
  })(),
  winston.format.json()
);

// ─── Logger Instance ──────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  // Use 'info' in production so HTTP request logs are captured (was 'warn' — too quiet).
  // Set LOG_LEVEL env var to override (e.g. 'debug' for troubleshooting prod issues).
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
  // Prevent winston from exiting on uncaught exceptions handled elsewhere
  exitOnError: false,
});

