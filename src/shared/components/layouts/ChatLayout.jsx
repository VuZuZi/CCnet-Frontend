import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';

export function ChatLayout() {
  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-hidden bg-[#f5f7fb] text-slate-900">
      <Navbar />
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default ChatLayout;
