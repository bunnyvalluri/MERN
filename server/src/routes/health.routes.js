import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller.js';

const router = Router();

/**
 * @route  GET /api/v1/health
 * @access Public
 * @desc   Liveness probe — returns 200 when the API is running
 */
router.get('/', healthCheck);

export default router;
