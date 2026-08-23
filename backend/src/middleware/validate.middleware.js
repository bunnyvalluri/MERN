import { ApiError } from '../utils/ApiError.js';

/**
 * Higher-order middleware to validate incoming request data using Joi schemas.
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {'body'|'query'|'params'} [source='body'] - Request property to validate
 */
export const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true, // Strips unpermitted fields automatically
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      return next(new ApiError(400, 'Validation failed', errorDetails));
    }

    // Replace request payload with sanitized, validated data
    req[source] = value;
    next();
  };
};

export default validate;
