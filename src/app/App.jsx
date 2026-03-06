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
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading application...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
