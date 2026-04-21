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
  ClipboardCheck,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

import { useVolunteerQueries } from "@/features/volunteer/hooks/useVolunteerQueries.js";
import { useVolunteerMutations } from "@/features/volunteer/hooks/useVolunteerMutations.js";
import {
  useAttendanceList,
  useReviewList,
} from "@/features/volunteer/hooks/useVolunteerEngagementQueries.js";
import { useVolunteerEngagementMutations } from "@/features/volunteer/hooks/useVolunteerEngagementMutations.js";
import { useCreateConversation } from "@/features/chat/hooks/conversations/useCreateConversation";
import { useToast } from "@/shared/contexts/ToastContext";

const DEFAULT_MILESTONE_ID = "default";

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

  const [attendanceTarget, setAttendanceTarget] = useState(null);
  const [attendanceStatusTarget, setAttendanceStatusTarget] = useState("ATTENDED");
  const [reviewTarget, setReviewTarget] = useState(null);

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
    data: attendanceResult,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useAttendanceList(projectId, DEFAULT_MILESTONE_ID);

  const {
    data: reviewResult,
    isLoading: reviewLoading,
    refetch: refetchReviews,
  } = useReviewList(projectId, DEFAULT_MILESTONE_ID);

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

  const {
    bootstrapAttendance,
    updateAttendance,
    bootstrapReviews,
    submitReview,
    isBootstrappingAttendance,
    isUpdatingAttendance,
    isBootstrappingReviews,
    isSubmittingReview,
  } = useVolunteerEngagementMutations();

  const { createConversationAsync, isLoading: isCreatingConversation } =
    useCreateConversation();

  const isUpdating =
    isApproving ||
    isRejecting ||
    isRestoring ||
    isApprovingWithdraw ||
    isRejectingWithdraw ||
    isCreatingConversation ||
    isBootstrappingAttendance ||
    isUpdatingAttendance ||
    isBootstrappingReviews ||
    isSubmittingReview;

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

  const getItemsArray = (result) => {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (Array.isArray(result.items)) return result.items;
    if (Array.isArray(result.data)) return result.data;
    if (Array.isArray(result?.data?.items)) return result.data.items;
    if (Array.isArray(result?.data?.data)) return result.data.data;
    return [];
  };

  const pendingApps = getApplicationsArray(pendingResult);
  const approvedApps = getApplicationsArray(approvedResult);
  const rejectedApps = getApplicationsArray(rejectedResult);
  const withdrawApps = getApplicationsArray(withdrawResult);

  const attendanceItems = getItemsArray(attendanceResult);
  const reviewItems = getItemsArray(reviewResult);

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
      case "attendance":
        return attendanceLoading;
      case "review":
        return reviewLoading;
      default:
        return false;
    }
  }, [
    activeSubTab,
    pendingLoading,
    approvedLoading,
    rejectedLoading,
    withdrawLoading,
    attendanceLoading,
    reviewLoading,
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

  const handleBootstrapAttendance = async () => {
    try {
      await bootstrapAttendance(projectId, DEFAULT_MILESTONE_ID);
      await refetchAttendance();
      toast.success("Đã khởi tạo danh sách chấm công");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể khởi tạo danh sách chấm công",
      );
    }
  };

  const handleAttendanceConfirm = async (note = "") => {
    if (!attendanceTarget?._id) return;

    try {
      await updateAttendance(
        projectId,
        DEFAULT_MILESTONE_ID,
        attendanceTarget._id,
        {
          status: attendanceStatusTarget,
          note,
        },
      );
      await refetchAttendance();
      setAttendanceTarget(null);
      toast.success(
        attendanceStatusTarget === "ATTENDED"
          ? "Đã xác nhận tham gia"
          : "Đã đánh dấu vắng mặt",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Cập nhật chấm công thất bại",
      );
    }
  };

  const handleBootstrapReviews = async () => {
    try {
      await bootstrapReviews(projectId, DEFAULT_MILESTONE_ID);
      await refetchReviews();
      toast.success("Đã khởi tạo danh sách đánh giá");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể khởi tạo danh sách đánh giá",
      );
    }
  };

  const handleSubmitReview = async ({ score, comment }) => {
    if (!reviewTarget?._id) return;

    try {
      await submitReview(
        projectId,
        DEFAULT_MILESTONE_ID,
        reviewTarget._id,
        { score, comment },
      );
      await refetchReviews();
      setReviewTarget(null);
      toast.success("Đánh giá volunteer thành công");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Đánh giá volunteer thất bại",
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
      id: "attendance",
      label: "Chấm công",
      count: attendanceItems.length,
      icon: ClipboardCheck,
      activeClass:
        "bg-sky-50 text-sky-800 border-sky-200 shadow-[0_8px_18px_rgba(14,165,233,0.12)]",
      badgeActiveClass: "bg-sky-200 text-sky-900",
    },
    {
      id: "review",
      label: "Đánh giá",
      count: reviewItems.length,
      icon: Star,
      activeClass:
        "bg-violet-50 text-violet-800 border-violet-200 shadow-[0_8px_18px_rgba(139,92,246,0.12)]",
      badgeActiveClass: "bg-violet-200 text-violet-900",
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

  const getAttendanceStatusConfig = (status) => {
    switch (status) {
      case "ATTENDED":
        return {
          wrapper:
            "border-emerald-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#F3FFF8_100%)]",
          badge: "bg-emerald-100 text-emerald-800",
          label: "Đã tham gia",
        };
      case "ABSENT":
        return {
          wrapper:
            "border-rose-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF6F7_100%)]",
          badge: "bg-rose-100 text-rose-800",
          label: "Vắng mặt",
        };
      default:
        return {
          wrapper:
            "border-sky-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#F4FBFF_100%)]",
          badge: "bg-sky-100 text-sky-800",
          label: "Chờ xác nhận",
        };
    }
  };

  const getReviewStatusConfig = (status) => {
    switch (status) {
      case "REVIEWED":
        return {
          wrapper:
            "border-violet-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF7FF_100%)]",
          badge: "bg-violet-100 text-violet-800",
          label: "Đã đánh giá",
        };
      case "AUTO_MAXED":
        return {
          wrapper:
            "border-amber-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF8EF_100%)]",
          badge: "bg-amber-100 text-amber-800",
          label: "Tự động tối đa",
        };
      default:
        return {
          wrapper:
            "border-slate-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]",
          badge: "bg-slate-100 text-slate-700",
          label: "Chờ đánh giá",
        };
    }
  };

  const getEmptyMessage = () => {
    switch (activeSubTab) {
      case "pending":
        return "Hiện không có đơn đăng ký nào đang chờ.";
      case "approved":
        return "Hiện chưa có thành viên nào được duyệt tham gia.";
      case "attendance":
        return "Chưa có dữ liệu chấm công. Hãy khởi tạo danh sách chấm công trước.";
      case "review":
        return "Chưa có dữ liệu đánh giá. Hãy khởi tạo danh sách đánh giá trước.";
      case "withdraw":
        return "Hiện không có yêu cầu xin rút nào.";
      case "rejected":
        return "Hiện không có đơn bị từ chối.";
      default:
        return "Chưa có dữ liệu.";
    }
  };

  const renderApplicationCards = () => {
    return applications.length === 0 ? (
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
              isHighlighted ? "ring-2 ring-amber-200 border-amber-400" : ""
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
                              ? format(new Date(app.createdAt), "dd/MM/yyyy", {
                                  locale: vi,
                                })
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

                    {app.status === "WITHDRAW_REQUESTED" && app.withdrawReason ? (
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
    );
  };

  const renderAttendanceCards = () => {
    return attendanceItems.length === 0 ? (
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-slate-500">{getEmptyMessage()}</p>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleBootstrapAttendance}
            disabled={isUpdating}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600 disabled:opacity-50"
          >
            <ClipboardCheck className="h-4 w-4" />
            Khởi tạo chấm công
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleBootstrapAttendance}
            disabled={isUpdating}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-bold text-sky-800 transition hover:bg-sky-100 disabled:opacity-50"
          >
            <ClipboardCheck className="h-4 w-4" />
            Đồng bộ lại chấm công
          </button>
        </div>

        {attendanceItems.map((item) => {
          const config = getAttendanceStatusConfig(item.status);
          const volunteer = item.volunteerId || {};
          const volunteerId = volunteer?._id || volunteer?.id || null;

          return (
            <div
              key={item._id}
              className={`rounded-[28px] border p-6 shadow-sm transition-all ${config.wrapper}`}
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
                        <div className="flex h-full w-full items-center justify-center bg-[#EFF6FF] text-xl font-black text-sky-700">
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
                              Cập nhật{" "}
                              {item.updatedAt
                                ? format(new Date(item.updatedAt), "dd/MM/yyyy", {
                                    locale: vi,
                                  })
                                : "--/--/----"}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${config.badge}`}
                        >
                          {config.label}
                        </div>
                      </div>

                      {item.note ? (
                        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            <Info className="h-3.5 w-3.5" />
                            Ghi chú
                          </div>
                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                            {item.note}
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

                  <button
                    onClick={() => {
                      setAttendanceStatusTarget("ATTENDED");
                      setAttendanceTarget(item);
                    }}
                    disabled={isUpdating}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Xác nhận tham gia
                  </button>

                  <button
                    onClick={() => {
                      setAttendanceStatusTarget("ABSENT");
                      setAttendanceTarget(item);
                    }}
                    disabled={isUpdating}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Đánh dấu vắng mặt
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderReviewCards = () => {
    return reviewItems.length === 0 ? (
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-slate-500">{getEmptyMessage()}</p>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleBootstrapReviews}
            disabled={isUpdating}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-600 disabled:opacity-50"
          >
            <Star className="h-4 w-4" />
            Khởi tạo đánh giá
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleBootstrapReviews}
            disabled={isUpdating}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-bold text-violet-800 transition hover:bg-violet-100 disabled:opacity-50"
          >
            <Star className="h-4 w-4" />
            Đồng bộ lại đánh giá
          </button>
        </div>

        {reviewItems.map((item) => {
          const config = getReviewStatusConfig(item.status);
          const volunteer = item.volunteerId || {};
          const volunteerId = volunteer?._id || volunteer?.id || null;

          return (
            <div
              key={item._id}
              className={`rounded-[28px] border p-6 shadow-sm transition-all ${config.wrapper}`}
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
                        <div className="flex h-full w-full items-center justify-center bg-[#F5F3FF] text-xl font-black text-violet-700">
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
                              <Clock className="h-4 w-4" />
                              Hạn đánh giá{" "}
                              {item.deadlineAt
                                ? format(new Date(item.deadlineAt), "dd/MM/yyyy HH:mm", {
                                    locale: vi,
                                  })
                                : "--/--/----"}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${config.badge}`}
                        >
                          {config.label}
                        </div>
                      </div>

                      {typeof item.score === "number" ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                            <Star className="h-3.5 w-3.5" />
                            Điểm: {item.score}/5
                          </span>

                          {item.reviewSource ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                              Nguồn: {item.reviewSource}
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      {item.comment ? (
                        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            <Info className="h-3.5 w-3.5" />
                            Nhận xét
                          </div>
                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                            {item.comment}
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

                  {item.status === "PENDING" ? (
                    <button
                      onClick={() => setReviewTarget(item)}
                      disabled={isUpdating}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-600 disabled:opacity-50"
                    >
                      <Star className="h-4 w-4" />
                      Đánh giá ngay
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
          {["pending", "approved", "withdraw", "rejected"].includes(activeSubTab)
            ? renderApplicationCards()
            : null}

          {activeSubTab === "attendance" ? renderAttendanceCards() : null}

          {activeSubTab === "review" ? renderReviewCards() : null}
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

      <AttendanceActionModal
        open={Boolean(attendanceTarget)}
        title={
          attendanceStatusTarget === "ATTENDED"
            ? "Xác nhận tham gia"
            : "Đánh dấu vắng mặt"
        }
        description={`Xác nhận cập nhật trạng thái cho ${
          attendanceTarget?.volunteerId?.fullName || "tình nguyện viên"
        }?`}
        confirmText={
          attendanceStatusTarget === "ATTENDED"
            ? "Xác nhận tham gia"
            : "Xác nhận vắng mặt"
        }
        confirmClassName={
          attendanceStatusTarget === "ATTENDED"
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "bg-rose-600 hover:bg-rose-700 text-white"
        }
        isPending={isUpdatingAttendance}
        onClose={() => setAttendanceTarget(null)}
        onSubmit={handleAttendanceConfirm}
      />

      <ReviewVolunteerModal
        open={Boolean(reviewTarget)}
        volunteerName={reviewTarget?.volunteerId?.fullName || "Tình nguyện viên"}
        isPending={isSubmittingReview}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleSubmitReview}
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

const AttendanceActionModal = ({
  open,
  title,
  description,
  confirmText,
  confirmClassName,
  isPending,
  onClose,
  onSubmit,
}) => {
  const [note, setNote] = useState("");

  const handleClose = () => {
    setNote("");
    onClose();
  };

  const handleSubmit = async () => {
    await onSubmit(note.trim());
    setNote("");
  };

  return (
    <BaseModal open={open} onClose={handleClose}>
      <ModalHeader title={title} onClose={handleClose} />
      <p className="mb-4 text-gray-600">{description}</p>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Ghi chú (không bắt buộc)..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleClose}
          disabled={isPending}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>

        <button
          onClick={handleSubmit}
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

const ReviewVolunteerModal = ({
  open,
  volunteerName,
  isPending,
  onClose,
  onSubmit,
}) => {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  const handleClose = () => {
    setScore(5);
    setComment("");
    onClose();
  };

  const handleSubmit = async () => {
    await onSubmit({ score: Number(score), comment: comment.trim() });
    setScore(5);
    setComment("");
  };

  return (
    <BaseModal open={open} onClose={handleClose}>
      <ModalHeader title="Đánh giá tình nguyện viên" onClose={handleClose} />

      <p className="mb-4 text-gray-600">
        Gửi đánh giá cho {volunteerName}.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Điểm đánh giá (1 - 5)
          </label>
          <input
            type="number"
            min={1}
            max={5}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nhận xét
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="Nhập nhận xét..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending || Number(score) < 1 || Number(score) > 5}
          className="flex-1 rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {isPending ? "Đang xử lý..." : "Gửi đánh giá"}
        </button>
      </div>
    </BaseModal>
  );
};

export default VolunteerManager;