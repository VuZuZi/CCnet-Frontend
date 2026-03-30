import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useTranslation } from "react-i18next";

const ProjectManagement = () => {
  const { t } = useTranslation();
  const { projects, deleteProject, updateProjectStatus } =
    useAdminDashboard("projects");

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
        {projects.map((project) => (
          <div
            key={project._id}
            className="flex flex-col lg:flex-row lg:items-center gap-4 border-b py-5"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-slate-900 truncate">
                      {project.title}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full border font-bold ${getStatusStyle(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                    "{project.description || "Không có mô tả"}"
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={project.status || "DRAFT"}
                    onChange={(e) =>
                      updateProjectStatus(project._id, e.target.value)
                    }
                    className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 hover:border-slate-300 transition-colors"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <button
                    onClick={() => updateProjectStatus(project._id, "PENDING_APPROVAL")}
                    className="text-xs font-bold px-3 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition-colors"
                  >
                    Set Pending
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="text-sm text-slate-600">
                  Owner:{" "}
                  <span className="font-medium">
                    {project.organizer?.fullName || "N/A"}
                  </span>
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 font-bold">
                  {project.organizer?.projectCount || 0} dự án
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {(() => {
                  const currentAmount = Number(project.currentAmount || 0);
                  const targetAmount = Number(project.targetAmount || 0);
                  const hasFundraising = targetAmount > 0;
                  const percent = hasFundraising
                    ? Math.min(
                      Math.round((currentAmount / targetAmount) * 100),
                      100,
                    )
                    : 0;
                  return (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Funds</span>
                        <span>
                          {hasFundraising
                            ? `${percent}%`
                            : "Volunteer-only"}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-slate-600 font-medium">
                        {currentAmount.toLocaleString()} /{" "}
                        {targetAmount.toLocaleString()} VND
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const currentVolunteers = Number(
                    project.stats?.currentVolunteers || 0,
                  );
                  const targetVolunteers = Number(
                    project.stats?.targetVolunteers || 0,
                  );
                  const hasVolunteers = targetVolunteers > 0;
                  const percent = hasVolunteers
                    ? Math.min(
                      Math.round((currentVolunteers / targetVolunteers) * 100),
                      100,
                    )
                    : 0;
                  return (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Volunteers</span>
                        <span>{hasVolunteers ? `${percent}%` : "N/A"}</span>
                      </div>
                      <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-slate-600 font-medium">
                        {currentVolunteers.toLocaleString()} /{" "}
                        {targetVolunteers.toLocaleString()} expected
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => deleteProject(project._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManagement;
