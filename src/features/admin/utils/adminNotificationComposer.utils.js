export function buildNotificationSummaryText({
  recipientMode,
  selectedRoles = [],
  roleSelections = {},
}) {
  if (recipientMode === "all") {
    return "This notification will be sent to all users.";
  }

  if (!selectedRoles.length) {
    return "Choose one or more roles. If a role has no selected users, the system will send to the entire role.";
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
    throw new Error("Title is required.");
  }

  if (!message) {
    throw new Error("Message is required.");
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
    throw new Error("Please choose at least one role.");
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
    return "Notification sent to all users.";
  }

  const roleCount = Number(data?.totalRoles || 0);
  const requestedUserCount = Number(data?.totalUsers || 0);
  const resolvedCount = Number(data?.resolvedRecipientCount || 0);

  return `Notification sent successfully (${roleCount} role group(s), ${requestedUserCount} selected user(s), ${resolvedCount} final recipient(s)).`;
}