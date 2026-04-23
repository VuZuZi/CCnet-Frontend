export function formatLogDate(value) {
  if (!value) return "Không rõ thời gian";

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function getNotificationHistoryStats(items = []) {
  return {
    total: items.length,
    allUsers: items.filter(
      (item) =>
        String(item?.notificationTargetType || item?.metadata?.targetType) ===
        "all"
    ).length,
    custom: items.filter((item) =>
      ["custom"].includes(
        String(item?.notificationTargetType || item?.metadata?.targetType)
      )
    ).length,
  };
}

export function normalizeRecipientUsers(users = []) {
  return (users || [])
    .map((user) => ({
      _id: String(user?._id || user?.id || "").trim(),
      fullName: String(user?.fullName || "").trim() || "Unknown user",
      email: String(user?.email || "").trim() || "--",
      role: String(user?.role || "").trim().toLowerCase() || "user",
      avatar: user?.avatar || null,
    }))
    .filter((user) => user._id);
}

export function normalizeHistoryItem(item) {
  return {
    title: item?.notificationTitle || item?.metadata?.title || "Không có tiêu đề",
    message: item?.notificationMessage || item?.metadata?.message || "--",
    severity: item?.notificationSeverity || item?.metadata?.severity || "info",
    targetType:
      item?.notificationTargetType || item?.metadata?.targetType || "all",
    actorName: item?.actorName || "Quản trị viên",
    actorEmail: item?.actorEmail || "--",
    actorRole: item?.actorRole || "--",
    roles: Array.isArray(item?.metadata?.roleSelections)
      ? item.metadata.roleSelections.map((selection) => selection.role)
      : [],
    roleSelections: Array.isArray(item?.metadata?.roleSelections)
      ? item.metadata.roleSelections
      : [],
    userIds: [],
    requestedUsers: normalizeRecipientUsers(item?.metadata?.requestedUsers || []),
    resolvedRecipientCount: item?.metadata?.resolvedRecipientCount ?? null,
    resolvedRecipientIds: Array.isArray(item?.metadata?.resolvedRecipientIds)
      ? item.metadata.resolvedRecipientIds
      : [],
    resolvedRecipients: normalizeRecipientUsers(
      item?.metadata?.resolvedRecipients || []
    ),
    resolutionBreakdown: Array.isArray(item?.metadata?.resolutionBreakdown)
      ? item.metadata.resolutionBreakdown
      : [],
  };
}
