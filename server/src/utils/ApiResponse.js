/**
 * Standardized API success response.
 *
 * Every successful response from InternHub follows this exact shape so
 * clients can parse responses without conditional logic.
 */
export class ApiResponse {
  /**
   * @param {number} statusCode  - HTTP status code (2xx)
   * @param {string} message     - Human-readable success message
   * @param {*}      data        - Response payload
   * @param {object} [pagination]- Optional pagination metadata
   */
  constructor(statusCode, message, data = null, pagination = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (pagination) {
      this.pagination = pagination;
    }
  }
}
