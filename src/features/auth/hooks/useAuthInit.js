import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

export function useAuthInit() {
  const { checkAuthSession, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuthSession();
  }, [checkAuthSession]);

  return {
    isLoading, 
    isAuthenticated,
  };
}