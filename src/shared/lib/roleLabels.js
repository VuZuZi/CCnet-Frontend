export function getRoleLabel(role, fallback = "Người dùng") {
  const normalized = String(role || "").toLowerCase();

  if (normalized === "admin") return "Quản trị viên";
  if (normalized === "organizer") return "Tổ chức";
  if (normalized === "user") return "Người dùng";
  if (normalized === "donor") return "Nhà tài trợ";

  return role || fallback;
}
