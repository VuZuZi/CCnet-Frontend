import { Shield, User, Users } from "lucide-react";

export const ROLE_OPTIONS = [
  {
    value: "user",
    label: "User",
    icon: User,
  },
  {
    value: "organizer",
    label: "Organizer",
    icon: Users,
  },
  {
    value: "admin",
    label: "Admin",
    icon: Shield,
  },
];

export const SEVERITY_OPTIONS = [
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

export const EMPTY_ROLE_SELECTIONS = {
  user: [],
  organizer: [],
  admin: [],
};