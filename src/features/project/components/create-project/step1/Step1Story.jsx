import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { strictStep1Schema } from "@/features/project/validations/projectSchema";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useProjectDraftStore } from "@/features/project/stores/useProjectDraftStore";
import {
  useCreateDraftProject,
  useUpdateDraftProject,
} from "@/features/project/hooks/useProjectMutations";
import { persistProjectDraft } from "@/features/project/services/projectDraftPersist.service";
import {
  buildStep1Payload,
  getProjectTierLimits,
} from "@/features/project/utils/projectDraft.utils";
import { useToast } from "@/shared/contexts/ToastContext";

import Step1BasicInfoSection from "./Step1BasicInfoSection";
import Step1StorySection from "./Step1StorySection";
import Step1MediaSection from "./Step1MediaSection";
import Step1StickyActions from "./Step1StickyActions";
import Step1SaveDraftModal from "./Step1SaveDraftModal";
import {
  buildDraftMetaFromValues,
  buildStep1DefaultValues,
} from "./utils/step1Story.utils";

export default function Step1Story() {
  const navigate = useNavigate();
  const toast = useToast();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [draftMeta, setDraftMeta] = useState({
    title: "",
    projectType: "FUNDED",
  });

  const user = useAuthStore((state) => state.user);
  const { maxDurationDays } = getProjectTierLimits(user?.kycTier || 1);

  const {
    formData,
    updateFormData,
    addDeletedDocumentId,
    clearDeletedDocumentIds,
    nextStep,
    projectId,
    setProjectId,
  } = useProjectDraftStore();

  const { mutateAsync: createDraft, isPending: isCreating } =
    useCreateDraftProject();
  const { mutateAsync: updateDraft, isPending: isUpdating } =
    useUpdateDraftProject();

  const isPending = isCreating || isUpdating;

  const defaultValues = useMemo(
    () => buildStep1DefaultValues(formData),
    [formData],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(strictStep1Schema(maxDurationDays)),
    defaultValues,
  });

  const persistDraft = async ({
    data,
    silent = false,
    exitAfterSave = false,
    navigateToEditAfterCreate = false,
  }) => {
    const payload = buildStep1Payload(data, formData.fromHelpRequestId);
    const hadProjectId = Boolean(projectId);

    updateFormData(payload);

    const result = await persistProjectDraft({
      projectId,
      formData,
      payload,
      createDraft,
      updateDraft,
      setProjectId,
      deletedDocumentIds: formData.deletedDocumentIds,
      silent,
    });

    if (hadProjectId) {
      clearDeletedDocumentIds();
    }

    if (navigateToEditAfterCreate && result.projectId && !hadProjectId) {
      navigate(`/projects/create/${result.projectId}/edit`, { replace: true });
    }

    if (exitAfterSave) {
      toast.success("Draft saved securely!");
      navigate("/projects");
    }

    return result;
  };

  const onInvalid = () => {
    toast.error("Dữ liệu chưa hợp lệ. Vui lòng kiểm tra các mục được bôi đỏ!");
  };

  const handleNextStep = handleSubmit(async (validData) => {
    const payload = buildStep1Payload(validData, formData.fromHelpRequestId);

    try {
      await persistProjectDraft({
        projectId,
        formData,
        payload,
        createDraft,
        updateDraft,
        setProjectId,
        deletedDocumentIds: formData.deletedDocumentIds,
        silent: true,
      });

      if (projectId) {
        clearDeletedDocumentIds();
      }

      updateFormData(payload);
      nextStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Không thể lưu bước hiện tại. Vui lòng thử lại.");
    }
  }, onInvalid);

  const openSaveModal = () => {
    setDraftMeta(buildDraftMetaFromValues(getValues));
    setIsSaveModalOpen(true);
  };

  const confirmSaveDraft = async () => {
    setValue("title", draftMeta.title);
    setValue("projectType", draftMeta.projectType);
    setIsSaveModalOpen(false);

    const currentData = getValues();
    const dataToSave = {
      ...currentData,
      title: draftMeta.title,
      projectType: draftMeta.projectType,
    };

    try {
      await persistDraft({
        data: dataToSave,
        exitAfterSave: true,
        navigateToEditAfterCreate: true,
      });
    } catch {
      toast.error("Không thể lưu draft lúc này. Vui lòng thử lại.");
    }
  };

  const handleRemoveDocument = (file) => {
    if (file?._id) {
      addDeletedDocumentId(file._id);
    }
  };

  return (
    <form
      onSubmit={handleNextStep}
      className="animate-in fade-in slide-in-from-bottom-4 pb-32 duration-500"
    >
      <fieldset
        disabled={isPending}
        className="group grid grid-cols-1 gap-8 transition-opacity duration-300 disabled:cursor-not-allowed disabled:opacity-60 lg:grid-cols-12"
      >
        <div className="space-y-6 lg:col-span-7">
          <Step1BasicInfoSection
            register={register}
            control={control}
            watch={watch}
            errors={errors}
          />

          <Step1StorySection
            register={register}
            control={control}
            errors={errors}
          />
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Step1MediaSection
            control={control}
            errors={errors}
            onRemoveDocument={handleRemoveDocument}
          />
        </div>
      </fieldset>

      <Step1StickyActions
        isPending={isPending}
        onSaveDraft={openSaveModal}
      />

      <Step1SaveDraftModal
        isOpen={isSaveModalOpen}
        draftMeta={draftMeta}
        setDraftMeta={setDraftMeta}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={confirmSaveDraft}
        isPending={isPending}
      />
    </form>
  );
}