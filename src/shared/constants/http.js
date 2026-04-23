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
  [HTTP_STATUS.BAD_REQUEST]: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  [HTTP_STATUS.UNAUTHORIZED]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  [HTTP_STATUS.FORBIDDEN]: 'Bạn không có quyền thực hiện thao tác này.',
  [HTTP_STATUS.NOT_FOUND]: 'Không tìm thấy tài nguyên được yêu cầu.',
  [HTTP_STATUS.CONFLICT]: 'Thao tác này xung đột với dữ liệu hiện có.',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Không thể xử lý yêu cầu của bạn.',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Dịch vụ tạm thời không khả dụng.',
  DEFAULT: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
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
