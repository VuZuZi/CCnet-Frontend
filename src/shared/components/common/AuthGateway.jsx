import { Navigate } from "react-router-dom";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { getDefaultRouteByRole } from "@/shared/constants/routes";
import { LandingPage } from "@/pages/LandingPage";

export function AuthGateway() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isLoading = useAuthStore(authSelectors.isLoading);
  const userRole = useAuthStore(authSelectors.userRole);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    const redirectPath = getDefaultRouteByRole(userRole);
    return <Navigate to={redirectPath} replace />;
  }

  return <LandingPage />;
}