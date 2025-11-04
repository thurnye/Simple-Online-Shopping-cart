/**
 * Custom API Error class for centralized error handling
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}

export const Errors = {
  badRequest: (message = "Bad Request") => new ApiError(400, message),
  unauthorized: (message = "Unauthorized") => new ApiError(401, message),
  forbidden: (message = "Forbidden") => new ApiError(403, message),
  notFound: (message = "Not Found") => new ApiError(404, message),
  conflict: (message = "Conflict") => new ApiError(409, message),
  unprocessableEntity: (message = "Unprocessable Entity") => new ApiError(422, message),
  internalServer: (message = "Internal Server Error") => new ApiError(500, message, false),
};

export const mapErrorToResponse = (error: Error | ApiError) => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      success: false,
      message: error.message,
    };
  }
  return {
    statusCode: 500,
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
  };
};
