import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import { ToastProvider } from "@/shared/contexts/ToastContext";
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Khởi tạo hệ thống...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;