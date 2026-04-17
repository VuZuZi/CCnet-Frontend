import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  Send,
  MessageCircle,
  X,
  RotateCcw,
  CalendarDays,
  Briefcase,
  Info,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

import { useVolunteerQueries } from "@/features/volunteer/hooks/useVolunteerQueries.js";
import { useVolunteerMutations } from "@/features/volunteer/hooks/useVolunteerMutations.js";
import { useCreateConversation } from "@/features/chat/hooks/conversations/useCreateConversation";
import { useToast } from "@/shared/contexts/ToastContext";

export const VolunteerManager = ({
  projectId,
  initialSubTab = "pending",
  highlightedApplicationId = "",
}) => {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [approveWithdrawTarget, setApproveWithdrawTarget] = useState(null);
  const [rejectWithdrawTarget, setRejectWithdrawTarget] = useState(null);

  const cardRefs = useRef({});

  const navigate = useNavigate();
  const toast = useToast();

  const { useProjectApplications } = useVolunteerQueries();

  const { data: pendingResult, isLoading: pendingLoading } =
    useProjectApplications(projectId, "PENDING");
  const { data: approvedResult, isLoading: approvedLoading } =
    useProjectApplications(projectId, "APPROVED");
  const { data: rejectedResult, isLoading: rejectedLoading } =
    useProjectApplications(projectId, "REJECTED");
  const { data: withdrawResult, isLoading: withdrawLoading } =
    useProjectApplications(projectId, "WITHDRAW_REQUESTED");

  const {
    approveApplication,
    rejectApplication,
    restoreApplication,
    approveWithdraw,
    rejectWithdraw,
    isApproving,
    isRejecting,
    isRestoring,
    isApprovingWithdraw,
    isRejectingWithdraw,
  } = useVolunteerMutations();

  const { createConversationAsync, isLoading: isCreatingConversation } =
    useCreateConversation();

  const isUpdating =
    isApproving ||
    isRejecting ||
    isRestoring ||
    isApprovingWithdraw ||
    isRejectingWithdraw ||
    isCreatingConversation;

  useEffect(() => {
    setActiveSubTab(initialSubTab || "pending");
  }, [initialSubTab]);

  const getApplicationsArray = (result) => {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (Array.isArray(result.data)) return result.data;
    if (Array.isArray(result?.data?.data)) return result.data.data;
    return [];
  };

  const pendingApps = getApplicationsArray(pendingResult);
  const approvedApps = getApplicationsArray(approvedResult);
  const rejectedApps = getApplicationsArray(rejectedResult);
  const withdrawApps = getApplicationsArray(withdrawResult);

  const applications = useMemo(() => {
    switch (activeSubTab) {
      case "pending":
        return pendingApps;
      case "approved":
        return approvedApps;
      case "rejected":
        return rejectedApps;
      case "withdraw":
        return withdrawApps;
      default:
        return [];
    }
  }, [activeSubTab, pendingApps, approvedApps, rejectedApps, withdrawApps]);

  const isLoading = useMemo(() => {
    switch (activeSubTab) {
      case "pending":
        return pendingLoading;
      case "approved":
        return approvedLoading;
      case "rejected":
        return rejectedLoading;
      case "withdraw":
        return withdrawLoading;
      default:
        return false;
    }
  }, [
    activeSubTab,
    pendingLoading,
    approvedLoading,
    rejectedLoading,
    withdrawLoading,
  ]);

  useEffect(() => {
    if (!highlightedApplicationId) return;
    if (!Array.isArray(applications) || !applications.length) return;

    const found = applications.find(
      (app) => String(app?._id || "") === String(highlightedApplicationId),
    );

    if (!found) return;

    const timer = setTimeout(() => {
      const targetEl = cardRefs.current[String(found._id)];
      if (targetEl) {
        targetEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [highlightedApplicationId, applications]);

  const handleApproveConfirm = async () => {
    if (!approveTarget?._id) return;

    try {
      await approveApplication({ id: approveTarget._id });
      toast.success("Duyệt đơn thành công");
      setApproveTarget(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Duyệt đơn thất bại",
      );
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget?._id) return;

    try {
      await rejectApplication({
        id: rejectTarget._id,
        reason,
      });
      toast.success("Từ chối đơn thành công");
      setRejectTarget(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Từ chối đơn thất bại",
      );
    }
  };

  const handleRestoreConfirm = async () => {
    if (!restoreTarget?._id) return;

    try {
      await restoreApplication({ id: restoreTarget._id });
      toast.success("Khôi phục đơn thành công");
      setRestoreTarget(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Khôi phục đơn thất bại",
      );
    }
  };

  const handleApproveWithdrawConfirm = async () => {
    if (!approveWithdrawTarget?._id) return;

    try {
      await approveWithdraw({ id: approveWithdrawTarget._id });
      toast.success("Đã chấp nhận yêu cầu xin rút");
      setApproveWithdrawTarget(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Xử lý yêu cầu xin rút thất bại",
      );
    }
  };

  const handleRejectWithdrawConfirm = async (reviewNote) => {
    if (!rejectWithdrawTarget?._id) return;

    try {
      await rejectWithdraw({
        id: rejectWithdrawTarget._id,
        reviewNote,
      });
      toast.success("Đã từ chối yêu cầu xin rút");
      setRejectWithdrawTarget(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Từ chối yêu cầu xin rút thất bại",
      );
    }
  };

  const handleMessageVolunteer = async (volunteerId) => {
    try {
      const conversation = await createConversationAsync({
        type: "direct",
        participantId: volunteerId,
      });

      if (conversation?._id) {
        navigate(`/messages/${conversation._id}`);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể mở cuộc trò chuyện",
      );
    }
  };

  const tabs = [
    {
      id: "pending",
      label: "Chờ duyệt",
      count: pendingApps.length,
      icon: Clock,
      activeClass:
        "bg-[#FFF8DC] text-[#B45309] border-[#FBBF24] shadow-[0_8px_18px_rgba(251,191,36,0.18)]",
      badgeActiveClass: "bg-amber-200 text-amber-900",
    },
    {
      id: "approved",
      label: "Đã duyệt",
      count: approvedApps.length,
      icon: UserCheck,
      activeClass:
        "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-[0_8px_18px_rgba(16,185,129,0.12)]",
      badgeActiveClass: "bg-emerald-200 text-emerald-900",
    },
    {
      id: "withdraw",
      label: "Yêu cầu xin rút",
      count: withdrawApps.length,
      icon: Send,
      activeClass:
        "bg-amber-50 text-amber-800 border-amber-200 shadow-[0_8px_18px_rgba(245,158,11,0.12)]",
      badgeActiveClass: "bg-amber-200 text-amber-900",
    },
    {
      id: "rejected",
      label: "Từ chối",
      count: rejectedApps.length,
      icon: UserX,
      activeClass:
        "bg-rose-50 text-rose-800 border-rose-200 shadow-[0_8px_18px_rgba(244,63,94,0.10)]",
      badgeActiveClass: "bg-rose-200 text-rose-900",
    },
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case "PENDING":
        return {
          wrapper:
            "border-amber-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFDF7_100%)]",
          badge: "bg-amber-100 text-amber-800",
          label: "Chờ duyệt",
        };
      case "APPROVED":
        return {
          wrapper:
            "border-emerald-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#F3FFF8_100%)]",
          badge: "bg-emerald-100 text-emerald-800",
          label: "Thành viên đã tham gia",
        };
      case "REJECTED":
        return {
          wrapper:
            "border-rose-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF6F7_100%)]",
          badge: "bg-rose-100 text-rose-800",
          label: "Đã từ chối",
        };
      case "WITHDRAW_REQUESTED":
        return {
          wrapper:
            "border-amber-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF9F2_100%)]",
          badge: "bg-amber-100 text-amber-800",
          label: "Yêu cầu xin rút",
        };
      case "CANCELLED":
        return {
          wrapper:
            "border-slate-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]",
          badge: "bg-slate-100 text-slate-700",
          label: "Đã hủy",
        };
      default:
        return {
          wrapper:
            "border-slate-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]",
          badge: "bg-slate-100 text-slate-700",
          label: "Không xác định",
        };
    }
  };

  const getEmptyMessage = () => {
    switch (activeSubTab) {
      case "pending":
        return "Hiện không có đơn đăng ký nào đang chờ.";
      case "approved":
        return "Hiện chưa có thành viên nào được duyệt tham gia.";
      case "withdraw":
        return "Hiện không có yêu cầu xin rút nào.";
      case "rejected":
        return "Hiện không có đơn bị từ chối.";
      default:
        return "Chưa có dữ liệu.";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-400" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-2">
          <div className="flex w-full flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-extrabold transition-all ${
                    isActive
                      ? tab.activeClass
                      : "border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive
                        ? tab.badgeActiveClass
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-slate-500">{getEmptyMessage()}</p>
            </div>
          ) : (
            applications.map((app) => {
              const statusConfig = getStatusConfig(app.status);
              const volunteer = app.volunteerId || {};
              const volunteerId = volunteer?._id || volunteer?.id || null;
              const isHighlighted =
                highlightedApplicationId &&
                String(app?._id || "") === String(highlightedApplicationId);

              return (
                <div
                  key={app._id}
                  ref={(el) => {
                    cardRefs.current[String(app._id)] = el;
                  }}
                  className={`rounded-[28px] border p-6 shadow-sm transition-all ${
                    statusConfig.wrapper
                  } ${
                    isHighlighted
                      ? "ring-2 ring-amber-200 border-amber-400"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                          {volunteer?.avatar ? (
                            <img
                              src={volunteer.avatar}
                              alt={volunteer?.fullName || "Tình nguyện viên"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#FFF8DC] text-xl font-black text-[#B45309]">
                              {volunteer?.fullName?.charAt(0) || "T"}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-black text-slate-900">
                                {volunteer?.fullName || "Tình nguyện viên"}
                              </h3>

                              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarDays className="h-4 w-4" />
                                  Nộp đơn{" "}
                                  {app.createdAt
                                    ? format(
                                        new Date(app.createdAt),
                                        "dd/MM/yyyy",
                                        { locale: vi },
                                      )
                                    : "--/--/----"}
                                </span>
                              </div>
                            </div>

                            <div
                              className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${statusConfig.badge}`}
                            >
                              {statusConfig.label}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                              <Briefcase className="h-3.5 w-3.5" />
                              {app.skills || "Chưa cập nhật vai trò"}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                              <Clock className="h-3.5 w-3.5" />
                              {app.availability || "Chưa cập nhật thời gian"}
                            </span>

                            {app.status === "APPROVED" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Đang tham gia dự án
                              </span>
                            ) : null}

                            {app.status === "WITHDRAW_REQUESTED" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                <LogOut className="h-3.5 w-3.5" />
                                Đang chờ ban tổ chức phản hồi
                              </span>
                            ) : null}
                          </div>

                          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                              <Info className="h-3.5 w-3.5" />
                              Lý do / giới thiệu
                            </div>
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                              {app.motivation || "Chưa có nội dung giới thiệu."}
                            </p>
                          </div>

                          {app.rejectReason ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                              <div className="text-xs font-bold uppercase tracking-[0.12em] text-rose-500">
                                Lý do từ chối
                              </div>
                              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-rose-700 [overflow-wrap:anywhere]">
                                {app.rejectReason}
                              </p>
                            </div>
                          ) : null}

                          {app.status === "WITHDRAW_REQUESTED" &&
                          app.withdrawReason ? (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                              <div className="text-xs font-bold uppercase tracking-[0.12em] text-amber-600">
                                Lý do xin rút
                              </div>
                              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-amber-900 [overflow-wrap:anywhere]">
                                {app.withdrawReason}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 lg:w-[210px]">
                      <button
                        onClick={() => handleMessageVolunteer(volunteerId)}
                        disabled={isUpdating || !volunteerId}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Nhắn tin
                      </button>

                      {activeSubTab === "pending" ? (
                        <>
                          <button
                            onClick={() => setApproveTarget(app)}
                            disabled={isUpdating}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Duyệt đơn
                          </button>

                          <button
                            onClick={() => setRejectTarget(app)}
                            disabled={isUpdating}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Từ chối
                          </button>
                        </>
                      ) : null}

                      {activeSubTab === "withdraw" ? (
                        <>
                          <button
                            onClick={() => setApproveWithdrawTarget(app)}
                            disabled={isUpdating}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-600 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Đồng ý rút
                          </button>

                          <button
                            onClick={() => setRejectWithdrawTarget(app)}
                            disabled={isUpdating}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-900 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Từ chối rút
                          </button>
                        </>
                      ) : null}

                      {activeSubTab === "rejected" ? (
                        <button
                          onClick={() => setRestoreTarget(app)}
                          disabled={isUpdating}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Khôi phục
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ConfirmActionModal
        open={Boolean(approveTarget)}
        title="Duyệt đơn đăng ký"
        description={`Xác nhận duyệt đơn của ${
          approveTarget?.volunteerId?.fullName || "tình nguyện viên"
        }?`}
        confirmText="Xác nhận duyệt"
        confirmClassName="bg-green-600 hover:bg-green-700 text-white"
        isPending={isApproving}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApproveConfirm}
      />

      <RejectApplicationModal
        open={Boolean(rejectTarget)}
        volunteerName={
          rejectTarget?.volunteerId?.fullName || "Tình nguyện viên"
        }
        isPending={isRejecting}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleRejectConfirm}
      />

      <ConfirmActionModal
        open={Boolean(restoreTarget)}
        title="Khôi phục đơn đăng ký"
        description={`Xác nhận đưa đơn của ${
          restoreTarget?.volunteerId?.fullName || "tình nguyện viên"
        } về trạng thái chờ duyệt?`}
        confirmText="Khôi phục"
        confirmClassName="bg-blue-600 hover:bg-blue-700 text-white"
        isPending={isRestoring}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestoreConfirm}
      />

      <ConfirmActionModal
        open={Boolean(approveWithdrawTarget)}
        title="Chấp nhận yêu cầu xin rút"
        description={`Xác nhận cho ${
          approveWithdrawTarget?.volunteerId?.fullName || "tình nguyện viên"
        } rút khỏi dự án?`}
        confirmText="Đồng ý rút"
        confirmClassName="bg-amber-500 hover:bg-amber-600 text-slate-900"
        isPending={isApprovingWithdraw}
        onClose={() => setApproveWithdrawTarget(null)}
        onConfirm={handleApproveWithdrawConfirm}
      />

      <RejectWithdrawModal
        open={Boolean(rejectWithdrawTarget)}
        volunteerName={
          rejectWithdrawTarget?.volunteerId?.fullName || "Tình nguyện viên"
        }
        isPending={isRejectingWithdraw}
        onClose={() => setRejectWithdrawTarget(null)}
        onSubmit={handleRejectWithdrawConfirm}
      />
    </>
  );
};

const BaseModal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ title, onClose }) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

const ConfirmActionModal = ({
  open,
  title,
  description,
  confirmText,
  confirmClassName,
  isPending,
  onClose,
  onConfirm,
}) => {
  return (
    <BaseModal open={open} onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} />
      <p className="mb-6 text-gray-600">{description}</p>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={isPending}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>

        <button
          onClick={onConfirm}
          disabled={isPending}
          className={`flex-1 rounded-lg px-4 py-2 font-medium disabled:opacity-50 ${confirmClassName}`}
        >
          {isPending ? "Đang xử lý..." : confirmText}
        </button>
      </div>
    </BaseModal>
  );
};

const RejectApplicationModal = ({
  open,
  volunteerName,
  isPending,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setReason("");
  };

  return (
    <BaseModal open={open} onClose={handleClose}>
      <ModalHeader title="Từ chối đơn đăng ký" onClose={handleClose} />

      <p className="mb-4 text-gray-600">
        Nhập lý do từ chối cho {volunteerName}. Nội dung này sẽ giúp người nộp
        đơn hiểu rõ hơn.
      </p>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={5}
        placeholder="Nhập lý do từ chối..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending || !reason.trim()}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
        </button>
      </div>
    </BaseModal>
  );
};

const RejectWithdrawModal = ({
  open,
  volunteerName,
  onClose,
  onSubmit,
  isPending,
}) => {
  const [reviewNote, setReviewNote] = useState("");

  const handleClose = () => {
    setReviewNote("");
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(reviewNote.trim());
    setReviewNote("");
  };

  return (
    <BaseModal open={open} onClose={handleClose}>
      <ModalHeader title="Từ chối yêu cầu xin rút" onClose={handleClose} />

      <p className="mb-4 text-gray-600">
        Bạn có thể nhập ghi chú cho {volunteerName}. Ghi chú này sẽ được gửi lại
        cho tình nguyện viên.
      </p>

      <textarea
        value={reviewNote}
        onChange={(e) => setReviewNote(e.target.value)}
        rows={5}
        placeholder="Nhập ghi chú..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-black disabled:opacity-50"
        >
          {isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
        </button>
      </div>
    </BaseModal>
  );
};

export default VolunteerManager;
