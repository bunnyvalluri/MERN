import { Router } from 'express';
import {
  getCompanies,
  getIndustries,
  getCompanyBySlug,
} from '../controllers/company.controller.js';

const router = Router();

// GET /api/v1/companies               → paginated list of verified companies
router.get('/', getCompanies);

// GET /api/v1/companies/industries    → distinct industry names for filters
router.get('/industries', getIndustries);

// GET /api/v1/companies/:slug         → single company detail + active internships
router.get('/:slug', getCompanyBySlug);

export default router;
