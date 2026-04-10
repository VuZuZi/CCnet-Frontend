import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  PlusCircle,
  Search,
  Filter,
  Clock3,
  CheckCircle2,
  PauseCircle,
  XCircle,
  ArrowRight,
  CalendarDays,
  HandHeart,
  Target,
  MapPin,
  Layers3,
  HeartHandshake,
  Eye,
  FileText,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useWorkspaceProjects } from '../hooks/useProjectQueries';
import { PageLoader } from '@/shared/components/ui/PageLoader';

const PAGE_SIZE = 10;
const DRAFT_PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'PAUSED', label: 'Tạm dừng' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã từ chối' },
];

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả loại dự án' },
  { value: 'FUNDED', label: 'Funded' },
  { value: 'VOLUNTEER_ONLY', label: 'Volunteer Only' },
];

const STATUS_LABELS = {
  DRAFT: 'Bản nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  ACTIVE: 'Đang hoạt động',
  PAUSED: 'Tạm dừng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã từ chối',
};

const STATUS_ICONS = {
  DRAFT: Clock3,
  PENDING_APPROVAL: Clock3,
  ACTIVE: CheckCircle2,
  PAUSED: PauseCircle,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function formatDate(value) {
  if (!value) return 'Chưa cập nhật';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Chưa cập nhật';
  return d.toLocaleDateString('vi-VN');
}

function computeVolunteerTarget(project) {
  const statsTarget = Number(project?.stats?.targetVolunteers || 0);
  if (statsTarget > 0) return statsTarget;
  const roles = Array.isArray(project?.volunteerRoles) ? project.volunteerRoles : [];
  return roles.reduce((sum, role) => sum + Number(role?.quantity || 0), 0);
}

function getDonationProgress(project) {
  const target = Number(project?.targetAmount || 0);
  const raised = Number(project?.currentAmount || 0);
  if (target <= 0) return 0;
  return Math.min(100, Math.round((raised / target) * 100));
}

function getTypeLabel(projectType) {
  return projectType === 'VOLUNTEER_ONLY' ? 'Volunteer Only' : 'Funded';
}

export function OrganizerWorkspacePage() {
  const [status, setStatus] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [projectType, setProjectType] = useState('ALL');
  const [volunteerMode, setVolunteerMode] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [draftKeyword, setDraftKeyword] = useState('');
  const [draftType, setDraftType] = useState('ALL');
  const [draftCurrentPage, setDraftCurrentPage] = useState(1);

  const { data, isLoading, isError } = useWorkspaceProjects({
    page: 1,
    limit: 100,
    status,
  });

  const { data: draftData, isLoading: isDraftLoading } = useWorkspaceProjects({
    page: 1,
    limit: 100,
    status: 'DRAFT',
  });

  const projects = useMemo(() => {
    const allProjects = data?.projects || [];
    return allProjects.filter((project) => String(project?.status || '') !== 'DRAFT');
  }, [data]);
  const draftProjects = useMemo(() => draftData?.projects || [], [draftData]);

  const filteredProjects = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesKeyword =
        !normalizedKeyword ||
        String(project?.title || '').toLowerCase().includes(normalizedKeyword) ||
        String(project?.category || '').toLowerCase().includes(normalizedKeyword) ||
        String(project?.location?.address || '').toLowerCase().includes(normalizedKeyword);

      const matchesType =
        projectType === 'ALL' || String(project?.projectType || '') === projectType;

      const needsVolunteers = Boolean(project?.needsVolunteers);
      const matchesVolunteerMode =
        volunteerMode === 'ALL' ||
        (volunteerMode === 'NEEDS' && needsVolunteers) ||
        (volunteerMode === 'NO_NEEDS' && !needsVolunteers);

      return matchesKeyword && matchesType && matchesVolunteerMode;
    });
  }, [projects, keyword, projectType, volunteerMode]);

  const summary = useMemo(() => {
    const totals = {
      total: filteredProjects.length,
      active: 0,
      pending: 0,
      draft: draftProjects.length,
      raised: 0,
      target: 0,
      volunteerTarget: 0,
      volunteerCurrent: 0,
    };

    filteredProjects.forEach((project) => {
      const status = String(project?.status || '');
      if (status === 'ACTIVE') totals.active += 1;
      if (status === 'PENDING_APPROVAL') totals.pending += 1;
      totals.raised += Number(project?.currentAmount || 0);
      totals.target += Number(project?.targetAmount || 0);
      totals.volunteerCurrent += Number(project?.stats?.currentVolunteers || 0);
      totals.volunteerTarget += computeVolunteerTarget(project);
    });

    return totals;
  }, [filteredProjects, draftProjects.length]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const activeCurrentPage = Math.min(currentPage, totalPages);

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  const handleProjectTypeChange = (event) => {
    setProjectType(event.target.value);
    setCurrentPage(1);
  };

  const handleVolunteerModeChange = (event) => {
    setVolunteerMode(event.target.value);
    setCurrentPage(1);
  };

  const handleDraftKeywordChange = (event) => {
    setDraftKeyword(event.target.value);
    setDraftCurrentPage(1);
  };

  const handleDraftTypeChange = (event) => {
    setDraftType(event.target.value);
    setDraftCurrentPage(1);
  };

  const filteredDraftProjects = useMemo(() => {
    const normalizedKeyword = draftKeyword.trim().toLowerCase();

    return draftProjects.filter((draft) => {
      const matchesKeyword =
        !normalizedKeyword ||
        String(draft?.title || '').toLowerCase().includes(normalizedKeyword) ||
        String(draft?.category || '').toLowerCase().includes(normalizedKeyword) ||
        String(draft?.location?.address || '').toLowerCase().includes(normalizedKeyword);

      const matchesType = draftType === 'ALL' || String(draft?.projectType || '') === draftType;

      return matchesKeyword && matchesType;
    });
  }, [draftProjects, draftKeyword, draftType]);

  const draftTotalPages = Math.max(1, Math.ceil(filteredDraftProjects.length / DRAFT_PAGE_SIZE));
  const activeDraftPage = Math.min(draftCurrentPage, draftTotalPages);

  const paginatedDraftProjects = useMemo(() => {
    const start = (activeDraftPage - 1) * DRAFT_PAGE_SIZE;
    return filteredDraftProjects.slice(start, start + DRAFT_PAGE_SIZE);
  }, [filteredDraftProjects, activeDraftPage]);

  const visibleDraftPages = useMemo(() => {
    const pages = [];
    const windowSize = 5;
    const start = Math.max(1, activeDraftPage - 2);
    const end = Math.min(draftTotalPages, start + windowSize - 1);

    for (let p = start; p <= end; p += 1) {
      pages.push(p);
    }

    return pages;
  }, [activeDraftPage, draftTotalPages]);

  const paginatedProjects = useMemo(() => {
    const start = (activeCurrentPage - 1) * PAGE_SIZE;
    return filteredProjects.slice(start, start + PAGE_SIZE);
  }, [filteredProjects, activeCurrentPage]);

  const visiblePages = useMemo(() => {
    const pages = [];
    const windowSize = 5;
    const start = Math.max(1, activeCurrentPage - 2);
    const end = Math.min(totalPages, start + windowSize - 1);

    for (let p = start; p <= end; p += 1) {
      pages.push(p);
    }

    return pages;
  }, [activeCurrentPage, totalPages]);

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-100 bg-white p-10 text-center text-red-500">
          Không thể tải dữ liệu workspace.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FFFCF5_0%,#F8FAFC_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-100 p-3">
                <BriefcaseBusiness className="text-amber-700" size={24} />
              </div>
              <div>
                <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
                  Không gian làm việc của bạn
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  Organizer Workspace
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Quản lý toàn bộ dự án của bạn tại một nơi: tạo mới, theo dõi trạng thái, và điều phối các hoạt động.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/projects/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-600"
              >
                <PlusCircle size={16} />
                Tạo dự án mới
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Tổng dự án</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Đang hoạt động</p>
            <p className="mt-1 text-3xl font-black text-emerald-800">{summary.active}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">Chờ duyệt</p>
            <p className="mt-1 text-3xl font-black text-amber-800">{summary.pending}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Bản nháp</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{summary.draft}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Đã gây quỹ</p>
            <p className="mt-1 text-lg font-black text-slate-900">{formatCurrency(summary.raised)}đ</p>
            <p className="text-xs text-slate-500">/{formatCurrency(summary.target)}đ</p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">Volunteer</p>
            <p className="mt-1 text-lg font-black text-sky-900">
              {summary.volunteerCurrent}/{summary.volunteerTarget}
            </p>
            <p className="text-xs text-sky-700">đang tham gia / cần tuyển</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">Danh sách bản nháp</h2>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              {isDraftLoading ? 'Đang tải...' : `${filteredDraftProjects.length} draft`}
            </span>
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Filter size={18} />
              <h3 className="text-sm font-bold uppercase tracking-[0.08em]">Bộ lọc bản nháp</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                <input
                  value={draftKeyword}
                  onChange={handleDraftKeywordChange}
                  placeholder="Tìm draft theo tên, category, địa chỉ..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                />
              </label>

              <select
                value={draftType}
                onChange={handleDraftTypeChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isDraftLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
              Đang tải danh sách bản nháp...
            </div>
          ) : filteredDraftProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-semibold text-slate-700">Hiện chưa có bản nháp nào.</p>
              <p className="mt-2 text-sm text-slate-500">Bạn có thể tạo dự án mới và lưu lại để tiếp tục sau.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {paginatedDraftProjects.map((draft) => (
                <div key={draft._id} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900">{draft.title || 'Draft chưa có tiêu đề'}</p>
                      <p className="mt-1 text-xs text-slate-600">Cập nhật: {formatDate(draft.updatedAt || draft.createdAt)}</p>
                    </div>
                    <span className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-bold text-amber-700">
                      DRAFT
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">{getTypeLabel(draft?.projectType)}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">{draft?.category || 'Chưa phân loại'}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-600">
                      {formatCurrency(draft?.currentAmount)}đ / {formatCurrency(draft?.targetAmount)}đ
                    </p>
                    <Link
                      to={`/projects/create/${draft._id}/edit`}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Tiếp tục điền
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold text-slate-500">
                  Hiển thị {(activeDraftPage - 1) * DRAFT_PAGE_SIZE + 1} - {Math.min(activeDraftPage * DRAFT_PAGE_SIZE, filteredDraftProjects.length)} trên tổng {filteredDraftProjects.length} bản nháp
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDraftCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={activeDraftPage === 1}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trước
                  </button>

                  {visibleDraftPages.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setDraftCurrentPage(pageNumber)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                        pageNumber === activeDraftPage
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setDraftCurrentPage((prev) => Math.min(draftTotalPages, prev + 1))}
                    disabled={activeDraftPage === draftTotalPages}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">Danh sách dự án của bạn</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                {filteredProjects.length} dự án
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                Trang {activeCurrentPage}/{totalPages}
              </span>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Filter size={18} />
              <h3 className="text-sm font-bold uppercase tracking-[0.08em]">Bộ lọc</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                <input
                  value={keyword}
                  onChange={handleKeywordChange}
                  placeholder="Tìm theo tên, category, địa chỉ..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                />
              </label>

              <select
                value={status}
                onChange={handleStatusChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={projectType}
                onChange={handleProjectTypeChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={volunteerMode}
                onChange={handleVolunteerModeChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              >
                <option value="ALL">Tất cả nhu cầu volunteer</option>
                <option value="NEEDS">Cần volunteer</option>
                <option value="NO_NEEDS">Không cần volunteer</option>
              </select>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="font-semibold text-slate-700">Không có dự án phù hợp bộ lọc.</p>
              <p className="mt-2 text-sm text-slate-500">Bạn có thể đổi bộ lọc hoặc tạo dự án mới.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedProjects.map((project) => {
                const status = String(project?.status || 'DRAFT');
                const StatusIcon = STATUS_ICONS[status] || Clock3;
                const donationProgress = getDonationProgress(project);
                const volunteerTarget = computeVolunteerTarget(project);
                const volunteerCurrent = Number(project?.stats?.currentVolunteers || 0);
                const needsVolunteers = Boolean(project?.needsVolunteers);

                return (
                  <div
                    key={project._id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                            <StatusIcon size={14} />
                            {STATUS_LABELS[status] || status}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            <Layers3 size={13} className="mr-1 inline" />
                            {getTypeLabel(project?.projectType)}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {project?.category || 'Chưa phân loại'}
                          </span>
                        </div>

                        <p className="text-lg font-bold text-slate-900">{project.title}</p>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {formatDate(project?.startDate)} - {formatDate(project?.endDate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} />
                            {project?.location?.address || 'Chưa cập nhật địa điểm'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/projects/${project._id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Eye size={14} />
                          Chi tiết
                        </Link>

                        {project.status === 'DRAFT' && (
                          <Link
                            to={`/projects/create/${project._id}/edit`}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            <FileText size={14} />
                            Chỉnh sửa
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">
                          Donate / Raise
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {formatCurrency(project?.currentAmount)}đ / {formatCurrency(project?.targetAmount)}đ
                        </p>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-100">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#F59E0B_0%,#D97706_100%)]"
                            style={{ width: `${donationProgress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs font-semibold text-amber-700">{donationProgress}% đạt mục tiêu</p>
                      </div>

                      <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">Volunteer</p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <HandHeart size={14} className="text-sky-700" />
                          {volunteerCurrent}/{volunteerTarget}
                        </p>
                        <p className="mt-1 text-xs text-sky-700">
                          {needsVolunteers ? 'Đang tuyển volunteer' : 'Không tuyển volunteer'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Mục tiêu dự án</p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <Target size={14} className="text-emerald-700" />
                          {project?.projectType === 'VOLUNTEER_ONLY' ? 'Volunteer Impact' : 'Fundraising Impact'}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700">
                          Tạo ngày {formatDate(project?.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold text-slate-500">
                  Hiển thị {(activeCurrentPage - 1) * PAGE_SIZE + 1} - {Math.min(activeCurrentPage * PAGE_SIZE, filteredProjects.length)} trên tổng {filteredProjects.length} dự án
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={activeCurrentPage === 1}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trước
                  </button>

                  {visiblePages.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                        pageNumber === activeCurrentPage
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={activeCurrentPage === totalPages}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-emerald-800">
              <HeartHandshake size={18} />
              <span className="font-semibold">Bạn có NeedHelp được gán từ admin?</span>
            </div>
            <Link
              to="/organizer/need-help"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Mở danh sách NeedHelp
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrganizerWorkspacePage;
