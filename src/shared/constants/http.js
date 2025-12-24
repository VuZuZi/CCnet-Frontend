export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export const HTTP_ERROR_MESSAGES = {
  [HTTP_STATUS.BAD_REQUEST]: 'Invalid request. Please check your input.',
  [HTTP_STATUS.UNAUTHORIZED]: 'Your session has expired. Please login again.',
  [HTTP_STATUS.FORBIDDEN]: 'You do not have permission to perform this action.',
  [HTTP_STATUS.NOT_FOUND]: 'The requested resource was not found.',
  [HTTP_STATUS.CONFLICT]: 'This action conflicts with existing data.',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Unable to process your request.',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too many requests. Please try again later.',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Server error. Please try again later.',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable.',
  DEFAULT: 'An unexpected error occurred. Please try again.',
};

export const getErrorMessage = (statusCode) => {
  return HTTP_ERROR_MESSAGES[statusCode] || HTTP_ERROR_MESSAGES.DEFAULT;
};

export const isClientError = (statusCode) => {
  return statusCode >= 400 && statusCode < 500;
};

export const isServerError = (statusCode) => {
  return statusCode >= 500 && statusCode < 600;
};