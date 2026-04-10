import { useMemo, useState } from "react";
import {
  BellRing,
  Check,
  SendHorizontal,
  Shield,
  User,
  Users,
} from "lucide-react";
import { adminAPI } from "../api/adminAPI";
import UserMultiSelect from "./UserMultiSelect";

const CUSTOM_ROLE_OPTIONS = [
  {
    value: "user",
    label: "User",
    icon: User,
    chipClass:
      "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300",
    activeClass:
      "border-slate-300 bg-slate-900 text-white shadow-sm",
  },
  {
    value: "organizer",
    label: "Organizer",
    icon: Users,
    chipClass:
      "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300",
    activeClass:
      "border-amber-400 bg-amber-500 text-white shadow-sm",
  },
  {
    value: "admin",
    label: "Admin",
    icon: Shield,
    chipClass:
      "border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300",
    activeClass:
      "border-violet-400 bg-violet-500 text-white shadow-sm",
  },
];

const SEVERITY_OPTIONS = [
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

export default function AdminNotificationComposer() {
  const [form, setForm] = useState({
    title: "",
    message: "",
    severity: "info",
    recipientMode: "all", // all | custom
  });

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const summaryText = useMemo(() => {
    if (form.recipientMode === "all") {
      return "This notification will be sent to all users.";
    }

    const parts = [];

    if (selectedRoles.length) {
      parts.push(`roles: ${selectedRoles.join(", ")}`);
    }

    if (selectedUsers.length) {
      parts.push(`${selectedUsers.length} specific user(s)`);
    }

    return parts.length
      ? `Custom recipients selected: ${parts.join(" + ")}.`
      : "Choose one or more roles and/or add specific users.";
  }, [form.recipientMode, selectedRoles, selectedUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccessMessage("");
    setErrorMessage("");

    if (name === "recipientMode" && value === "all") {
      setSelectedRoles([]);
      setSelectedUsers([]);
    }
  };

  const toggleRole = (roleValue) => {
    setSelectedRoles((prev) =>
      prev.includes(roleValue)
        ? prev.filter((item) => item !== roleValue)
        : [...prev, roleValue]
    );
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      severity: form.severity,
    };

    if (!payload.title) {
      setErrorMessage("Title is required.");
      return;
    }

    if (!payload.message) {
      setErrorMessage("Message is required.");
      return;
    }

    if (form.recipientMode === "all") {
      payload.targetType = "all";
    } else {
      payload.targetType = "custom";
      payload.roles = selectedRoles;
      payload.userIds = selectedUsers.map((user) => user._id);

      if (!payload.roles.length && !payload.userIds.length) {
        setErrorMessage("Please choose at least one role or one specific user.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const response = await adminAPI.createNotification(payload);
      const data = response?.data?.data || response?.data || null;

      if (data?.targetType === "all") {
        setSuccessMessage("Notification sent to all users.");
      } else {
        const roleCount = data?.totalRoles || 0;
        const userCount = data?.totalUsers || 0;
        setSuccessMessage(
          `Notification sent successfully (${roleCount} role group(s), ${userCount} specific user(s)).`
        );
      }

      setForm({
        title: "",
        message: "",
        severity: "info",
        recipientMode: "all",
      });
      setSelectedRoles([]);
      setSelectedUsers([]);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send notification.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-inner">
          <BellRing size={22} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Send system notification
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Send to all users or build a custom recipient list with role groups
            and specific users.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={200}
            placeholder="System maintenance tonight"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Message
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            maxLength={1000}
            placeholder="We will perform a scheduled update at 10:00 PM tonight."
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Recipient mode
            </label>

            <div className="relative">
              <select
                name="recipientMode"
                value={form.recipientMode}
                onChange={handleChange}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              >
                <option value="all">All users</option>
                <option value="custom">Custom recipients</option>
              </select>

              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Severity
            </label>

            <div className="relative">
              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              >
                {SEVERITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {summaryText}
          </div>
        </div>

        {form.recipientMode === "custom" ? (
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Role groups
              </label>

              <div className="flex flex-wrap gap-3">
                {CUSTOM_ROLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = selectedRoles.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleRole(option.value)}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        isActive ? option.activeClass : option.chipClass
                      }`}
                    >
                      <Icon size={16} />
                      {option.label}
                      {isActive ? <Check size={14} /> : null}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400">
                Chọn một hoặc nhiều role nếu muốn gửi theo nhóm.
              </p>
            </div>

            <UserMultiSelect
              value={selectedUsers}
              onChange={setSelectedUsers}
              placeholder="Search and add specific users..."
            />
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <SendHorizontal size={16} />
            {isSubmitting ? "Sending..." : "Send notification"}
          </button>
        </div>
      </form>
    </div>
  );
}