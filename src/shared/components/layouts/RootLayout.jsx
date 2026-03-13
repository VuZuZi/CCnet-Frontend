import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from '../common/Navbar';

export function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background-light text-slate-900 font-sans selection:bg-primary/30 selection:text-slate-900">
      <Navbar />
      
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>

      <ScrollRestoration />
    </div>
  );
}

export default RootLayout;