import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  ShieldCheck,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { useProjectDetail } from "@/features/project/hooks/useProjectQueries";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useToast } from "@/shared/contexts/ToastContext";

import { PROJECT_INTENTS, PROJECT_STATUS } from "@/shared/constants/project";
import { ProjectStatusBadge } from "../components/projects/ProjectStatusBadge";
import { ReviewActionModal } from "../components/projects/ReviewActionModal";

import { PageLoader } from "@/shared/components/ui/PageLoader";
import { ProjectCover } from "@/features/project/components/detail/ProjectCover";
import { ProjectHeader } from "@/features/project/components/detail/ProjectHeader";
import { ProjectTabs } from "@/features/project/components/detail/ProjectTabs";
import { TabStory } from "@/features/project/components/detail/TabStory";
import { SidebarPublic } from "@/features/project/components/detail/SidebarPublic";

export default function AdminProjectPreviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: project, isLoading: isFetching, isError } = useProjectDetail(id);
  const { updateProjectStatus } = useAdminDashboard("projects");

  const [activeTab, setActiveTab] = useState("story");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    intent: null,
  });

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
    if (!window.confirm("Dự án này sẽ lập tức được công khai. Bạn chắc chứ?")) return;
    
    try {
      setIsProcessing(true);
      await updateProjectStatus(id, { status: PROJECT_INTENTS.APPROVE });
      toast.success("Dự án đã được phê duyệt thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Dự án này có thể đã được một Quản trị viên khác xử lý.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenModal = (intent) => {
    setModalState({ isOpen: true, intent });
  };

  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalState({ isOpen: false, intent: null });
    }
  };

  const handleSubmitModal = async (feedback) => {
    try {
      setIsProcessing(true);
      await updateProjectStatus(id, {
        status: modalState.intent,
        feedback,
      });
      toast.success(
        modalState.intent === PROJECT_INTENTS.REVISION
          ? "Đã gửi yêu cầu chỉnh sửa đến Organizer."
          : "Dự án đã bị từ chối."
      );
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isFetching) return <PageLoader />;
  if (isError || !project) {
    return (
      <div className="rounded-[28px] border border-red-100 bg-white p-10 text-center text-red-500 shadow-sm">
        Không tìm thấy dự án hoặc dự án đã bị xóa.
      </div>
    );
  }

  const isReviewable = 
    project?.status === PROJECT_STATUS.PENDING_APPROVAL || 
    project?.status === PROJECT_STATUS.REVISION_REQUESTED;
    
  const revisionCount = project?.revisionCount || 0;
  const canRequestRevision = revisionCount < 2;

  const renderTabContent = () => {
    switch (activeTab) {
      case "story": return <TabStory project={project} />;
      case "financials":
      case "community":
        return (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-[#FFFBEB] text-sm font-semibold text-slate-500">
              Nội dung đang được xây dựng...
            </div>
          </div>
        );
      default: return <TabStory project={project} />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/projects")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/30 bg-[#FFFBEB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B45309]">
              <ShieldCheck size={11} />
              Admin Review Panel
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Review Project Submission
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ProjectStatusBadge status={project.status} />

          {isReviewable && (
            <>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <CheckCircle2 size={16} />
                Phê duyệt
              </button>

              {canRequestRevision ? (
                <button
                  type="button"
                  onClick={() => handleOpenModal(PROJECT_INTENTS.REVISION)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <AlertTriangle size={16} />
                  Yêu cầu sửa
                </button>
              ) : (
                <div className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-2 rounded-xl">
                  Đã hết lượt sửa (Lần 3)
                </div>
              )}

              <button
                type="button"
                onClick={() => handleOpenModal(PROJECT_INTENTS.REJECT)}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-600 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <XCircle size={16} />
                Từ chối
              </button>
            </>
          )}
        </div>
      </div>

      <ReviewActionModal
        isOpen={modalState.isOpen}
        intent={modalState.intent}
        isLoading={isProcessing}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
      />

      <div className={`rounded-[32px] transition-all duration-500 ${
          isHighlighted ? "ring-4 ring-[#FBBF24]/35 shadow-[0_0_0_10px_rgba(251,191,36,0.08)]" : ""
        }`}
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.65fr_0.95fr]">
          <div className="space-y-8">
            <ProjectCover project={project} isOrganizer={false} />
            <ProjectHeader project={project} isOrganizer={false} />

            <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
              <ProjectTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOrganizer={false}
              />
            </div>

            {renderTabContent()}
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#F59E0B]">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Submission Summary</h3>
                  <p className="text-sm text-slate-500">Tóm tắt nhanh cho Admin</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Dự án</p>
                  <p className="mt-1 font-semibold text-slate-900">{project.title}</p>
                  <p className="mt-1 inline-flex items-center rounded bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">
                    {project.projectType}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Lịch sử sửa đổi</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Đã sửa: {revisionCount}/2 lần
                  </p>
                  {revisionCount > 0 && (
                    <p className="text-xs text-orange-500 mt-1 font-medium">Cẩn thận: Đã bị Reject để sửa chữa trước đó.</p>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Organizer</p>
                  <p className="mt-1 font-semibold text-slate-900">{project.organizerId?.fullName || "N/A"}</p>
                  <p className="text-xs text-slate-500">{project.organizerId?.email || ""}</p>
                </div>
              </div>
            </div>

            <SidebarPublic project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}