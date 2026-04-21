import { useMemo, useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  X,
  Edit2,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { VolunteerApplicationModal } from "./VolunteerApplicationModal";
import { VolunteerEditModal } from "./VolunteerEditModal";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useVolunteerMutations } from "../hooks/useVolunteerMutations";
import { useVolunteerQueries } from "../hooks/useVolunteerQueries";
import { useToast } from "@/shared/contexts/ToastContext";

function getApplicationStatusConfig(applicationStatus, isVolunteerFull) {
  switch (applicationStatus) {
    case "PENDING":
      return {
        text: "Đang chờ xét duyệt",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        disabled: false,
        showCancel: true,
        cancelText: "Hủy đơn",
        showEdit: true,
        showWithdraw: false,
      };

    case "APPROVED":
      return {
        text: "Đã được chấp nhận",
        icon: CheckCircle,
        className:
          "cursor-default bg-green-100 text-green-700 hover:bg-green-100",
        disabled: true,
        showCancel: false,
        cancelText: "",
        showEdit: false,
        showWithdraw: true,
      };

    case "WITHDRAW_REQUESTED":
      return {
        text: "Đang chờ duyệt xin rút",
        icon: Clock,
        className:
          "cursor-default bg-amber-100 text-amber-700 hover:bg-amber-100",
        disabled: true,
        showCancel: false,
        cancelText: "",
        showEdit: false,
        showWithdraw: false,
      };

    case "REJECTED":
      return {
        text: "Đã bị từ chối",
        icon: XCircle,
        className: "cursor-default bg-red-100 text-red-700 hover:bg-red-100",
        disabled: true,
        showCancel: false,
        cancelText: "",
        showEdit: false,
        showWithdraw: false,
      };

    default:
      return {
        text: isVolunteerFull
          ? "Đã tuyển đủ tình nguyện viên"
          : "Đăng ký tình nguyện",
        icon: Users,
        className: isVolunteerFull
          ? "cursor-not-allowed bg-slate-100 text-slate-400"
          : "bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] text-slate-900 shadow-[0_14px_30px_rgba(255,193,7,0.28)] hover:brightness-[1.02]",
        disabled: isVolunteerFull,
        showCancel: false,
        cancelText: "",
        showEdit: false,
        showWithdraw: false,
      };
  }
}

function isProjectUpdating(project) {
  return String(project?.status || "").toUpperCase() === "UPDATING";
}

function getActionBlockedMessage(applicationStatus) {
  switch (applicationStatus) {
    case "PENDING":
      return "Bạn đã có đơn đăng ký đang chờ xét duyệt";
    case "APPROVED":
      return "Bạn đã được chấp nhận tham gia dự án này";
    case "WITHDRAW_REQUESTED":
      return "Yêu cầu xin rút của bạn đang chờ ban tổ chức xử lý";
    case "REJECTED":
      return "Đơn đăng ký của bạn đã bị từ chối";
    default:
      return null;
  }
}

function getCurrentUserId(user) {
  return user?.id || user?._id || user?.userId || null;
}

function getProjectId(project, projectId) {
  return projectId || project?._id || project?.id;
}

function getProjectName(project, projectName) {
  return projectName || project?.title || project?.name || "";
}

function getVolunteerTarget(project) {
  const targetFromStats = Number(project?.stats?.targetVolunteers ?? 0);
  if (targetFromStats > 0) return targetFromStats;

  if (Array.isArray(project?.volunteerRoles)) {
    return project.volunteerRoles.reduce(
      (sum, role) => sum + Number(role?.quantity || 0),
      0,
    );
  }

  return 0;
}

