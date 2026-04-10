import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowRight, PlusCircle } from 'lucide-react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { ROLES } from '@/shared/constants/roles';

export function OrganizerWorkspaceBar() {
  const userRole = useAuthStore(authSelectors.userRole);
  const normalizedRole = String(userRole || '').toLowerCase();

  if (userRole !== ROLES.ORGANIZER && normalizedRole !== 'organizer') return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl mb-8 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-slate-700">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-xl">
          <LayoutDashboard size={20} className="text-amber-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Không gian làm việc của bạn</h3>
          <p className="text-xs text-slate-400">Quản lý và theo dõi các dự án gây quỹ đang hoạt động.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Link 
          to="/projects/create" 
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-sm font-medium rounded-xl transition-colors"
        >
          <PlusCircle size={16} /> Tạo dự án
        </Link>
        <Link 
          to="/workspace" 
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-bold rounded-xl transition-colors shadow-sm shadow-amber-500/20"
        >
          Vào Workspace <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}