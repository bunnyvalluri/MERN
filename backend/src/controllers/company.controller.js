import { CompanyService } from '../services/company.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/v1/companies
 * Public endpoint to list verified companies with search and pagination.
 */
export const getCompanies = asyncHandler(async (req, res) => {
  const result = await CompanyService.getCompanies(req.query);
  res.status(200).json(
    new ApiResponse(200, 'Companies fetched successfully.', result)
  );
});

/**
 * GET /api/v1/companies/industries
 * Public endpoint to get distinct industry list for filters.
 */
export const getIndustries = asyncHandler(async (req, res) => {
  const industries = await CompanyService.getIndustries();
  res.status(200).json(
    new ApiResponse(200, 'Industries fetched successfully.', { industries })
  );
});

/**
 * GET /api/v1/companies/:slug
 * Public endpoint to get single company details with active internships.
 */
export const getCompanyBySlug = asyncHandler(async (req, res) => {
  const result = await CompanyService.getCompanyBySlug(req.params.slug);
  res.status(200).json(
    new ApiResponse(200, 'Company details fetched successfully.', result)
  );
});

export default { getCompanies, getIndustries, getCompanyBySlug };
