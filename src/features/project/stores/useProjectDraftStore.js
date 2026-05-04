import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialFormData = {
  projectType: "FUNDED",
  title: "",
  category: "",
  location: null,
  description: "",
  beneficiaryInfo: { details: "" },

  startDate: "",
  endDate: "",

  targetAmount: 0,
  milestones: [],

  needsVolunteers: false,
  volunteerRoles: [],

  coverMedia: [],
  documents: [],
  deletedDocumentIds: [],

  fromHelpRequestId: null,
};

export const useProjectDraftStore = create(
  persist(
    (set) => ({
      currentStep: 1,
      projectId: null,
      formData: initialFormData,

      editMode: "draft",
      editingRejectedProject: false,

      setStep: (step) =>
        set({
          currentStep: Math.min(Math.max(Number(step) || 1, 1), 3),
        }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 3),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      updateFormData: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            ...data,
          },
        })),

      replaceFormData: (data) =>
        set({
          formData: {
            ...initialFormData,
            ...(data || {}),
            deletedDocumentIds: [],
          },
        }),

      addDeletedDocumentId: (id) =>
        set((state) => {
          if (!id) return state;

          if (state.formData.deletedDocumentIds.includes(id)) {
            return state;
          }

          return {
            formData: {
              ...state.formData,
              deletedDocumentIds: [...state.formData.deletedDocumentIds, id],
            },
          };
        }),

      clearDeletedDocumentIds: () =>
        set((state) => ({
          formData: {
            ...state.formData,
            deletedDocumentIds: [],
          },
        })),

      setProjectId: (id) =>
        set({
          projectId: id || null,
        }),

      setEditMode: (mode) =>
        set({
          editMode: mode || "draft",
          editingRejectedProject: mode === "rejected",
        }),

      seedDraftFromProject: ({
        projectId,
        formData,
        mode = "draft",
        step = 1,
      } = {}) =>
        set({
          currentStep: Math.min(Math.max(Number(step) || 1, 1), 3),
          projectId: projectId || null,
          editMode: mode,
          editingRejectedProject: mode === "rejected",
          formData: {
            ...initialFormData,
            ...(formData || {}),
            deletedDocumentIds: [],
          },
        }),

      resetDraft: () =>
        set({
          currentStep: 1,
          projectId: null,
          formData: initialFormData,
          editMode: "draft",
          editingRejectedProject: false,
        }),
    }),
    {
      name: "ccnet-project-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        projectId: state.projectId,
        editMode: state.editMode,
        editingRejectedProject: state.editingRejectedProject,
        formData: {
          ...state.formData,
          deletedDocumentIds: [],
        },
      }),
    },
  ),
);