import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const initialState = {
  currentProject: null,
  filters: {
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

export const useProjectStore = create(
  devtools(
    (set) => ({
      ...initialState,

      setCurrentProject: (project) => {
        set({ currentProject: project }, false, 'project/setCurrent');
      },

      clearCurrentProject: () => {
        set({ currentProject: null }, false, 'project/clearCurrent');
      },

      setFilters: (newFilters) => {
        set(
          (state) => ({
            filters: { ...state.filters, ...newFilters },
          }),
          false,
          'project/setFilters'
        );
      },

      resetFilters: () => {
        set({ filters: initialState.filters }, false, 'project/resetFilters');
      },
    }),
    { name: 'ProjectStore' }
  )
);

export const projectSelectors = {
  currentProject: (state) => state.currentProject,
  filters: (state) => state.filters,
};
