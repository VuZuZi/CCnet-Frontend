import { create } from 'zustand';

export const useNavbarFloatingPanelStore = create((set) => ({
  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  togglePanel: (panel) =>
    set((state) => ({
      activePanel: state.activePanel === panel ? null : panel,
    })),
  closePanel: () => set({ activePanel: null }),
}));

