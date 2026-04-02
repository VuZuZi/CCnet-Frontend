import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialFormData = {
  title: '',
  category: '',
  location: null, 
  description: '',
  isFundraising: true,
  targetAmount: 0,
  startDate: '', 
  endDate: '',
  needsVolunteers: false,
  milestones: [],
  volunteerRoles: [],
  deletedDocumentIds: [], 
  coverMedia: [],
  documents: [],
  fromHelpRequestId: null,
};

export const useProjectDraftStore = create(
  persist(
    (set) => ({
      currentStep: 1,
      projectId: null,
      formData: initialFormData,

      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
      
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      updateFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),

      addDeletedDocumentId: (id) => set((state) => ({
        formData: { 
          ...state.formData, 
          deletedDocumentIds: [...state.formData.deletedDocumentIds, id] 
        }
      })),

      setProjectId: (id) => set({ projectId: id }),

      resetDraft: () => set({
        currentStep: 1,
        projectId: null,
        formData: initialFormData,
      }),
    }),
    {
      name: 'ccnet-project-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        projectId: state.projectId,
        formData: state.formData,
      }),
    }
  )
);