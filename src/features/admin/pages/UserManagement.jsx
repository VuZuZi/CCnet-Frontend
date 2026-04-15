import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../api/adminAPI";
import { useToast } from "@/shared/contexts/ToastContext";
import { ADMIN_QUERY_KEYS } from "../constants/admin.queryKeys";
import {
  Search,
  Loader2,
  Ban,
  CheckCircle2,
  Users,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  CalendarDays,
  CircleUserRound,
  Shield,
  UserRound,
  CircleOff,
  History,
  Eye,
} from "lucide-react";

const PAGE_SIZE = 6;

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "BANNED", label: "Banned" },
];

const getInitials = (name) => {
  if (!name) return "US";

  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const normalizeUserStatus = (user) => {
  const rawStatus = String(user?.status || "").trim().toLowerCase();

  if (rawStatus === "banned") return "banned";
  if (rawStatus === "inactive") return "inactive";
  if (rawStatus === "active") return "active";
  if (user?.isActive === false) return "banned";

  return "active";
};

const getStatusMeta = (status) => {
  switch (status) {
    case "banned":
      return {
        label: "Banned",
        className: "border-red-200 bg-red-50 text-red-700",
      };
    case "inactive":
      return {
        label: "Inactive",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "active":
    default:
      return {
        label: "Active",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
  }
};

const getRoleClass = (role) => {
  const normalized = String(role || "").toLowerCase();

  if (normalized === "admin") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (normalized === "organizer") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
};

const formatDateTime = (value) => {
  if (!value) return "--";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

const buildVisiblePages = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 3) return [1, 2, 3, 4, total];
  if (current >= total - 2) return [1, total - 3, total - 2, total - 1, total];

  return [1, current - 1, current, current + 1, total];
};

const normalizeUsersResponse = (res) => {
  const payload = res?.data?.data ?? res?.data ?? {};

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: {
        page: 1,
        limit: PAGE_SIZE,
        total: payload.length,
        totalPages: 1,
      },
    };
  }

  return {
    items: payload?.items || [],
    pagination: payload?.pagination || {
      page: 1,
      limit: PAGE_SIZE,
      total: 0,
      totalPages: 1,
    },
  };
};

const getErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || error?.message || fallback;

