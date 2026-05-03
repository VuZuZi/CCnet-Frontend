import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CheckCircle2, Trash2, AlertTriangle } from "lucide-react";

import { useProjectDraftStore } from "../stores/useProjectDraftStore";
import {
  useProjectDraftDetail,
  useRejectedProjectEditSeed,
} from "../hooks/useProjectQueries";
import { useHelpRequestAsProjectData } from "@/features/needHelp/hooks/useHelpRequestQueries";
import { useToast } from "@/shared/contexts/ToastContext";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";
import Step1Story from "../components/Step1Story";
import Step2Budget from "../components/Step2Budget";
import Step3Preview from "../components/create-project/step3/Step3Preview";

const STEPS = [
  { id: 1, title: "Câu chuyện & minh chứng" },
  { id: 2, title: "Ngân sách & tình nguyện viên" },
  { id: 3, title: "Xem trước & gửi duyệt" },
];

const parseDateLocal = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? "" : format(date, "yyyy-MM-dd");
};

const normalizeCoverMedia = (coverMedia) => {
  if (!coverMedia) return [];

  if (Array.isArray(coverMedia)) {
    return coverMedia.filter(Boolean);
  }

  if (coverMedia.url || coverMedia.publicId || coverMedia._id) {
    return [coverMedia];
  }

  return [];
};

const normalizeDocuments = (documents) => {
  if (!Array.isArray(documents)) return [];
  return documents.filter(Boolean);
};

const normalizeMilestones = (milestones) => {
  if (!Array.isArray(milestones)) return [];

  return milestones.map((milestone) => ({
    ...milestone,
    startDate: parseDateLocal(milestone?.startDate),
    endDate: parseDateLocal(milestone?.endDate),
  }));
};

const buildProjectFormData = (projectData = {}) => ({
  projectType: projectData.projectType || "FUNDED",
  title: projectData.title || "",
  category: projectData.category || "",
  location: projectData.location || null,
  description: projectData.description || "",
  beneficiaryInfo: projectData.beneficiaryInfo || { details: "" },
  targetAmount: Number(projectData.targetAmount || 0),
  startDate: parseDateLocal(projectData.startDate),
  endDate: parseDateLocal(projectData.endDate),
  needsVolunteers: Boolean(projectData.needsVolunteers),
  milestones: normalizeMilestones(projectData.milestones),
  volunteerRoles: Array.isArray(projectData.volunteerRoles)
    ? projectData.volunteerRoles
    : [],
  coverMedia: normalizeCoverMedia(projectData.coverMedia),
  documents: normalizeDocuments(projectData.documents),
  deletedDocumentIds: [],
  fromHelpRequestId: projectData.fromHelpRequestId || null,
});

const buildHelpRequestFormData = (helpRequestData, helpRequestId) => {
  const inferredProjectType =
    helpRequestData.isFundraising === false ? "VOLUNTEER_ONLY" : "FUNDED";

  return {
    projectType: helpRequestData.projectType || inferredProjectType,
    title: helpRequestData.title || "",
    category: helpRequestData.category || "",
    location: helpRequestData.location || null,
    description: helpRequestData.description || "",
    beneficiaryInfo: helpRequestData.beneficiaryInfo || { details: "" },
    targetAmount: Number(helpRequestData.targetAmount || 0),
    startDate: "",
    endDate: "",
    needsVolunteers: false,
    milestones: [],
    volunteerRoles: [],
    coverMedia: normalizeCoverMedia(helpRequestData.coverMedia),
    documents: normalizeDocuments(helpRequestData.documents),
    deletedDocumentIds: [],
    fromHelpRequestId: helpRequestId,
  };
};

