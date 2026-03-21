import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowRight, PlusCircle } from 'lucide-react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { ROLES } from '@/shared/constants/roles';
import { useMyProjects } from '../hooks/useProjectQueries';

export function OrganizerWorkspaceBar() {
  const userRole = useAuthStore(authSelectors.userRole);
  const { data, isLoading, isError } = useMyProjects();

  if (userRole !== ROLES.ORGANIZER) return null;

  // 👉 tùy theo API của bạn
  const projects = data?.data?.projects || data?.projects || [];
  console.log(projects);

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl mb-8 p-4 px-6 flex flex-col gap-4 shadow-sm border border-slate-700">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <LayoutDashboard size={20} className="text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Không gian làm việc của bạn</h3>
            <p className="text-xs text-slate-400">
              Quản lý và theo dõi các dự án gây quỹ đang hoạt động.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/projects/create"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-sm font-medium rounded-xl"
          >
            <PlusCircle size={16} /> Tạo dự án
          </Link>

          <Link
            to="/workspace/projects"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-bold rounded-xl"
          >
            Vào Workspace <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* LIST PROJECT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {projects.map((project) => (
          <Link
            key={project._id}
            to={`/projects/${project._id}`}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
          >
            {/* TITLE */}
            <h3 className="font-semibold text-sm text-white truncate">
              {project.title}
            </h3>

            {/* CATEGORY */}
            <p className="text-xs text-slate-400 mt-1">
              📂 {project.category}
            </p>

            {/* STATUS */}
            <p className="text-xs mt-1">
              Trạng thái:{" "}
              <span className="text-amber-400 font-medium">
                {project.status}
              </span>
            </p>

            {/* FUNDING */}
            <div className="mt-2">
              <div className="w-full bg-slate-700 h-2 rounded-full">
                <div
                  className="h-2 bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      (project.currentAmount / project.targetAmount) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="text-xs text-slate-400 mt-1">
                {project.currentAmount.toLocaleString()} /{" "}
                {project.targetAmount.toLocaleString()}
              </p>
            </div>

            {/* MILESTONE */}
            {project.currentMilestone && (
              <p className="text-xs text-slate-500 mt-2">
                🎯 Milestone: {project.currentMilestone.title}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}