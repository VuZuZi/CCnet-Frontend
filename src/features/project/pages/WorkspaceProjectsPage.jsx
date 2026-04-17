import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  PlusCircle,
  Clock3,
  CheckCircle2,
  PauseCircle,
  XCircle,
  FileText,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useWorkspaceProjects } from "../hooks/useProjectQueries";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { useConversations } from "@/features/chat/hooks/conversations/useConversations";

const DEFAULT_PAGE_SIZE = 12;

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING_APPROVAL", label: "Chờ duyệt" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "DRAFT", label: "Bản nháp" },
];

const STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700 border-amber-200",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PAUSED: "bg-orange-100 text-orange-700 border-orange-200",
  COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_ICONS = {
  DRAFT: FileText,
  PENDING_APPROVAL: Clock3,
  ACTIVE: CheckCircle2,
  PAUSED: PauseCircle,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
};

const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");

const StatusBadge = ({ status }) => {
  const Icon = STATUS_ICONS[status] || FileText;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      <Icon size={14} />
      {status}
    </span>
  );
};

const Pagination = ({ pagination, onPageChange, isFetching }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const currentPage = Number(pagination.currentPage || 1);
  const totalPages = Number(pagination.totalPages || 1);

  return (
    <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
      <p className="text-sm text-slate-500">
        Tổng {pagination.totalItems} dự án • Trang {currentPage}/{totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isFetching}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Trước
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isFetching}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sau
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export function WorkspaceProjectsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch, isFetching } = useWorkspaceProjects({
    page,
    limit: DEFAULT_PAGE_SIZE,
    status,
  });

  const { conversations = [] } = useConversations();

  const projects = useMemo(() => data?.projects || [], [data]);
  const pagination = data?.pagination || null;

  const projectConversationMap = useMemo(() => {
    const map = new Map();

    for (const conversation of conversations || []) {
      const projectId = String(conversation?.projectId || "");
      if (!projectId) continue;
      map.set(projectId, conversation);
    }

    return map;
  }, [conversations]);

  const handleChangeStatus = (nextStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    if (!pagination) return;
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  const handleOpenProjectGroup = (projectId) => {
    const conversation = projectConversationMap.get(String(projectId));
    if (!conversation?._id) return;
    navigate(`/messages/${conversation._id}`);
  };

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-100 bg-white p-10 text-center font-semibold text-red-500">
            Không thể tải danh sách dự án workspace.
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-100 p-3">
                <FolderKanban className="text-amber-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                  Dự án của tôi
                </h1>
                <p className="mt-2 text-slate-500">
                  Theo dõi toàn bộ dự án của bạn, bao gồm bản nháp, chờ duyệt và đang hoạt động.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                {isFetching ? "Đang cập nhật..." : "Làm mới"}
              </button>

              <Link
                to="/projects/create"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-slate-900 shadow-sm transition-colors hover:bg-amber-600"
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
                onClick={() => handleChangeStatus(option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  status === option.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center">
            <p className="text-lg font-semibold text-slate-700">
              Chưa có dự án nào trong mục này.
            </p>
            <p className="mt-2 text-slate-500">
              Thử đổi bộ lọc trạng thái hoặc tạo một dự án mới.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {projects.map((project) => {
                const conversation = projectConversationMap.get(String(project._id));
                const canOpenProjectGroup =
                  project.status === "ACTIVE" && Boolean(conversation?._id);

                return (
                  <div
                    key={project._id}
                    className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="line-clamp-2 text-xl font-bold text-slate-900">
                          {project.title}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                          {project.category || "Chưa phân loại"}
                        </p>
                      </div>

                      <StatusBadge status={project.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Mục tiêu
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {formatCurrency(project.targetAmount)} VND
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Hiện có
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {formatCurrency(project.currentAmount)} VND
                        </p>
                      </div>
                    </div>

                    {project.currentMilestone ? (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                          Mốc hiện tại
                        </p>
                        <p className="mt-1 font-bold text-slate-900">
                          {project.currentMilestone.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Mốc {project.currentMilestone.index} • {formatCurrency(project.currentMilestone.targetAmount)} VND
                        </p>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Link
                        to={`/projects/${project._id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Eye size={16} />
                        Xem chi tiết
                      </Link>

                      {project.status === "DRAFT" ? (
                        <Link
                          to={`/projects/create/${project._id}/edit`}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-800"
                        >
                          <FileText size={16} />
                          Tiếp tục chỉnh sửa
                        </Link>
                      ) : null}

                      {canOpenProjectGroup ? (
                        <button
                          type="button"
                          onClick={() => handleOpenProjectGroup(project._id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-900 transition-colors hover:bg-amber-500"
                        >
                          <MessageCircle size={16} />
                          Mở nhóm chat
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
              isFetching={isFetching}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default WorkspaceProjectsPage;