function ConfirmActionModal({
  open,
  title,
  description,
  confirmText,
  confirmClassName,
  loading,
  requireReason = false,
  reason = "",
  onReasonChange,
  reasonLabel = "Reason",
  reasonPlaceholder = "Enter reason...",
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const isReasonInvalid = requireReason && !String(reason || "").trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={() => !loading && onClose?.()}
        aria-label="Close modal"
      />

      <div
        className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <AlertTriangle size={20} strokeWidth={2.2} />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !loading && onClose?.()}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} strokeWidth={2.3} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            {reasonLabel}
          </label>

          <textarea
            rows={4}
            value={reason}
            onChange={(event) => onReasonChange?.(event.target.value)}
            placeholder={reasonPlaceholder}
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-4 ${
              isReasonInvalid
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
            }`}
            disabled={loading}
          />

          {isReasonInvalid ? (
            <p className="text-xs font-semibold text-red-600">
              Reason is required for this action.
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => !loading && onClose?.()}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || isReasonInvalid}
            className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-60 ${confirmClassName}`}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, mono = false, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
    red: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            toneMap[tone] || toneMap.slate
          }`}
        >
          {icon}
        </div>

        <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </div>
      </div>

      <div
        className={`break-all text-sm font-semibold text-slate-800 ${
          mono ? "font-mono text-[13px]" : ""
        }`}
      >
        {value || "--"}
      </div>
    </div>
  );
}

function UserDetailModal({ open, user, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !user) return null;

  const statusMeta = getStatusMeta(normalizeUserStatus(user));

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div
        className="relative z-10 w-full max-w-3xl rounded-[30px] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="h-20 w-20 rounded-3xl object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-2xl font-black text-slate-600 ring-1 ring-slate-200">
                {getInitials(user.fullName)}
              </div>
            )}

            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                <CircleUserRound size={12} strokeWidth={2.3} />
                User Detail
              </div>

              <h3 className="truncate text-2xl font-black tracking-tight text-slate-900">
                {user.fullName || "Unnamed user"}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getRoleClass(
                    user.role
                  )}`}
                >
                  {user.role || "user"}
                </span>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
          <InfoItem
            icon={<Mail size={16} strokeWidth={2.3} />}
            label="Email"
            value={user.email}
            tone="blue"
          />

          <InfoItem
            icon={<Shield size={16} strokeWidth={2.3} />}
            label="Role"
            value={user.role || "user"}
            tone="violet"
          />

          <InfoItem
            icon={<UserRound size={16} strokeWidth={2.3} />}
            label="User ID"
            value={user._id}
            mono
            tone="amber"
          />

          <InfoItem
            icon={<CircleOff size={16} strokeWidth={2.3} />}
            label="Account Status"
            value={statusMeta.label}
            tone={statusMeta.label === "Banned" ? "red" : "green"}
          />

          <InfoItem
            icon={<CheckCircle2 size={16} strokeWidth={2.3} />}
            label="isActive"
            value={user.isActive === false ? "False" : "True"}
            tone={user.isActive === false ? "red" : "green"}
          />

          <InfoItem
            icon={<CalendarDays size={16} strokeWidth={2.3} />}
            label="Created At"
            value={formatDateTime(user.createdAt)}
            tone="slate"
          />

          <InfoItem
            icon={<CalendarDays size={16} strokeWidth={2.3} />}
            label="Updated At"
            value={formatDateTime(user.updatedAt)}
            tone="slate"
          />

          {"phone" in user ? (
            <InfoItem
              icon={<UserRound size={16} strokeWidth={2.3} />}
              label="Phone"
              value={user.phone}
              tone="slate"
            />
          ) : null}

          {"location" in user ? (
            <InfoItem
              icon={<UserRound size={16} strokeWidth={2.3} />}
              label="Location"
              value={user.location}
              tone="slate"
            />
          ) : null}

          {"headline" in user ? (
            <InfoItem
              icon={<UserRound size={16} strokeWidth={2.3} />}
              label="Headline"
              value={user.headline}
              tone="slate"
            />
          ) : null}

          {"about" in user ? (
            <div className="md:col-span-2">
              <InfoItem
                icon={<UserRound size={16} strokeWidth={2.3} />}
                label="About"
                value={user.about}
                tone="slate"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const UserManagement = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pendingBanUserId, setPendingBanUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionReason, setActionReason] = useState("");

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null,
    user: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchText(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const userListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: searchText,
    }),
    [page, searchText]
  );

  const usersQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.users.list(userListParams),
    queryFn: async () => {
      const res = await adminAPI.getUsers(userListParams);
      return normalizeUsersResponse(res);
    },
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  const { items: rawUsers, pagination } = usersQuery.data || {
    items: [],
    pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  };

  const normalizedUsers = useMemo(
    () =>
      (rawUsers || []).map((user) => ({
        ...user,
        normalizedStatus: normalizeUserStatus(user),
      })),
    [rawUsers]
  );

  const filteredUsers = useMemo(() => {
    if (activeFilter === "ACTIVE") {
      return normalizedUsers.filter((user) => user.normalizedStatus === "active");
    }

    if (activeFilter === "BANNED") {
      return normalizedUsers.filter((user) => user.normalizedStatus === "banned");
    }

    return normalizedUsers;
  }, [normalizedUsers, activeFilter]);

  useEffect(() => {
    if (!usersQuery.isLoading && page > 1 && filteredUsers.length === 0) {
      setPage(1);
    }
  }, [page, filteredUsers.length, usersQuery.isLoading]);

  const pageStats = useMemo(
    () => ({
      total: pagination?.total || 0,
      active: normalizedUsers.filter((u) => u.normalizedStatus === "active").length,
      banned: normalizedUsers.filter((u) => u.normalizedStatus === "banned").length,
    }),
    [pagination, normalizedUsers]
  );

  const totalPages = Math.max(1, pagination?.totalPages || 1);
  const visiblePages = buildVisiblePages(page, totalPages);

  const openBanModal = (user) => {
    setActionReason("");
    setConfirmState({
      open: true,
      type: "ban",
      user,
    });
  };

  const closeModal = () => {
    setActionReason("");
    setConfirmState({
      open: false,
      type: null,
      user: null,
    });
  };

  const handleConfirmAction = async () => {
    const user = confirmState.user;

    if (!user || confirmState.type !== "ban") return;

    const isBanned = user.normalizedStatus === "banned";
    const trimmedReason = String(actionReason || "").trim();

    if (!trimmedReason) {
      toast.error("Reason is required for this action.");
      return;
    }

    try {
      setPendingBanUserId(user._id);

      const res = await adminAPI.toggleBan(user._id, {
        reason: trimmedReason,
      });

      const updatedUser = res?.data?.data;

      queryClient.setQueryData(
        ADMIN_QUERY_KEYS.users.list(userListParams),
        (previousData) => {
          if (!previousData) return previousData;

          return {
            ...previousData,
            items: (previousData.items || []).map((item) =>
              item._id === user._id ? { ...item, ...updatedUser } : item
            ),
          };
        }
      );

      setSelectedUser((previousValue) =>
        previousValue && previousValue._id === user._id
          ? {
              ...previousValue,
              ...updatedUser,
              normalizedStatus: normalizeUserStatus({
                ...previousValue,
                ...updatedUser,
              }),
            }
          : previousValue
      );

      await queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.users.all(),
      });

      await queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.actionLogs.all(),
      });

      toast.success(
        isBanned
          ? "User has been unbanned successfully."
          : "User has been banned successfully."
      );

      closeModal();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update ban status."));
    } finally {
      setPendingBanUserId(null);
    }
  };

  const modalUser = confirmState.user;
  const isBanModal = confirmState.type === "ban";
  const modalLoading = isBanModal && pendingBanUserId === modalUser?._id;
  const requireReason = isBanModal;

  const reasonLabel =
    isBanModal && modalUser?.normalizedStatus === "banned"
      ? "Reason for unban"
      : "Reason for ban";

  const reasonPlaceholder =
    isBanModal && modalUser?.normalizedStatus === "banned"
      ? "Enter the reason for restoring access..."
      : "Enter the reason for restricting access...";

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex-1">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
              <Users size={11} strokeWidth={2.3} />
              Admin User Control
            </div>

            <h1 className="text-[28px] font-black leading-none tracking-tight text-slate-900">
              User Management
            </h1>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/user-action-logs")}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
            >
              <History size={16} strokeWidth={2.3} />
              View History
            </button>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:min-w-[320px]">
              <SmallStat
                label="Total"
                value={pageStats.total}
                className="border-slate-200 bg-slate-50 text-slate-700"
                active={activeFilter === "ALL"}
                onClick={() => {
                  setActiveFilter("ALL");
                  setPage(1);
                }}
              />
              <SmallStat
                label="Active"
                value={pageStats.active}
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
                active={activeFilter === "ACTIVE"}
                onClick={() => {
                  setActiveFilter("ACTIVE");
                  setPage(1);
                }}
              />
              <SmallStat
                label="Banned"
                value={pageStats.banned}
                className="border-red-200 bg-red-50 text-red-700"
                active={activeFilter === "BANNED"}
                onClick={() => {
                  setActiveFilter("BANNED");
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const isActive = activeFilter === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveFilter(item.key);
                    setPage(1);
                  }}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full xl:w-[320px]">
            <Search
              size={15}
              strokeWidth={2.3}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, email, role, id..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">User Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                Page {page} / {totalPages}
              </p>
            </div>

            <div className="text-sm text-slate-500">
              Showing {filteredUsers.length} user(s) on this page
            </div>
          </div>
        </div>

        <div className="min-h-[420px] overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="w-[42%] px-5 py-3 font-bold text-slate-600">User</th>
                <th className="w-[20%] px-5 py-3 font-bold text-slate-600">Role</th>
                <th className="w-[18%] px-5 py-3 font-bold text-slate-600">Status</th>
                <th className="w-[20%] px-5 py-3 text-right font-bold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {usersQuery.isLoading ? (
                <tr>
                  <td colSpan="4" className="px-5 py-14 text-center">
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-500">
                      <Loader2 size={18} className="animate-spin text-amber-500" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-20 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const statusMeta = getStatusMeta(user.normalizedStatus);
                  const isBanned = user.normalizedStatus === "banned";
                  const isBanPending = pendingBanUserId === user._id;
                  const isBusy = isBanPending;

                  return (
                    <tr
                      key={user._id}
                      className="border-b border-slate-100/80 transition hover:bg-slate-50/40"
                    >
                      <td className="px-5 py-4">
                        <div className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 transition-all duration-200 hover:border-amber-300 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_12px_28px_rgba(245,158,11,0.10)]">
                          <div className="flex min-w-0 items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt="avatar"
                                className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 ring-1 ring-slate-200">
                                {getInitials(user.fullName)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-[16px] font-semibold tracking-[-0.01em] text-slate-900">
                                {user.fullName || "Unnamed user"}
                              </p>

                              <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500">
                                <Mail
                                  size={13}
                                  strokeWidth={2.1}
                                  className="shrink-0 text-slate-400"
                                />
                                <span className="truncate">{user.email || "--"}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                            aria-label={`View detail for ${user.fullName || "user"}`}
                            title="View detail"
                          >
                            <Eye size={16} strokeWidth={2.1} />
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRoleClass(
                            user.role
                          )}`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openBanModal(user)}
                            disabled={isBusy}
                            className={`inline-flex min-w-[92px] items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              isBanned
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                          >
                            {isBanPending ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : isBanned ? (
                              <CheckCircle2 size={13} strokeWidth={2.2} />
                            ) : (
                              <Ban size={13} strokeWidth={2.2} />
                            )}
                            {isBanPending ? "..." : isBanned ? "Unban" : "Ban"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || usersQuery.isFetching}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} strokeWidth={2.3} />
              </button>

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  disabled={usersQuery.isFetching}
                  className={`inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                    page === pageNumber
                      ? "bg-amber-500 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  } disabled:opacity-50`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages || usersQuery.isFetching}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight size={16} strokeWidth={2.3} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <UserDetailModal
        open={Boolean(selectedUser)}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      <ConfirmActionModal
        open={confirmState.open}
        title={
          modalUser?.normalizedStatus === "banned"
            ? "Unban this user?"
            : "Ban this user?"
        }
        description={
          modalUser?.normalizedStatus === "banned"
            ? "This will restore this user's platform access."
            : "This will restrict this user's access on the platform."
        }
        confirmText={modalUser?.normalizedStatus === "banned" ? "Unban" : "Ban"}
        confirmClassName={
          modalUser?.normalizedStatus === "banned"
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-red-600 hover:bg-red-700"
        }
        loading={modalLoading}
        requireReason={requireReason}
        reason={actionReason}
        onReasonChange={setActionReason}
        reasonLabel={reasonLabel}
        reasonPlaceholder={reasonPlaceholder}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

const SmallStat = ({ label, value, className = "", active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${className} ${
      active ? "ring-2 ring-offset-1 ring-amber-300" : ""
    }`}
  >
    <p className="text-[10px] font-bold uppercase tracking-[0.14em]">{label}</p>
    <p className="mt-1 text-xl font-black leading-none">{value}</p>
  </button>
);

export default UserManagement;