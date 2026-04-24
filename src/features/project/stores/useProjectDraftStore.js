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

      setStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 4),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      addDeletedDocumentId: (id) =>
        set((state) => {
          if (state.formData.deletedDocumentIds.includes(id)) return state;

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

      setProjectId: (id) => set({ projectId: id }),

      resetDraft: () =>
        set({
          currentStep: 1,
          projectId: null,
          formData: initialFormData,
        }),
    }),
    {
      name: "ccnet-project-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        projectId: state.projectId,
        formData: {
          ...state.formData,
          deletedDocumentIds: [],
        },
      }),
    }
  )
);