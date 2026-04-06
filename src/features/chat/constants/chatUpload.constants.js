export const CHAT_UPLOAD_LIMITS = {
  maxFiles: 10,
  maxImageSizeBytes: 10 * 1024 * 1024,
  maxFileSizeBytes: 25 * 1024 * 1024,
};

export const CHAT_UPLOAD_ACCEPT =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar";

export const CHAT_UPLOAD_ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
  "zip",
  "rar",
];

export const CHAT_UPLOAD_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
];