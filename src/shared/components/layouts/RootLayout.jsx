import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import ChatWidget from '@/features/chat/components/ChatWidget';

export function RootLayout() {
  return (
    <>
      <div className="app">
        <Navbar />
        <Outlet />
      </div>
      <ChatWidget />
    </>
  );
}

export default RootLayout;
