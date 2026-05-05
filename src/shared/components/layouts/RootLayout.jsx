import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import AdminNotificationRedirectGate from '@/features/notification/components/AdminNotificationRedirectGate';
import { GlobalTransactionOverlay } from '../ui/GlobalTransactionOverlay';

export function RootLayout() {
  return (
    <div className="ccnet-page-shell flex min-h-dvh flex-col bg-background-light font-sans text-slate-900 selection:bg-primary/30 selection:text-slate-900">
      <GlobalTransactionOverlay />

      <AdminNotificationRedirectGate />
      <Navbar />

      <main className="flex min-w-0 w-full flex-1 flex-col">
        <Outlet />
      </main>

      <ScrollRestoration
        getKey={(location) => location.pathname}
      />
    </div>
  );
}

export default RootLayout;
