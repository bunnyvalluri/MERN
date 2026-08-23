import { StudentService } from '../services/student.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/v1/students/me
 * Retrieves current student's full profile and completion metric.
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const result = await StudentService.getOwnProfile(req.user._id);

  res.status(200).json(
    new ApiResponse(200, 'Student profile fetched successfully.', result)
  );
});

/**
 * PUT /api/v1/students/me
 * Updates current student's profile information.
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const result = await StudentService.updateOwnProfile(req.user._id, req.body);

  res.status(200).json(
    new ApiResponse(200, 'Profile updated successfully.', result)
  );
});

/**
 * POST /api/v1/students/me/resume
 * Uploads or updates student resume.
 */
export const uploadResume = asyncHandler(async (req, res) => {
  const { url, fileName, publicId } = req.body;
  const result = await StudentService.updateResume(req.user._id, { url, fileName, publicId });

  res.status(200).json(
    new ApiResponse(200, 'Resume uploaded successfully.', result)
  );
});

/**
 * DELETE /api/v1/students/me/resume
 * Removes current resume.
 */
export const deleteResume = asyncHandler(async (req, res) => {
  const result = await StudentService.deleteResume(req.user._id);

  res.status(200).json(
    new ApiResponse(200, 'Resume removed successfully.', result)
  );
});

/**
 * GET /api/v1/students/:id
 * Retrieves public profile view for recruiters and admins.
 */
export const getStudentById = asyncHandler(async (req, res) => {
  const result = await StudentService.getPublicProfile(req.params.id);

  res.status(200).json(
    new ApiResponse(200, 'Student profile retrieved successfully.', result)
  );
});

export default {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  deleteResume,
  getStudentById,
};