export const ApplyVolunteerButton = ({
  project,
  projectId,
  projectName,
  className = "",
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    updateApplication,
    cancelApplication,
    requestWithdraw,
    isUpdating,
    isCancelling,
    isRequestingWithdraw,
  } = useVolunteerMutations();

  const { useApplicationStatus } = useVolunteerQueries();

  const effectiveProjectId = getProjectId(project, projectId);
  const effectiveProjectName = getProjectName(project, projectName);
  const currentUserId = getCurrentUserId(user);

  const volunteerTarget = useMemo(() => getVolunteerTarget(project), [project]);
  const currentVolunteers = Number(project?.stats?.currentVolunteers ?? 0);

  const isVolunteerFull = useMemo(() => {
    return (
      Boolean(project?.isVolunteerFull) ||
      (volunteerTarget > 0 && currentVolunteers >= volunteerTarget)
    );
  }, [project, volunteerTarget, currentVolunteers]);

  const { data: application, isFetching: isCheckingApplication } =
    useApplicationStatus(effectiveProjectId, currentUserId);
  const isUpdatingProject = isProjectUpdating(project);

  const applicationId = application?.id || application?._id || null;
  const hasApplied = Boolean(applicationId);
  const applicationStatus = hasApplied
    ? String(application?.status || "").toUpperCase()
    : "NONE";

  const statusConfig = getApplicationStatusConfig(
    applicationStatus,
    isVolunteerFull,
  );

  const handlePrimaryClick = () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để đăng ký tình nguyện");
      navigate("/login", {
        state: { from: `/projects/${effectiveProjectId}` },
      });
      return;
    }

    if (isUpdatingProject) {
      toast.info(
        "Dự án đang được cập nhật nên tạm thời chưa nhận thêm tình nguyện viên",
      );
      return;
    }

    if (isVolunteerFull && !hasApplied) {
      toast.info("Dự án hiện đã tuyển đủ tình nguyện viên");
      return;
    }

    const blockedMessage = getActionBlockedMessage(applicationStatus);
    if (hasApplied && blockedMessage) {
      if (applicationStatus === "APPROVED") {
        toast.success(blockedMessage);
      } else {
        toast.info(blockedMessage);
      }
      return;
    }

    setShowApplyModal(true);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();

    if (!applicationId) {
      toast.error("Không tìm thấy đơn đăng ký");
      return;
    }

    setShowEditModal(true);
  };

  const handleCancelClick = (event) => {
    event.stopPropagation();

    if (!applicationId) {
      toast.error("Không tìm thấy đơn đăng ký");
      return;
    }

    setShowCancelConfirm(true);
  };

  const handleWithdrawClick = (event) => {
    event.stopPropagation();

    if (!applicationId) {
      toast.error("Không tìm thấy đơn đăng ký");
      return;
    }

    setShowWithdrawModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!applicationId) return;

    try {
      await cancelApplication(applicationId);
      toast.success("Đã hủy đơn đăng ký thành công");
      setShowCancelConfirm(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Hủy đơn thất bại. Vui lòng thử lại.",
      );
    }
  };

  const handleSubmitWithdraw = async (reason) => {
    if (!applicationId) return;

    try {
      await requestWithdraw({
        id: applicationId,
        reason,
      });
      toast.success("Đã gửi yêu cầu xin rút thành công");
      setShowWithdrawModal(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Gửi yêu cầu xin rút thất bại. Vui lòng thử lại.",
      );
    }
  };

  const handleUpdate = async (updateData) => {
    if (!applicationId) return;

    try {
      await updateApplication({
        id: applicationId,
        data: updateData,
      });
      toast.success("Cập nhật đơn đăng ký thành công");
      setShowEditModal(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Cập nhật thất bại. Vui lòng thử lại.",
      );
    }
  };

  if (hasApplied) {
    const StatusIcon = statusConfig.icon;

    return (
      <>
        <div className="flex flex-col gap-2">
          <button
            disabled={statusConfig.disabled || isUpdatingProject}
            onClick={
              statusConfig.disabled || isUpdatingProject
                ? undefined
                : handlePrimaryClick
            }
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold ${statusConfig.className} ${className}`}
          >
            <StatusIcon className="h-5 w-5" />
            {isUpdatingProject ? "Tạm khóa đăng ký volunteer" : statusConfig.text}
          </button>

          {isCheckingApplication ? (
            <p className="text-xs text-slate-500">Đang đồng bộ trạng thái...</p>
          ) : null}

          {isUpdatingProject ? (
            <p className="text-xs text-amber-700">
              Dự án đang ở trạng thái Updating nên chưa nhận thêm tình nguyện viên mới.
            </p>
          ) : null}

          {applicationStatus === "WITHDRAW_REQUESTED" &&
          application?.withdrawReason ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <div className="font-semibold">Lý do xin rút</div>
              <div className="mt-1 whitespace-pre-wrap">
                {application.withdrawReason}
              </div>
            </div>
          ) : null}

          {applicationStatus === "APPROVED" ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              Nếu muốn rời dự án, bạn cần gửi yêu cầu xin rút và nêu rõ lý do để
              ban tổ chức xét duyệt.
            </div>
          ) : null}

          <div className="flex gap-2">
            {statusConfig.showEdit ? (
              <button
                onClick={handleEditClick}
                disabled={isUpdating}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
              >
                <Edit2 className="h-4 w-4" />
                Chỉnh sửa
              </button>
            ) : null}

            {statusConfig.showCancel ? (
              <button
                onClick={handleCancelClick}
                disabled={isCancelling}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
              >
                {isCancelling ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {statusConfig.cancelText}
                  </>
                )}
              </button>
            ) : null}

            {statusConfig.showWithdraw ? (
              <button
                onClick={handleWithdrawClick}
                disabled={isRequestingWithdraw}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-50 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100"
              >
                {isRequestingWithdraw ? (
                  "Đang gửi..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Xin rút
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {showEditModal ? (
          <VolunteerEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            application={application}
            project={project}
            projectName={effectiveProjectName}
            onUpdate={handleUpdate}
            isUpdating={isUpdating}
          />
        ) : null}

        <CancelConfirmModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={handleConfirmCancel}
          isPending={isCancelling}
        />

        <WithdrawRequestModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          onSubmit={handleSubmitWithdraw}
          isPending={isRequestingWithdraw}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={handlePrimaryClick}
          disabled={statusConfig.disabled || isUpdatingProject}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black transition-all ${statusConfig.className} ${className}`}
        >
          <Users className="h-5 w-5" />
          {isUpdatingProject ? "Tạm khóa đăng ký volunteer" : statusConfig.text}
        </button>

        {isCheckingApplication ? (
          <p className="text-xs text-slate-500">Đang đồng bộ trạng thái...</p>
        ) : null}

        {isUpdatingProject ? (
          <p className="text-xs text-amber-700">
            Dự án đang được organizer cập nhật lại theo yêu cầu từ quản trị viên.
          </p>
        ) : null}
      </div>

      <VolunteerApplicationModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        project={project}
        projectId={effectiveProjectId}
        projectName={effectiveProjectName}
        onSuccess={() => {
          setShowApplyModal(false);
          toast.success("Đăng ký thành công!");
        }}
      />
    </>
  );
};

const BaseCenteredModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

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

const CancelConfirmModal = ({ isOpen, onClose, onConfirm, isPending }) => {
  return (
    <BaseCenteredModal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Xác nhận hủy đơn" onClose={onClose} />

      <p className="mb-6 text-gray-600">
        Bạn có chắc chắn muốn hủy đơn đăng ký tình nguyện này không?
      </p>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={isPending}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Giữ lại
        </button>

        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "Đang xử lý..." : "Xác nhận hủy"}
        </button>
      </div>
    </BaseCenteredModal>
  );
};

const WithdrawRequestModal = ({ isOpen, onClose, onSubmit, isPending }) => {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleSubmit = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) return;
    onSubmit(trimmedReason);
    setReason("");
  };

  return (
    <BaseCenteredModal isOpen={isOpen} onClose={handleClose}>
      <ModalHeader title="Gửi yêu cầu xin rút" onClose={handleClose} />

      <p className="mb-4 text-gray-600">
        Vui lòng nêu rõ lý do xin rút. Ban tổ chức sẽ đọc và quyết định đồng ý
        hoặc từ chối.
      </p>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={5}
        placeholder="Nhập lý do xin rút..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
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
          disabled={isPending || !reason.trim()}
          className="flex-1 rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-900 hover:bg-amber-600 disabled:opacity-50"
        >
          {isPending ? "Đang gửi..." : "Gửi yêu cầu"}
        </button>
      </div>
    </BaseCenteredModal>
  );
};

export default ApplyVolunteerButton;
