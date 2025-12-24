import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { tokenManager } from '@/shared/lib/tokenManager';
import { authEvents } from '@/shared/lib/httpClient'; 
import { authAPI } from '../api/authAPI'; 

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create(
  devtools(
    (set, get) => ({
      ...initialState,

      setAuthSuccess: (user, accessToken) => {
        tokenManager.setAccessToken(accessToken);
        set({ user, isAuthenticated: true, isLoading: false }, false, 'auth/loginSuccess');
      },

      logout: async () => {
        try {
          await authAPI.logout(); 
        } catch (error) {
          console.warn('Logout API failed, forcing local logout');
        } finally {
          tokenManager.removeAccessToken();
          set({ user: null, isAuthenticated: false, isLoading: false }, false, 'auth/logout');
        }
      },

      checkAuthSession: async () => {
        set({ isLoading: true });
        try {
          const data = await authAPI.refreshToken();
          const { accessToken } = data;
          
          tokenManager.setAccessToken(accessToken);
          
          const user = await authAPI.getMe();
          
          set({ user, isAuthenticated: true, isLoading: false }, false, 'auth/restoreSession');
          
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false }, false, 'auth/guestSession');
        }
      },
    }),
    { name: 'AuthStore' }
  )
);

authEvents.addEventListener('logout', () => {
  tokenManager.removeAccessToken();
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});

export const authSelectors = {
  user: (state) => state.user,
  isAuthenticated: (state) => state.isAuthenticated,
  isLoading: (state) => state.isLoading,
  userRole: (state) => state.user?.role,
  userEmail: (state) => state.user?.email,
  userId: (state) => state.user?.id || state.user?.userId, // Support cả 2 trường hợp id
};