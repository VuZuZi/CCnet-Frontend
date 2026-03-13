import { useAdminDashboard } from "../hooks/useAdminDashboard";

const ProjectManagement = () => {
  const { projects, deleteProject } = useAdminDashboard("projects");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Project Management</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        {projects.map((project) => (
          <div key={project._id} className="flex justify-between border-b py-3">
            <div>
              <p className="font-semibold">{project.title}</p>
              <p className="text-sm text-slate-500">
                Owner: {project.owner?.name}
              </p>
            </div>

            <button
              onClick={() => deleteProject(project._id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
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
