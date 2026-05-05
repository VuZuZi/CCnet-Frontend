export const normalizeProjectFeedId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return String(value._id || value.id || value.userId || "");
  }
  return "";
};

export const getProjectFeedAvatarFallback = (fullName) =>
  String(fullName || "U").slice(0, 1).toUpperCase();

export const formatProjectFeedDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời gian";
  return date.toLocaleString("vi-VN");
};

export const getProjectFeedFirstMedia = (post) =>
  Array.isArray(post?.media) && post.media.length > 0 ? post.media[0] : null;

export const PROJECT_FEED_MEDIA_MAX_SIZE_BYTES = 50 * 1024 * 1024;

export const PROJECT_FEED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const PROJECT_FEED_MEDIA_ACCEPT = PROJECT_FEED_MEDIA_MIME_TYPES.join(",");

export const validateProjectFeedMediaFile = (file) => {
  if (!file) return null;

  if (!PROJECT_FEED_MEDIA_MIME_TYPES.includes(file.type)) {
    return "Chỉ hỗ trợ ảnh JPEG, PNG, WEBP, GIF hoặc video MP4, WEBM, MOV.";
  }

  if (file.size > PROJECT_FEED_MEDIA_MAX_SIZE_BYTES) {
    return "Tệp quá lớn. Vui lòng chọn tệp không quá 50MB.";
  }

  return null;
};

export const isProjectFeedVideoMedia = (media) => {
  if (!media) return false;
  if (media.mediaType === "video") return true;
  const type = String(media?.type || media?.mimetype || "");
  const url = String(media?.url || "");
  const urlPath = url.split(/[?#]/)[0];
  return type.startsWith("video") || /\.(mp4|webm|mov)$/i.test(urlPath);
};

export const getProjectFeedPermissions = ({
  userId,
  isOrganizer,
  isVolunteerRole,
  applicationStatus,
}) => {
  const isApprovedVolunteer =
    isVolunteerRole && applicationStatus === "APPROVED";

  const canPost = Boolean(userId) && (isOrganizer || isApprovedVolunteer);
  const canEngage = Boolean(userId);

  return {
    isApprovedVolunteer,
    canPost,
    canUploadMedia: canPost,
    canEngage,
  };
};

export const getProjectFeedErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;
