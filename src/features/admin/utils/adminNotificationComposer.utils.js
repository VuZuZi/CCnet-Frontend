export function buildNotificationSummaryText({
  recipientMode,
  selectedRoles = [],
  roleSelections = {},
}) {
  if (recipientMode === "all") {
    return "Thông báo này sẽ được gửi đến tất cả người dùng.";
  }

  if (!selectedRoles.length) {
    return "Chọn một hoặc nhiều vai trò. Nếu vai trò chưa chọn người dùng cụ thể, hệ thống sẽ gửi đến toàn bộ vai trò đó.";
  }

  const parts = selectedRoles.map((role) => {
    const users = Array.isArray(roleSelections?.[role]) ? roleSelections[role] : [];
    if (users.length > 0) {
      return `${role}: ${users.length} selected`;
    }
    return `${role}: all users`;
  });

  return `Recipient plan: ${parts.join(" | ")}.`;
}

export function buildRoleSelectionsPayload({
  selectedRoles = [],
  roleSelections = {},
}) {
  return selectedRoles.map((role) => {
    const users = Array.isArray(roleSelections?.[role]) ? roleSelections[role] : [];

    return {
      role,
      userIds: [
        ...new Set(
          users
            .map((user) => user?._id || user?.id)
            .map((id) => String(id || "").trim())
            .filter(Boolean)
        ),
      ],
    };
  });
}

export function buildNotificationPayload({
  form,
  selectedRoles = [],
  roleSelections = {},
}) {
  const title = String(form?.title || "").trim();
  const message = String(form?.message || "").trim();

  if (!title) {
    throw new Error("Vui lòng nhập tiêu đề.");
  }

  if (!message) {
    throw new Error("Vui lòng nhập nội dung.");
  }

  const basePayload = {
    title,
    message,
    severity: form?.severity || "info",
  };

  if (form?.recipientMode === "all") {
    return {
      ...basePayload,
      targetType: "all",
    };
  }

  if (!selectedRoles.length) {
    throw new Error("Vui lòng chọn ít nhất một vai trò.");
  }

  const roleSelectionsPayload = buildRoleSelectionsPayload({
    selectedRoles,
    roleSelections,
  });

  return {
    ...basePayload,
    targetType: "custom",
    roleSelections: roleSelectionsPayload,
  };
}

export function getNotificationSuccessMessage(data) {
  if (data?.targetType === "all") {
    return "Đã gửi thông báo đến tất cả người dùng.";
  }

  const roleCount = Number(data?.totalRoles || 0);
  const requestedUserCount = Number(data?.totalUsers || 0);
  const resolvedCount = Number(data?.resolvedRecipientCount || 0);

  return `Đã gửi thông báo thành công (${roleCount} nhóm vai trò, ${requestedUserCount} người dùng được chọn, ${resolvedCount} người nhận cuối cùng).`;
}
