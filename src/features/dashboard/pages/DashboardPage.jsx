
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { 
  FolderKanban, 
  CheckCircle2, 
  Users, 
  Trophy, 
  Sparkles 
} from 'lucide-react';
import { getRoleLabel } from '@/shared/lib/roleLabels';

export function DashboardPage() {
  const user = useAuthStore(authSelectors.user);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <header className="mb-8">
          <h1 className="mb-2 flex items-center text-3xl font-bold tracking-tight text-gray-900">
            Chào mừng trở lại, {user?.fullName || 'Người dùng'}! 
            <Sparkles className="ml-3 h-8 w-8 text-amber-500" aria-hidden="true" />
          </h1>
          <p className="text-gray-500">Đây là những gì đang xảy ra với tài khoản của bạn hôm nay.</p>
        </header>

        <section 
          className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Thống kê chính"
        >
          <StatsCard 
            title="Tổng dự án" 
            value="12" 
            icon={<FolderKanban className="h-6 w-6" />} 
            color="purple" 
          />
          <StatsCard 
            title="Tác vụ hoạt động" 
            value="24" 
            icon={<CheckCircle2 className="h-6 w-6" />} 
            color="green" 
          />
          <StatsCard 
            title="Thành viên nhóm" 
            value="8" 
            icon={<Users className="h-6 w-6" />} 
            color="blue" 
          />
          <StatsCard 
            title="Đã hoàn thành" 
            value="156" 
            icon={<Trophy className="h-6 w-6" />} 
            color="yellow" 
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2">
          <article className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Thông tin tài khoản</h2>
            
            <dl className="space-y-4">
              <div>
                <dt className="mb-1 text-sm font-medium text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">{user?.email || 'Không có'}</dd>
              </div>
              
              <div>
                <dt className="mb-1 text-sm font-medium text-gray-500">Vai trò</dt>
                <dd>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {getRoleLabel(user?.role, 'Khách')}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="mb-1 text-sm font-medium text-gray-500">ID người dùng</dt>
                <dd>
                  <code className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600">
                    {user?.userId || 'Không có'}
                  </code>
                </dd>
              </div>
            </dl>
          </article>
        </section>

      </div>
    </main>
  );
}

function StatsCard({ title, value, icon, color }) {
  const colorStyles = {
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-amber-100 text-amber-700',
  };

  return (
    <article className="flex h-full flex-col justify-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-3xl font-bold tracking-tight text-gray-900">{value}</p>
        </div>
        <div 
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${colorStyles[color]}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </article>
  );
}
