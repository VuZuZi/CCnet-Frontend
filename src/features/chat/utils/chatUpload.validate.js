import {
  CHAT_UPLOAD_ALLOWED_EXTENSIONS,
  CHAT_UPLOAD_ALLOWED_MIME_TYPES,
  CHAT_UPLOAD_LIMITS,
} from "../constants/chatUpload.constants";

function getExtension(filename = "") {
  const parts = String(filename).toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function isImageFile(file) {
  return String(file?.type || "").startsWith("image/");
}

function isVideoFile(file) {
  return String(file?.type || "").startsWith("video/");
}

function isAllowedFile(file) {
  const extension = getExtension(file?.name || "");
  const mimeType = String(file?.type || "").toLowerCase();

  if (isImageFile(file) || isVideoFile(file)) {
    return true;
  }

  return (
    CHAT_UPLOAD_ALLOWED_EXTENSIONS.includes(extension) ||
    CHAT_UPLOAD_ALLOWED_MIME_TYPES.includes(mimeType)
  );
}

export function formatChatFileSize(bytes = 0) {
  const value = Number(bytes || 0);

  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;

  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function getChatUploadHint() {
  return `Tối đa ${CHAT_UPLOAD_LIMITS.maxFiles} tệp, ảnh ${formatChatFileSize(
    CHAT_UPLOAD_LIMITS.maxImageSizeBytes
  )}/tệp, video ${formatChatFileSize(
    CHAT_UPLOAD_LIMITS.maxVideoSizeBytes
  )}/tệp, file ${formatChatFileSize(CHAT_UPLOAD_LIMITS.maxFileSizeBytes)}/tệp.`;
}

export function validateAndMergeChatFiles(existingFiles = [], selectedFiles = []) {
  const acceptedFiles = [];
  const rejectedMessages = [];
  const currentCount = Array.isArray(existingFiles) ? existingFiles.length : 0;

  for (const file of Array.isArray(selectedFiles) ? selectedFiles : []) {
    const nextCount = currentCount + acceptedFiles.length + 1;

    if (nextCount > CHAT_UPLOAD_LIMITS.maxFiles) {
      rejectedMessages.push(
        `Chỉ được gửi tối đa ${CHAT_UPLOAD_LIMITS.maxFiles} tệp trong một lần.`
      );
      break;
    }

    if (!isAllowedFile(file)) {
      rejectedMessages.push(`"${file.name}" không phải định dạng được hỗ trợ.`);
      continue;
    }

    if (isImageFile(file)) {
      if (Number(file.size || 0) > CHAT_UPLOAD_LIMITS.maxImageSizeBytes) {
        rejectedMessages.push(
          `Ảnh "${file.name}" vượt quá ${formatChatFileSize(
            CHAT_UPLOAD_LIMITS.maxImageSizeBytes
          )}.`
        );
        continue;
      }
    } else if (isVideoFile(file)) {
      if (Number(file.size || 0) > CHAT_UPLOAD_LIMITS.maxVideoSizeBytes) {
        rejectedMessages.push(
          `Video "${file.name}" vượt quá ${formatChatFileSize(
            CHAT_UPLOAD_LIMITS.maxVideoSizeBytes
          )}.`
        );
        continue;
      }
    } else if (Number(file.size || 0) > CHAT_UPLOAD_LIMITS.maxFileSizeBytes) {
      rejectedMessages.push(
        `Tệp "${file.name}" vượt quá ${formatChatFileSize(
          CHAT_UPLOAD_LIMITS.maxFileSizeBytes
        )}.`
      );
      continue;
    }

    acceptedFiles.push(file);
  }

  return {
    acceptedFiles,
    rejectedMessages: Array.from(new Set(rejectedMessages)),
  };
}

export function isVideoLikeFile(file) {
  return isVideoFile(file);
}

export function isImageLikeFile(file) {
  return isImageFile(file);
}