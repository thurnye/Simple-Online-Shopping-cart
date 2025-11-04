import { Response } from "express";

/**
 * Standard API response structure matching TradeByBarter format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Error response structure
 */
export interface ApiErrorResponse {
  success: boolean;
  data: null;
  errors: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
}

/**
 * Success response helper - matches TradeByBarter format
 */
export const success = <T>(
  res: Response,
  data?: T,
  message?: string,
  meta?: any,
  statusCode = 200
): Response => {
  let pagination;
  if (meta && typeof meta === "object" && ("page" in meta || "totalPages" in meta)) {
    pagination = {
      page: meta.page || 1,
      limit: meta.limit || 12,
      total: meta.total || 0,
      pages: meta.totalPages || meta.pages || 0,
    };
  }

  const response: ApiResponse<T> = {
    success: true,
    data: data !== undefined ? data : null,
    ...(message && { message }),
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(response);
};

/**
 * Error response helper
 */
export const fail = (
  res: Response,
  message: string,
  statusCode = 400,
  code?: string
): Response => {
  const response: ApiErrorResponse = {
    success: false,
    data: null,
    errors: [
      {
        code: code || getErrorCodeFromStatus(statusCode),
        message,
      },
    ],
  };
  return res.status(statusCode).json(response);
};

/**
 * Helper to map status codes to error codes
 */
function getErrorCodeFromStatus(statusCode: number): string {
  const codeMap: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    429: "RATE_LIMIT_ERROR",
    500: "INTERNAL_ERROR",
    503: "SERVICE_UNAVAILABLE",
  };
  return codeMap[statusCode] || "ERROR";
}

/**
 * Multiple errors response helper
 */
export const failWithErrors = (
  res: Response,
  errors: Array<{ code: string; message: string; field?: string }>,
  statusCode = 400
): Response => {
  const response: ApiErrorResponse = {
    success: false,
    data: null,
    errors,
  };
  return res.status(statusCode).json(response);
};

/**
 * Pagination meta helper
 */
export const paginationMeta = (page: number, limit: number, total: number) => {
  const pages = Math.ceil(total / limit);
  return { page, limit, total, pages };
};

/**
 * Create success response object (without sending)
 */
export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  pagination?: { page: number; limit: number; total: number; pages: number }
): ApiResponse<T> => ({
  success: true,
  data,
  ...(message && { message }),
  ...(pagination && { pagination }),
});

/**
 * Create error response object (without sending)
 */
export const createErrorResponse = (errors: Array<{ code: string; message: string; field?: string }>): ApiErrorResponse => ({
  success: false,
  data: null,
  errors,
});

