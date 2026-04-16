import { mergeDraftFormData } from "../utils/projectDraft.utils";

export const persistProjectDraft = async ({
  projectId,
  formData,
  payload,
  createDraft,
  updateDraft,
  setProjectId,
  deletedDocumentIds = [],
  silent = false,
}) => {
  const mergedData = mergeDraftFormData(formData, payload);

  if (!projectId) {
    const created = await createDraft(
      silent ? { ...mergedData, silent: true } : mergedData,
    );

    const nextProjectId = created?._id || null;

    if (nextProjectId) {
      setProjectId(nextProjectId);
    }

    return {
      data: created,
      projectId: nextProjectId,
      mergedData,
      isCreated: true,
    };
  }

  const updated = await updateDraft({
    id: projectId,
    data: {
      ...mergedData,
      deletedDocumentIds,
    },
    ...(silent ? { silent: true } : {}),
  });

  return {
    data: updated,
    projectId,
    mergedData,
    isCreated: false,
  };
};