import { Shield, User, Users } from "lucide-react";

export const ROLE_OPTIONS = [
  {
    value: "user",
    label: "Người dùng",
    icon: User,
  },
  {
    value: "organizer",
    label: "Tổ chức",
    icon: Users,
  },
  {
    value: "admin",
    label: "Quản trị viên",
    icon: Shield,
  },
];

export const SEVERITY_OPTIONS = [
  { value: "info", label: "Thông tin" },
  { value: "success", label: "Thành công" },
  { value: "warning", label: "Cảnh báo" },
  { value: "error", label: "Lỗi" },
];

export const EMPTY_ROLE_SELECTIONS = {
  user: [],
  organizer: [],
  admin: [],
};
