// src/features/admin/components/ProjectManagement.jsx
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Calendar, Users, Wallet, Eye, Clock, Trash2, RefreshCw, Search } from "lucide-react";
import { useState, useMemo } from "react";
import AdminProjectDetailModal from "../components/projects/AdminProjectDetailModal";
import { PROJECT_STATUS } from "@/shared/constants/project";

const ProjectManagement = () => {
  const { t } = useTranslation();
  const { projects, deleteProject, updateProjectStatus } = useAdminDashboard("projects");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  const stripHtml = (value) => {
    if (!value) return "";
    return String(value).replace(/<[^>]*>/g, "").trim();
  };

  const toText = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (Array.isArray(value)) return value.map((v) => toText(v)).join(" ");
    if (typeof value === "object") {
      if (typeof value.address === "string") return value.address;
      try {
        return JSON.stringify(value);
      } catch {
        return "";
      }
    }
    return "";
  };

  const formatVnd = (value) => Number(value || 0).toLocaleString("vi-VN");

  // Hàm tính số ngày còn lại
  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const UI_STATUS = {
    ACTIVE: "ACTIVE",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    DRAFT: "DRAFT",
    PAUSED: "PAUSED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  };

  const mapProjectStatus = (status) => {
    const normalized = String(status || "").trim().toUpperCase();
    if (["ACTIVE", PROJECT_STATUS.FUNDING, PROJECT_STATUS.RECRUITING, PROJECT_STATUS.EXECUTING].includes(normalized)) {
      return UI_STATUS.ACTIVE;
    }
    if ([PROJECT_STATUS.COMPLETED_SUCCESSFULLY, PROJECT_STATUS.COMPLETED_PARTIAL, "COMPLETED"].includes(normalized)) {
      return UI_STATUS.COMPLETED;
    }
    if ([PROJECT_STATUS.CANCELLED_BY_PLATFORM, PROJECT_STATUS.CANCELLED_BY_ORGANIZER, PROJECT_STATUS.CANCELLED_FRAUD, PROJECT_STATUS.REJECTED, "CANCELLED"].includes(normalized)) {
      return UI_STATUS.CANCELLED;
    }
    if ([PROJECT_STATUS.PENDING_APPROVAL, PROJECT_STATUS.UNDER_REVIEW].includes(normalized)) {
      return UI_STATUS.PENDING_APPROVAL;
    }
    if (normalized === PROJECT_STATUS.PAUSED) {
      return UI_STATUS.PAUSED;
    }
    if (normalized === PROJECT_STATUS.DRAFT) {
      return UI_STATUS.DRAFT;
    }
    return normalized || UI_STATUS.DRAFT;
  };

  const ACTIVE_STATUS_SET = new Set([
    "ACTIVE",
    PROJECT_STATUS.FUNDING,
    PROJECT_STATUS.RECRUITING,
    PROJECT_STATUS.EXECUTING,
  ]);

  const COMPLETED_STATUS_SET = new Set([
    PROJECT_STATUS.COMPLETED_SUCCESSFULLY,
    PROJECT_STATUS.COMPLETED_PARTIAL,
    "COMPLETED",
  ]);

  const getStatusStyle = (status) => {
    switch (status) {
      case UI_STATUS.ACTIVE:
      case PROJECT_STATUS.FUNDING:
      case PROJECT_STATUS.RECRUITING:
      case PROJECT_STATUS.EXECUTING:
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: "🟢" };
      case PROJECT_STATUS.PENDING_APPROVAL:
      case PROJECT_STATUS.UNDER_REVIEW:
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: "🟡" };
      case PROJECT_STATUS.DRAFT:
        return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: "📝" };
      case PROJECT_STATUS.PAUSED:
        return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", icon: "⏸️" };
      case PROJECT_STATUS.COMPLETED_SUCCESSFULLY:
      case PROJECT_STATUS.COMPLETED_PARTIAL:
      case "COMPLETED":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: "" };
      case PROJECT_STATUS.CANCELLED_BY_PLATFORM:
      case PROJECT_STATUS.CANCELLED_BY_ORGANIZER:
      case PROJECT_STATUS.CANCELLED_FRAUD:
      case PROJECT_STATUS.REJECTED:
      case "CANCELLED":
        return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", icon: "❌" };
      default:
        return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: "📌" };
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      [UI_STATUS.ACTIVE]: "Đang hoạt động",
      [PROJECT_STATUS.FUNDING]: "Đang hoạt động",
      [PROJECT_STATUS.RECRUITING]: "Đang hoạt động",
      [PROJECT_STATUS.EXECUTING]: "Đang hoạt động",
      [PROJECT_STATUS.PENDING_APPROVAL]: "Chờ duyệt",
      [PROJECT_STATUS.UNDER_REVIEW]: "Đang xem xét",
      [PROJECT_STATUS.DRAFT]: "Bản nháp",
      [PROJECT_STATUS.PAUSED]: "Tạm dừng",
      [PROJECT_STATUS.COMPLETED_SUCCESSFULLY]: "Hoàn thành",
      [PROJECT_STATUS.COMPLETED_PARTIAL]: "Hoàn thành",
      [UI_STATUS.PENDING_APPROVAL]: "Chờ duyệt",
      [UI_STATUS.DRAFT]: "Bản nháp",
      [UI_STATUS.PAUSED]: "Tạm dừng",
      [UI_STATUS.COMPLETED]: "Hoàn thành",
      [UI_STATUS.CANCELLED]: "Đã hủy",
      [PROJECT_STATUS.CANCELLED_BY_PLATFORM]: "Đã hủy",
      [PROJECT_STATUS.CANCELLED_BY_ORGANIZER]: "Đã hủy",
      [PROJECT_STATUS.CANCELLED_FRAUD]: "Đã hủy",
      [PROJECT_STATUS.REJECTED]: "Bị từ chối",
    };
    return labels[status] || status;
  };

  const normalizedQuery = useMemo(() => String(searchText || "").trim().toLowerCase(), [searchText]);

  const isMatch = (project) => {
    if (!normalizedQuery) return true;
    const organizer = project?.organizer || project?.organizerId || null;
    const haystack = [
      toText(project?._id),
      toText(project?.title),
      stripHtml(project?.description),
      toText(project?.status),
      toText(project?.location),
      toText(organizer?._id),
      toText(organizer?.fullName),
      toText(organizer?.email),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  };

  // Lọc dự án theo status + search
  const filteredProjects = useMemo(() => {
    const byStatus = filterStatus === "ALL"
      ? projects
      : projects.filter((p) => mapProjectStatus(p.status) === filterStatus);
    return byStatus.filter(isMatch);
  }, [projects, filterStatus, normalizedQuery]);

  // Thống kê số lượng theo status
  const stats = useMemo(() => {
    const counts = {
      total: projects.length,
      ACTIVE: projects.filter((p) => mapProjectStatus(p.status) === UI_STATUS.ACTIVE).length,
      PENDING_APPROVAL: projects.filter((p) => mapProjectStatus(p.status) === PROJECT_STATUS.PENDING_APPROVAL).length,
      DRAFT: projects.filter((p) => mapProjectStatus(p.status) === PROJECT_STATUS.DRAFT).length,
      COMPLETED: projects.filter((p) => mapProjectStatus(p.status) === "COMPLETED").length,
    };
    return counts;
  }, [projects]);

  if (!projects?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">📁</div>
        <p className="text-gray-500">Không có dự án nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý dự án</h1>

        <div className="w-full sm:max-w-sm">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo tên dự án, organizer, email, ID..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === "ALL"
              ? "bg-amber-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Tất cả ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus("PENDING_APPROVAL")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === "PENDING_APPROVAL"
              ? "bg-amber-500 text-white shadow-md"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
          >
            Chờ duyệt ({stats.PENDING_APPROVAL})
          </button>
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === "ACTIVE"
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
          >
            Đang hoạt động ({stats.ACTIVE})
          </button>
          <button
            onClick={() => setFilterStatus("COMPLETED")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === "COMPLETED"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
          >
            Hoàn thành ({stats.COMPLETED})
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const currentAmount = Number(project.currentAmount || 0);
          const targetAmount = Number(project.targetAmount || 0);
          const isFundraising = targetAmount > 0;
          const fundsPercent = isFundraising
            ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
            : 0;

          const volunteerRoles = project?.volunteerRoles || [];
          const rolesCount = Array.isArray(volunteerRoles) ? volunteerRoles.length : 0;
          const totalVolunteersNeeded = Array.isArray(volunteerRoles)
            ? volunteerRoles.reduce((sum, r) => sum + (Number(r?.quantity) || 0), 0)
            : 0;

          const currentVolunteers = Number(project.stats?.currentVolunteers || 0);
          const targetVolunteers = Number(project.stats?.targetVolunteers || 0);
          const hasVolunteerTarget = targetVolunteers > 0;
          const volunteerPercent = hasVolunteerTarget
            ? Math.min(Math.round((currentVolunteers / targetVolunteers) * 100), 100)
            : 0;

          const descriptionText = stripHtml(project.description) || "Không có mô tả";
          const displayStatus = mapProjectStatus(project.status);
          const statusStyle = getStatusStyle(displayStatus);
          const daysRemaining = getDaysRemaining(project.endDate);
          const isExpired = daysRemaining !== null && daysRemaining < 0;
          const coverUrl = project?.coverMedia?.url || null;
          const documentsCount = Array.isArray(project?.documentsMedia) ? project.documentsMedia.length : 0;

          return (
            <div
              key={project._id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Card Header with Gradient */}
              <div className={`relative p-5 ${statusStyle.bg} border-b ${statusStyle.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                          {coverUrl ? (
                            <img src={coverUrl} alt="cover" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 truncate">
                          {project.title}
                        </h3>
                      </div>
                      {/* <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                        {statusStyle.icon} {getStatusLabel(project.status)}
                      </span>
                      {documentsCount > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-white/80 text-slate-600 border border-slate-200">
                          Docs: {documentsCount}
                        </span>
                      )} */}
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {descriptionText}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users size={14} className="text-gray-400" />
                        <span className="font-medium">{project.organizer?.fullName || "N/A"}</span>
                        {project.organizer?.isVerified && (
                          <BadgeCheck size={14} className="text-blue-500" title="Đã xác thực" />
                        )}
                      </div>
                      <span className="text-xs bg-white/80 px-2 py-0.5 rounded-full text-gray-500">
                        {project.organizer?.projectCount || 0} dự án
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <select
                      value={displayStatus}
                      onChange={(e) => updateProjectStatus(project._id, e.target.value)}
                      className="text-xs font-medium border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 hover:border-amber-300 transition-colors cursor-pointer"
                    >
                      <option value="DRAFT">📝 Bản nháp</option>
                      <option value="PENDING_APPROVAL">🟡 Chờ duyệt</option>
                      <option value="ACTIVE">🟢 Kích hoạt</option>
                      <option value="PAUSED">⏸️ Tạm dừng</option>
                      <option value="COMPLETED"> Hoàn thành</option>
                      <option value="CANCELLED">❌ Đã hủy</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateProjectStatus(project._id, "PENDING_APPROVAL")}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title="Gửi duyệt"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={() => deleteProject(project._id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Xóa dự án"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Funds Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Wallet size={14} className="text-amber-500" />
                        <span className="text-xs font-medium text-gray-600">Quỹ dự án</span>
                      </div>
                      <span className="text-xs font-semibold text-amber-600">
                        {isFundraising ? `${fundsPercent}%` : "Chỉ tình nguyện"}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${fundsPercent}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {formatVnd(currentAmount)} / {formatVnd(targetAmount)} VND
                    </div>
                  </div>

                  {/* Volunteers Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-emerald-500" />
                        <span className="text-xs font-medium text-gray-600">Tình nguyện viên</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">
                        {hasVolunteerTarget ? `${volunteerPercent}%` : "N/A"}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${volunteerPercent}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {currentVolunteers.toLocaleString()} / {targetVolunteers.toLocaleString()} người
                      {rolesCount > 0 && (
                        <div className="text-[11px] text-slate-500 font-semibold">
                          Roles: {rolesCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date and Countdown */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      - <Clock size={12} />
                      <span>{formatDate(project.endDate)}</span>
                    </div>
                  </div>

                  {daysRemaining !== null && !isExpired && daysRemaining > 0 && (
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                      <span className="text-xs font-bold text-amber-600">{daysRemaining}</span>
                      <span className="text-xs text-amber-500">ngày còn lại</span>
                    </div>
                  )}

                  {isExpired && mapProjectStatus(project.status) === UI_STATUS.ACTIVE && (
                    <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                      <span className="text-xs font-bold text-red-600">Đã kết thúc</span>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedProject(project)}
                  className="w-full mt-2 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={14} />
                  Xem chi tiết dự án
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AdminProjectDetailModal
        open={Boolean(selectedProject)}
        project={selectedProject}
        onStatusChange={async (projectId, status) => {
          if (!projectId) return;
          const updated = await updateProjectStatus(projectId, status);
          const nextStatus = updated?.status || status;
          setSelectedProject((prev) => (prev ? { ...prev, ...(updated || {}), status: nextStatus } : prev));
          return updated;
        }}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};

export default ProjectManagement;
