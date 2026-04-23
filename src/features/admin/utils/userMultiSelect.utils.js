export const PAGE_SIZE = 20;

export function getRoleBadgeClasses(role) {
  const normalized = String(role || "").toLowerCase();

  if (normalized === "admin") {
    return "bg-violet-50 text-violet-700 border border-violet-200";
  }

  if (normalized === "organizer") {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }

  return "bg-slate-50 text-slate-600 border border-slate-200";
}

export function getRoleLabel(role) {
  const normalized = String(role || "").toLowerCase();

  if (normalized === "admin") return "Quản trị viên";
  if (normalized === "organizer") return "Nhà tổ chức";
  if (normalized === "user") return "Người dùng";

  return role || "Người dùng";
}

export function normalizeUsersResponse(response) {
  const payload = response?.data?.data;

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: null,
    };
  }

  return {
    items: payload?.items || [],
    pagination: payload?.pagination || null,
  };
}

export function mergeUniqueUsers(previousUsers, nextUsers) {
  const existingIds = new Set(previousUsers.map((item) => String(item._id)));
  const merged = [...previousUsers];

  for (const item of nextUsers) {
    if (!existingIds.has(String(item._id))) {
      merged.push(item);
    }
  }

  return merged;
}
