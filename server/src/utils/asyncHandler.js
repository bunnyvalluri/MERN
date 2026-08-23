/**
 * Wraps an async route handler to forward any thrown errors to Express's
 * next() function, eliminating repetitive try/catch blocks in every controller.
 *
 * Usage:
 *   router.get('/resource', asyncHandler(async (req, res) => {
 *     const data = await someService();
 *     res.json(new ApiResponse(200, 'Success', data));
 *   }));
 *
 * @param {Function} fn - Async Express route handler
 * @returns {Function}  - Express-compatible middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
