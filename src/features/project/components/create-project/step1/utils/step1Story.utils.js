import { getDateInputValue } from "@/features/project/utils/projectDraft.utils";

export const buildStep1DefaultValues = (formData) => ({
  projectType: formData.projectType || "FUNDED",
  title: formData.title || "",
  category: formData.category || "",
  startDate: getDateInputValue(formData.startDate),
  endDate: getDateInputValue(formData.endDate),
  location: formData.location || null,
  description: formData.description || "",
  beneficiaryInfo: formData.beneficiaryInfo || { details: "" },
  coverMedia: Array.isArray(formData.coverMedia) ? formData.coverMedia : [],
  documents: Array.isArray(formData.documents) ? formData.documents : [],
});

export const buildDraftMetaFromValues = (getValues) => ({
  title: getValues("title") || "",
  projectType: getValues("projectType") || "FUNDED",
});