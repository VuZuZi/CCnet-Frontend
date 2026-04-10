export const CHAT_UPLOAD_LIMITS = {
  maxFiles: 10,
  maxImageSizeBytes: 10 * 1024 * 1024,
  maxVideoSizeBytes: 20 * 1024 * 1024,
  maxFileSizeBytes: 25 * 1024 * 1024,
};

export const CHAT_UPLOAD_ACCEPT =
  "image/*,video/mp4,video/webm,video/quicktime,.mov,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar";

export const CHAT_UPLOAD_ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "mp4",
  "webm",
  "mov",
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
  "video/mp4",
  "video/webm",
  "video/quicktime",
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