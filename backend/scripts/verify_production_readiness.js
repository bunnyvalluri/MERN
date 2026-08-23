import { ApiError } from '../src/utils/ApiError.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import { sanitize } from '../src/utils/logger.js';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../src/utils/token.utils.js';
import { sanitizeFileName } from '../src/middleware/upload.middleware.js';

console.log('=============================================================================');
console.log('               INTERNHUB PRE-DEPLOYMENT PRODUCTION VERIFICATION              ');
console.log('=============================================================================\n');

let passedChecks = 0;
let totalChecks = 0;

function assertCheck(name, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedChecks++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

// ─── 1. Environment & Secrets Check ───────────────────────────────────────────
assertCheck('JWT Secret Security & Token Verification', () => {
  const payload = { id: '64f1a2b3c4d5e6f7a8b9c0d1', role: 'STUDENT' };
  const token = generateAccessToken(payload);
  if (!token || typeof token !== 'string') throw new Error('Failed to sign JWT access token');

  const decoded = verifyAccessToken(token);
  if (decoded.id !== payload.id || decoded.role !== payload.role) {
    throw new Error('Decoded token payload mismatch');
  }

  const refreshToken = generateRefreshToken(payload);
  if (!refreshToken) throw new Error('Failed to sign refresh token');
});

// ─── 2. Production Stack Trace Privacy Check ─────────────────────────────────
assertCheck('Production Error Handler: Stack Trace Suppression', () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  const mockError = new Error('Secret internal database connection failure');
  const mockReq = { requestId: 'prod-trace-test-uuid', method: 'GET', originalUrl: '/test' };
  let capturedResponse = null;
  let capturedStatus = null;

  const mockRes = {
    status(code) {
      capturedStatus = code;
      return this;
    },
    json(body) {
      capturedResponse = body;
    },
  };

  errorHandler(mockError, mockReq, mockRes, () => {});

  process.env.NODE_ENV = originalEnv;

  if (capturedStatus !== 500) throw new Error(`Expected 500 status, got ${capturedStatus}`);
  if (capturedResponse.stack !== undefined) throw new Error('CRITICAL: Stack trace leaked in production response!');
  if (capturedResponse.code !== 'INTERNAL_ERROR') throw new Error('Expected INTERNAL_ERROR code');
  if (capturedResponse.requestId !== 'prod-trace-test-uuid') throw new Error('Missing requestId in error response');
  if (capturedResponse.message !== 'An unexpected error occurred.') {
    throw new Error(`Exposed raw error message: ${capturedResponse.message}`);
  }
});

// ─── 3. Sensitive Data & Credential Scrubbing Check ──────────────────────────
assertCheck('Sensitive Log Sanitization Scrubber', () => {
  const dirtyPayload = {
    username: 'alex_test',
    password: 'SuperSecretPassword123!',
    token: 'eyJhbGciOiJIUzI1NiIsIn...',
    refreshToken: 'secret_refresh_token_here',
    nested: {
      apiKey: 'sk_live_123456789',
      creditCard: '4111222233334444',
      safeField: 'active',
    },
  };

  const clean = sanitize(dirtyPayload);
  if (clean.password !== '[REDACTED]') throw new Error('Password was not redacted');
  if (clean.token !== '[REDACTED]') throw new Error('Token was not redacted');
  if (clean.refreshToken !== '[REDACTED]') throw new Error('RefreshToken was not redacted');
  if (clean.nested.apiKey !== '[REDACTED]') throw new Error('Nested apiKey was not redacted');
  if (clean.nested.creditCard !== '[REDACTED]') throw new Error('Credit card was not redacted');
  if (clean.nested.safeField !== 'active') throw new Error('Safe fields were altered incorrectly');
});

// ─── 4. File Upload Path Traversal Sanitization ──────────────────────────────
assertCheck('File Upload Path Traversal & Name Sanitization', () => {
  const maliciousName = '../../etc/passwd%00_resume.pdf';
  const cleanName = sanitizeFileName(maliciousName);
  if (cleanName.includes('..') || cleanName.includes('/') || cleanName.includes('\\')) {
    throw new Error(`Filename traversal characters not stripped: ${cleanName}`);
  }
});

// ─── 5. ApiError Machine-Readable Code Mapping ───────────────────────────────
assertCheck('ApiError Factory Codes & Operational Classifications', () => {
  const notFound = ApiError.notFound('Internship posting');
  if (notFound.statusCode !== 404 || notFound.code !== 'NOT_FOUND') {
    throw new Error('ApiError.notFound failed');
  }

  const unauthorized = ApiError.unauthorized();
  if (unauthorized.statusCode !== 401 || unauthorized.code !== 'UNAUTHORIZED') {
    throw new Error('ApiError.unauthorized failed');
  }

  const forbidden = ApiError.forbidden();
  if (forbidden.statusCode !== 403 || forbidden.code !== 'FORBIDDEN') {
    throw new Error('ApiError.forbidden failed');
  }

  const validation = ApiError.validationError([{ field: 'title', message: 'Required' }]);
  if (validation.statusCode !== 400 || validation.code !== 'VALIDATION_ERROR') {
    throw new Error('ApiError.validationError failed');
  }
});

console.log(`\n=============================================================================`);
console.log(`Results: ${passedChecks}/${totalChecks} Production Checks Passed (${Math.round((passedChecks/totalChecks)*100)}%)`);
console.log(`=============================================================================\n`);

if (passedChecks !== totalChecks) {
  process.exit(1);
}
