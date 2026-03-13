import PropTypes from 'prop-types';
import { Button } from '@/shared/components/ui/Button/Button';

export function ProjectCard({ project }) {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <div 
        className="relative h-52 bg-center bg-cover overflow-hidden" 
        style={{ backgroundImage: `url(${project.image})` }}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
        <span className={`absolute top-4 left-4 ${project.categoryColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm`}>
          {project.category}
        </span>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-2 text-slate-900 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-slate-600 text-sm mb-6 line-clamp-2">
          {project.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold text-slate-900">{project.progress}% funded</span>
            <span className="text-slate-500">Target: {project.target}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${project.progress}%` }} 
            />
          </div>
          <Button variant="primary" className="w-full !rounded-xl !py-3">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
};