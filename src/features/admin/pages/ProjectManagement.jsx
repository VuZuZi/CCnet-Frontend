import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

const STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAUSED: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("vi-VN");
};

const ProjectManagement = () => {
  const { projects, loading, updateProjectStatus, deleteProject, refresh } =
    useAdminDashboard("projects");

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (a.status === "PENDING_APPROVAL" && b.status !== "PENDING_APPROVAL") {
        return -1;
      }
      if (a.status !== "PENDING_APPROVAL" && b.status === "PENDING_APPROVAL") {
        return 1;
      }
      return 0;
    });
  }, [projects]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review submitted projects and manage project statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading projects...</div>
        ) : sortedProjects.length === 0 ? (
          <div className="p-6 text-slate-500">No projects found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedProjects.map((project) => {
              const organizerName =
                project.organizer?.fullName ||
                project.organizer?.username ||
                project.organizer?.name ||
                project.organizer?.email ||
                "Unknown organizer";

              return (
                <div
                  key={project._id}
                  className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <p className="font-semibold text-slate-900 break-words">
                        {project.title}
                      </p>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          STATUS_STYLES[project.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-slate-500">
                      <p>Organizer: {organizerName}</p>
                      <p>Category: {project.category || "-"}</p>
                      <p>
                        Target amount: {formatCurrency(project.targetAmount)} VND
                      </p>
                      <p>
                        Raised: {formatCurrency(project.currentAmount)} VND
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/admin/projects/${project._id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={16} />
                      View details
                    </Link>

                    {project.status === "PENDING_APPROVAL" && (
                      <>
                        <button
                          onClick={() =>
                            updateProjectStatus(project._id, "ACTIVE")
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            updateProjectStatus(project._id, "CANCELLED")
                          }
                          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => deleteProject(project._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;