export function CreateProjectPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const seededKeyRef = useRef("");

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const helpRequestId = queryParams.get("helpRequestId");
  const mode = String(queryParams.get("mode") || "").toLowerCase();
  const resubmit = String(queryParams.get("resubmit") || "").toLowerCase();

  const isEditMode = Boolean(id || location.pathname.includes("edit"));
  const isRejectedEditMode =
    Boolean(id) &&
    isEditMode &&
    (mode === "rejected" || resubmit === "true" || resubmit === "1");

  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  useBodyScrollLock(isDiscardModalOpen);

  const {
    currentStep,
    updateFormData,
    resetDraft,
    projectId,
    seedDraftFromProject,
    editMode,
    editingRejectedProject,
  } = useProjectDraftStore();

  const {
    data: draftData,
    isLoading: isDraftLoading,
    isError: isDraftError,
  } = useProjectDraftDetail(isRejectedEditMode ? null : id);

  const {
    data: rejectedSeedData,
    isLoading: isRejectedSeedLoading,
    isError: isRejectedSeedError,
  } = useRejectedProjectEditSeed(id, isRejectedEditMode);

  const {
    data: helpRequestData,
    isLoading: isHelpRequestLoading,
    isError: isHelpRequestError,
  } = useHelpRequestAsProjectData(helpRequestId);

  useEffect(() => {
    seededKeyRef.current = "";
  }, [id, mode, resubmit, helpRequestId]);

  useEffect(() => {
    if (!isEditMode && !helpRequestId) {
      return;
    }

    if (isRejectedEditMode && rejectedSeedData?.project) {
      const seedKey = `rejected:${id}`;

      if (seededKeyRef.current === seedKey) {
        return;
      }

      seededKeyRef.current = seedKey;

      seedDraftFromProject({
        projectId: id,
        formData:
          rejectedSeedData.formData ||
          buildProjectFormData(rejectedSeedData.project),
        mode: "rejected",
        step: 1,
      });

      return;
    }

    if (isEditMode && !isRejectedEditMode && draftData) {
      const seedKey = `draft:${id}`;

      if (seededKeyRef.current === seedKey) {
        return;
      }

      seededKeyRef.current = seedKey;

      seedDraftFromProject({
        projectId: id,
        formData: buildProjectFormData(draftData),
        mode: "draft",
        step: 1,
      });

      return;
    }

    if (helpRequestId && helpRequestData) {
      const seedKey = `help-request:${helpRequestId}`;

      if (seededKeyRef.current === seedKey) {
        return;
      }

      seededKeyRef.current = seedKey;

      if (projectId) {
        resetDraft();
      }

      updateFormData(buildHelpRequestFormData(helpRequestData, helpRequestId));
    }
  }, [
    isEditMode,
    isRejectedEditMode,
    rejectedSeedData,
    draftData,
    helpRequestId,
    helpRequestData,
    id,
    projectId,
    resetDraft,
    seedDraftFromProject,
    updateFormData,
  ]);

  const handleDiscardDraft = () => {
    resetDraft();
    setIsDiscardModalOpen(false);
    toast.success(
      editingRejectedProject
        ? "Đã hủy chỉnh sửa dự án bị từ chối."
        : "Đã hủy bản nháp thành công.",
    );
    navigate("/projects");
  };

  const isLoading =
    (isRejectedEditMode && isRejectedSeedLoading) ||
    (!isRejectedEditMode && isEditMode && isDraftLoading) ||
    (helpRequestId && isHelpRequestLoading);

  const isError =
    (isRejectedEditMode && isRejectedSeedError) ||
    (!isRejectedEditMode && isEditMode && isDraftError) ||
    (helpRequestId && isHelpRequestError);

  const isPageReady =
    !isEditMode && !helpRequestId
      ? true
      : Boolean(
          (isRejectedEditMode && rejectedSeedData?.project) ||
            (!isRejectedEditMode && isEditMode && draftData) ||
            (helpRequestId && helpRequestData),
        );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-bold text-slate-500 animate-pulse">
        Đang đồng bộ dữ liệu từ máy chủ...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center font-bold text-red-500">
        Lỗi: Không tìm thấy dữ liệu hoặc bạn không có quyền truy cập.
      </div>
    );
  }

  if (!isPageReady) return null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {editingRejectedProject || editMode === "rejected" ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            <p className="font-bold">Bạn đang chỉnh sửa dự án đã bị từ chối.</p>
            <p className="mt-1">
              Hệ thống đã tự động điền lại toàn bộ dữ liệu cũ của dự án vào
              biểu mẫu. Sau khi chỉnh sửa, hãy gửi lại để Ban quản trị kiểm
              duyệt.
            </p>
          </div>
        ) : null}

        <div className="mb-8 flex items-center justify-between">
          <div className="relative flex w-full max-w-2xl items-center">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isLast = index === STEPS.length - 1;

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <div className="relative z-10 flex flex-1 flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-md transition-all duration-300 ${
                        isActive || isCompleted
                          ? "bg-[#fbbf24] text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? "✓" : step.id}
                    </div>

                    <span
                      className={`absolute top-8 mt-2 whitespace-nowrap text-sm transition-colors ${
                        isActive
                          ? "font-bold text-slate-900"
                          : "font-medium text-slate-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {!isLast ? (
                    <div
                      className={`z-0 -mx-4 h-1 flex-1 rounded-full transition-colors duration-300 ${
                        isCompleted ? "bg-[#fbbf24]" : "bg-slate-200"
                      }`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="ml-8 mt-2 hidden items-center gap-1.5 text-sm text-slate-500 md:flex">
            <CheckCircle2 size={18} className="text-slate-400" />
            {editingRejectedProject || editMode === "rejected"
              ? "Đang chỉnh sửa để gửi lại"
              : "Vừa lưu bản nháp"}

            <span className="mx-2 text-slate-300">|</span>
            <button
              onClick={() => setIsDiscardModalOpen(true)}
              className="flex items-center gap-1 font-medium text-red-500 transition-colors hover:text-red-600"
            >
              <Trash2 size={14} />
              {editingRejectedProject || editMode === "rejected"
                ? "Hủy chỉnh sửa"
                : "Hủy bản nháp"}
            </button>
          </div>
        </div>

        <div className="mt-12 pb-32">
          {currentStep === 1 ? <Step1Story /> : null}
          {currentStep === 2 ? <Step2Budget /> : null}
          {currentStep === 3 ? <Step3Preview /> : null}
        </div>

        {isDiscardModalOpen ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
            <div className="animate-in fade-in zoom-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl duration-150">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="text-red-500" size={24} />
              </div>

              <h3 className="mb-2 text-xl font-bold text-slate-900">
                {editingRejectedProject || editMode === "rejected"
                  ? "Hủy chỉnh sửa dự án?"
                  : "Hủy bản nháp dự án?"}
              </h3>

              <p className="mb-6 text-slate-600">
                {editingRejectedProject || editMode === "rejected"
                  ? "Các thay đổi bạn vừa chỉnh sửa sẽ không được lưu. Dữ liệu dự án gốc vẫn còn trên hệ thống."
                  : "Hành động này sẽ xóa toàn bộ thông tin bạn đã nhập và không thể hoàn tác. Bạn có chắc chắn muốn bắt đầu lại từ đầu không?"}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDiscardModalOpen(false)}
                  className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Tiếp tục soạn thảo
                </button>

                <button
                  onClick={handleDiscardDraft}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 font-bold text-white shadow-lg shadow-red-500/20 transition-colors hover:bg-red-600"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CreateProjectPage;