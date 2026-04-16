import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useProjectDraftStore } from "@/features/project/stores/useProjectDraftStore";
import { useSubmitProject } from "@/features/project/hooks/useProjectMutations";
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

  const { formData, prevStep, projectId } = useProjectDraftStore();

  const { mutateAsync: submitProject, isPending } = useSubmitProject();

  const validationItems = useMemo(
    () => getPreviewValidationItems(formData),
    [formData],
  );

  const isReady = useMemo(
    () => isPreviewReadyToSubmit(formData),
    [formData],
  );

  const handleBack = () => {
    prevStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!projectId) {
      toast.error("Không tìm thấy project draft để submit.");
      return;
    }

    if (!isReady) {
      toast.error("Vui lòng hoàn thiện đầy đủ thông tin trước khi gửi duyệt.");
      return;
    }

    try {
      await submitProject(projectId);
    } catch {
      toast.error("Không thể gửi dự án lúc này. Vui lòng thử lại.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 pb-32 duration-500">
      <PreviewValidationErrors items={validationItems} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <PreviewProjectCard formData={formData} />
        </div>

        <div className="space-y-6 lg:col-span-5">
          <PreviewUploadedMedia formData={formData} />
        </div>
      </div>

      <PreviewStickyActions
        isPending={isPending}
        isReady={isReady}
        onBack={handleBack}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default Step3Preview;