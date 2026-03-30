import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import { ToastProvider } from "@/shared/contexts/ToastContext";
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { router } from "./router";
import { useAuthInit } from "@/features/auth/hooks/useAuthInit";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </QueryProvider>
    </I18nextProvider>
  );
}

function AppContent() {
  const { t } = useTranslation();
  const { isLoading } = useAuthInit();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;