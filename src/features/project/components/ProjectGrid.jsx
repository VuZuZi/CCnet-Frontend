import { FiFolder } from 'react-icons/fi';
import { ProjectCard } from './ProjectCard';

export function ProjectGrid({ projects, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <svg className="animate-spin h-8 w-8 text-yellow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-16 px-8 bg-white rounded-2xl shadow-sm">
        <div className="w-20 h-20 mx-auto mb-6 bg-light-gray rounded-full flex items-center justify-center text-gray">
          <FiFolder size={36} />
        </div>
        <h3 className="text-xl font-semibold text-black mb-2">No campaigns found</h3>
        <p className="text-gray mb-6">Be the first to create a campaign and make a difference!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.projectId || project._id} project={project} />
      ))}
    </div>
  );
}