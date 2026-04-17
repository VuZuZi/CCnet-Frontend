import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import { ToastProvider } from "@/shared/contexts/ToastContext";
import NotificationStreamBootstrap from "@/features/notification/components/NotificationStreamBootstrap";
import { router } from "./router";
import { useAuthInit } from "@/features/auth/hooks/useAuthInit";

function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </QueryProvider>
  );
}

function AppContent() {
  const { isLoading } = useAuthInit();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="animate-pulse font-medium text-slate-500">
            Khởi tạo hệ thống...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NotificationStreamBootstrap />
      <RouterProvider router={router} />
    </>
  );
}

export default App;