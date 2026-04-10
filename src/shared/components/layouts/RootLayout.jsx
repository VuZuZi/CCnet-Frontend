import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import NotificationStreamBootstrap from '@/features/notification/components/NotificationStreamBootstrap';
import AdminNotificationRedirectGate from '@/features/notification/components/AdminNotificationRedirectGate';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background-light font-sans text-slate-900 selection:bg-primary/30 selection:text-slate-900">
      <NotificationStreamBootstrap />
      <AdminNotificationRedirectGate />
      <Navbar />

      <main className="flex w-full flex-1 flex-col">
        <Outlet />
      </main>

      <ScrollRestoration />
    </div>
  );
}

export default RootLayout;