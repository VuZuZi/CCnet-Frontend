import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-off-white text-black font-sans flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;