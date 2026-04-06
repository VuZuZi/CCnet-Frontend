import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  PlusCircle,
  Clock3,
  CheckCircle2,
  PauseCircle,
  XCircle,
  FileText,
  Eye,
} from 'lucide-react';
import { useWorkspaceProjects } from '../hooks/useProjectQueries';
import { PageLoader } from '@/shared/components/ui/PageLoader';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'PAUSED', label: 'Tạm dừng' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã từ chối' },
  { value: 'DRAFT', label: 'Bản nháp' },
];

const STATUS_STYLES = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PAUSED: 'bg-orange-100 text-orange-700 border-orange-200',
  COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_ICONS = {
  DRAFT: FileText,
  PENDING_APPROVAL: Clock3,
  ACTIVE: CheckCircle2,
  PAUSED: PauseCircle,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function StatusBadge({ status }) {
  const Icon = STATUS_ICONS[status] || FileText;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
        STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <Icon size={14} />
      {status}
    </span>
  );
}

export function WorkspaceProjectsPage() {
  const [status, setStatus] = useState('ALL');
  const [page] = useState(1);

  const { data, isLoading, isError, refetch, isFetching } = useWorkspaceProjects({
    page,
    limit: 12,
    status,
  });

  const projects = useMemo(() => data?.projects || [], [data]);
  const pagination = data?.pagination || null;

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-red-100 p-10 text-center text-red-500 font-semibold">
            Không thể tải danh sách dự án workspace.
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-100">
                <FolderKanban className="text-amber-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Dự án của tôi
                </h1>
                <p className="text-slate-500 mt-2">
                  Theo dõi toàn bộ dự án của bạn, bao gồm bản nháp, chờ duyệt và đang hoạt động.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center justify-center px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
              >
                {isFetching ? 'Đang cập nhật...' : 'Làm mới'}
              </button>

              <Link
                to="/projects/create"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-sm transition-colors"
              >
                <PlusCircle size={18} />
                Tạo dự án mới
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  status === option.value
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-14 text-center">
            <p className="text-lg font-semibold text-slate-700">
              Chưa có dự án nào trong mục này.
            </p>
            <p className="text-slate-500 mt-2">
              Thử đổi bộ lọc trạng thái hoặc tạo một dự án mới.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-slate-900 line-clamp-2">
                        {project.title}
                      </h2>
                      <p className="text-sm text-slate-500 mt-2">
                        {project.category || 'Chưa phân loại'}
                      </p>
                    </div>

                    <StatusBadge status={project.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Mục tiêu
                      </p>
                      <p className="text-lg font-bold text-slate-900 mt-1">
                        {formatCurrency(project.targetAmount)} VND
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Hiện có
                      </p>
                      <p className="text-lg font-bold text-slate-900 mt-1">
                        {formatCurrency(project.currentAmount)} VND
                      </p>
                    </div>
                  </div>

                  {project.currentMilestone ? (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                        Mốc hiện tại
                      </p>
                      <p className="font-bold text-slate-900 mt-1">
                        {project.currentMilestone.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Mốc {project.currentMilestone.index} •{' '}
                        {formatCurrency(project.currentMilestone.targetAmount)} VND
                      </p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link
                      to={`/projects/${project._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <Eye size={16} />
                      Xem chi tiết
                    </Link>

                    {project.status === 'DRAFT' && (
                      <Link
                        to={`/projects/create/${project._id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium transition-colors"
                      >
                        <FileText size={16} />
                        Tiếp tục chỉnh sửa
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pagination ? (
              <div className="text-center text-sm text-slate-500 py-2">
                Tổng {pagination.totalItems} dự án • Trang {pagination.currentPage}/
                {pagination.totalPages}
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

export default WorkspaceProjectsPage;