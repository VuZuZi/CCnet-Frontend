import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useProjectDraftStore } from "@/features/project/stores/useProjectDraftStore";
import {
  useResubmitRevisionProject,
  useSubmitProject,
  useUpdateRevisionProject,
} from "@/features/project/hooks/useProjectMutations";
import { useToast } from "@/shared/contexts/ToastContext";

import PreviewProjectCard from "./PreviewProjectCard";
import PreviewUploadedMedia from "./PreviewUploadedMedia";
import PreviewValidationErrors from "./PreviewValidationErrors";
import PreviewStickyActions from "./PreviewStickyActions";
import {
  getPreviewValidationItems,
  isPreviewReadyToSubmit,
} from "./utils/step3Preview.utils";

export function Step3Preview() {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    formData,
    prevStep,
    projectId,
    editMode,
    editingRejectedProject,
  } = useProjectDraftStore();

  const isRejectedResubmitMode =
    editMode === "rejected" || editingRejectedProject;

  const { mutateAsync: submitProject, isPending: isSubmittingDraft } =
    useSubmitProject();

  const {
    mutateAsync: updateRevisionProject,
    isPending: isUpdatingRevision,
  } = useUpdateRevisionProject();

  const {
    mutateAsync: resubmitRevisionProject,
    isPending: isResubmittingRevision,
  } = useResubmitRevisionProject();

  const validationItems = useMemo(
    () => getPreviewValidationItems(formData),
    [formData],
  );

  const isReady = useMemo(
    () => isPreviewReadyToSubmit(formData),
    [formData],
  );

  const isPending =
    isSubmittingDraft || isUpdatingRevision || isResubmittingRevision;

  const handleBack = () => {
    prevStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!projectId) {
      toast.error("Không tìm thấy dự án để gửi kiểm duyệt.");
      return;
    }

    if (!isReady) {
      toast.error("Vui lòng hoàn thiện đầy đủ thông tin trước khi gửi duyệt.");
      return;
    }

    try {
      if (isRejectedResubmitMode) {
        await updateRevisionProject({
          id: projectId,
          data: formData,
          silent: true,
        });

        await resubmitRevisionProject(projectId);
        return;
      }

      await submitProject(projectId);
    } catch {
      toast.error("Không thể gửi dự án lúc này. Vui lòng thử lại.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 pb-32 duration-500">
      {isRejectedResubmitMode ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          <p className="font-bold">Gửi lại dự án đã bị từ chối</p>
          <p className="mt-1">
            Sau khi bấm gửi, hệ thống sẽ lưu các thay đổi mới nhất và chuyển dự
            án về trạng thái chờ kiểm duyệt.
          </p>
        </div>
      ) : null}

      <PreviewValidationErrors items={validationItems} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-7">
          <PreviewProjectCard formData={formData} />
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-5">
          <PreviewUploadedMedia formData={formData} />
        </div>
      </div>

      <PreviewStickyActions
        isPending={isPending}
        isReady={isReady}
        onBack={handleBack}
        onSubmit={handleSubmit}
        submitLabel={
          isRejectedResubmitMode
            ? "Gửi lại để kiểm duyệt"
            : "Gửi dự án để kiểm duyệt"
        }
      />
    </div>
  );
}

export default Step3Preview;