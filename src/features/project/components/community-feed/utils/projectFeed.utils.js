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

export const isProjectFeedVideoMedia = (media) => {
  if (!media) return false;
  const type = String(media?.type || media?.mimetype || "");
  const url = String(media?.url || "");
  return type.startsWith("video") || /\.(mp4|webm|mov)$/i.test(url);
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
  const canEngage = Boolean(userId) && (isOrganizer || isApprovedVolunteer);

  return {
    isApprovedVolunteer,
    canPost,
    canEngage,
  };
};

export const getProjectFeedErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;