import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useTranslation } from "react-i18next";

const ProjectManagement = () => {
  const { t } = useTranslation();
  const { projects, deleteProject } = useAdminDashboard("projects");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('common.projectManagement')}</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        {projects.map((project) => (
          <div key={project._id} className="flex justify-between items-center border-b py-4">
            <div className="flex-1">
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{project.title}</span>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                  "{project.description || 'Không có mô tả'}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-slate-600">
                  Owner: <span className="font-medium">{project.organizer?.fullName || "N/A"}</span>
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 font-bold">
                  {project.organizer?.projectCount || 0} dự án
                </span>
              </div>
            </div>

            <button
              onClick={() => deleteProject(project._id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManagement;