import { InternshipService } from '../services/internship.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/v1/internships
 * Public endpoint to search, filter, and paginate published internships.
 */
export const getInternships = asyncHandler(async (req, res) => {
  const studentId = req.user ? req.user._id : null;
  const result = await InternshipService.getInternships(req.query, studentId);

  res.status(200).json(
    new ApiResponse(200, 'Internships fetched successfully.', result)
  );
});

/**
 * GET /api/v1/internships/:id
 * Public endpoint to fetch single internship details by ID or slug.
 */
export const getInternshipById = asyncHandler(async (req, res) => {
  const studentId = req.user ? req.user._id : null;
  const result = await InternshipService.getInternshipById(req.params.id, studentId);

  res.status(200).json(
    new ApiResponse(200, 'Internship details fetched successfully.', result)
  );
});

/**
 * POST /api/v1/internships/:id/save
 * Authenticated student endpoint to toggle save / bookmark status.
 */
export const toggleSaveInternship = asyncHandler(async (req, res) => {
  const result = await InternshipService.toggleSaveInternship(req.user._id, req.params.id);

  res.status(200).json(
    new ApiResponse(200, result.message, { isSaved: result.isSaved })
  );
});

/**
 * GET /api/v1/internships/saved
 * Authenticated student endpoint to list all saved bookmarks.
 */
export const getSavedInternships = asyncHandler(async (req, res) => {
  const result = await InternshipService.getSavedInternships(req.user._id, req.query);

  res.status(200).json(
    new ApiResponse(200, 'Saved internships fetched successfully.', result)
  );
});

export default {
  getInternships,
  getInternshipById,
  toggleSaveInternship,
  getSavedInternships,
};
