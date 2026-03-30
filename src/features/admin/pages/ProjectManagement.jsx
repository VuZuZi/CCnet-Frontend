import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useTranslation } from "react-i18next";
import { BadgeCheck } from "lucide-react";

const ProjectManagement = () => {
  const { t } = useTranslation();
  const { projects, deleteProject, updateProjectStatus } =
    useAdminDashboard("projects");

  const stripHtml = (value) => {
    if (!value) return "";
    return String(value).replace(/<[^>]*>/g, "").trim();
  };

  const formatVnd = (value) => Number(value || 0).toLocaleString("vi-VN");

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "PENDING_APPROVAL":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "DRAFT":
        return "bg-slate-50 text-slate-600 border-slate-200";
      case "PAUSED":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('common.projectManagement')}</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {projects.map((project) => {
            const currentAmount = Number(project.currentAmount || 0);
            const targetAmount = Number(project.targetAmount || 0);
            const isFundraising = targetAmount > 0;
            const fundsPercent = isFundraising
              ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
              : 0;

            const currentVolunteers = Number(project.stats?.currentVolunteers || 0);
            const targetVolunteers = Number(project.stats?.targetVolunteers || 0);
            const hasVolunteerTarget = targetVolunteers > 0;
            const volunteerPercent = hasVolunteerTarget
              ? Math.min(
                Math.round((currentVolunteers / targetVolunteers) * 100),
                100,
              )
              : 0;

            const descriptionText = stripHtml(project.description) || "Không có mô tả";

            return (
              <div
                key={project._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base truncate">
                        {project.title}
                      </h3>
                      <span
                        className={`text-[11px] px-2 py-1 rounded-full border font-bold ${getStatusStyle(project.status)}`}
                      >
                        {project.status || "DRAFT"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {descriptionText}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 min-w-0">
                        <span>Owner:</span>
                        <span className="font-semibold truncate">
                          {project.organizer?.fullName || "N/A"}
                        </span>
                        {project.organizer?.isVerified && (
                          <BadgeCheck size={16} className="text-blue-500 flex-shrink-0" title="Verified" />
                        )}
                      </div>
                      <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-100 font-bold">
                        {project.organizer?.projectCount || 0} dự án
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <select
                      value={project.status || "DRAFT"}
                      onChange={(e) =>
                        updateProjectStatus(project._id, e.target.value)
                      }
                      className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 hover:border-slate-300 transition-colors"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PAUSED">PAUSED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateProjectStatus(project._id, "PENDING_APPROVAL")
                        }
                        className="text-xs font-bold px-3 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition-colors"
                      >
                        Set Pending
                      </button>
                      <button
                        onClick={() => deleteProject(project._id)}
                        className="text-xs font-bold px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Funds
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {isFundraising ? `${fundsPercent}%` : "Volunteer-only"}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${fundsPercent}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-700 font-semibold">
                      {formatVnd(currentAmount)} / {formatVnd(targetAmount)} VND
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Volunteers
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {hasVolunteerTarget ? `${volunteerPercent}%` : "N/A"}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${volunteerPercent}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-700 font-semibold">
                      {formatVnd(currentVolunteers)} / {formatVnd(targetVolunteers)}{" "}
                      expected
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
