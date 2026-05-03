import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useProjectDetail } from "@/features/project/hooks/useProjectQueries";
import { useAdminDashboard } from "./useAdminDashboard";
import { useToast } from "@/shared/contexts/ToastContext";
import { PROJECT_INTENTS, PROJECT_STATUS } from "@/shared/constants/project";
import { ADMIN_PROJECT_ACTION_KEYS } from "../utils/projectAction.utils";

const createInitialModalState = () => ({
  open: false,
  intent: null,
  actionKey: "",
});

export default function useAdminProjectPreviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: project, isLoading: isFetching, isError } = useProjectDetail(id);
  const { updateProjectStatus } = useAdminDashboard("projects");

  const [activeTab, setActiveTab] = useState("story");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalState, setModalState] = useState(createInitialModalState());

  const highlightFromNotification = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("highlight") === "1";
  }, [location.search]);

  useEffect(() => {
    if (!highlightFromNotification) return;
    setIsHighlighted(true);
    const timer = setTimeout(() => setIsHighlighted(false), 2200);
    return () => clearTimeout(timer);
  }, [highlightFromNotification]);

  const handleApprove = async () => {
    if (!window.confirm("Dự án này sẽ lập tức được công khai. Bạn chắc chứ?")) {
      return;
    }

    try {
      setIsProcessing(true);
      await updateProjectStatus(id, { status: PROJECT_INTENTS.APPROVE });
      toast.success("Dự án đã được phê duyệt thành công!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Dự án này có thể đã được một Quản trị viên khác xử lý."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenModal = (intent) => {
    const actionKey =
      intent === PROJECT_INTENTS.REVISION
        ? ADMIN_PROJECT_ACTION_KEYS.REQUEST_PROJECT_REVISION
        : ADMIN_PROJECT_ACTION_KEYS.REJECT_PROJECT;

    setModalState({
      open: true,
      intent,
      actionKey,
    });
  };

  const handleCloseModal = () => {
    if (isProcessing) return;
    setModalState(createInitialModalState());
  };

  const handleSubmitModal = async (reason) => {
    try {
      setIsProcessing(true);

      await updateProjectStatus(id, {
        status: modalState.intent,
        reason,
      });

      toast.success(
        modalState.intent === PROJECT_INTENTS.REVISION
          ? "Đã gửi yêu cầu chỉnh sửa đến tổ chức."
          : "Dự án đã bị từ chối."
      );

      handleCloseModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isReviewable =
    project?.status === PROJECT_STATUS.PENDING_APPROVAL ||
    project?.status === PROJECT_STATUS.REVISION_REQUESTED;

  const revisionCount = project?.revisionCount || 0;
  const canRequestRevision = revisionCount < 2;

  return {
    id,
    navigate,
    project,
    isFetching,
    isError,
    activeTab,
    setActiveTab,
    isHighlighted,
    isProcessing,
    modalState,
    isReviewable,
    revisionCount,
    canRequestRevision,
    handleApprove,
    handleOpenModal,
    handleCloseModal,
    handleSubmitModal,
  };
}
