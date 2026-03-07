import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiShare2, FiHeart } from 'react-icons/fi';
import { useProjectDetail } from '../hooks/useProjectDetail';
import { ProjectHeader, ProjectInfo } from '../components';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button';

export function ProjectDetailPage() {
  const { id } = useParams();
  const { project, isLoading, isError, error } = useProjectDetail(id);

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-off-white px-4 md:px-8">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col justify-center items-center py-16">
          <svg className="animate-spin h-10 w-10 text-yellow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen py-8 bg-off-white px-4 md:px-8">
        <div className="w-full max-w-[1200px] mx-auto">
          <div className="flex flex-col justify-center items-center py-16 text-center">
            <FiAlertCircle size={48} className="text-[#dc3545] mb-4" />
            <h3 className="text-2xl font-bold text-black mb-2">Oops! Something went wrong</h3>
            <p className="text-gray mb-6">
              {error?.message || 'Failed to load campaign details'}
            </p>
            <Link to={ROUTES.PROJECTS} className="no-underline">
              <Button variant="outlineDark" className="flex items-center justify-center gap-2">
                <FiArrowLeft size={16} />
                Back to Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen py-8 bg-off-white px-4 md:px-8">
        <div className="w-full max-w-[1200px] mx-auto">
          <div className="flex flex-col justify-center items-center py-16 text-center">
            <FiAlertCircle size={48} className="text-orange mb-4" />
            <h3 className="text-2xl font-bold text-black mb-2">Campaign Not Found</h3>
            <p className="text-gray mb-6">
              The campaign you're looking for doesn't exist or has been removed.
            </p>
            <Link to={ROUTES.PROJECTS} className="no-underline">
              <Button variant="outlineDark" className="flex items-center justify-center gap-2">
                <FiArrowLeft size={16} />
                Back to Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-off-white px-4 md:px-8">
      <div className="w-full max-w-[1200px] mx-auto">
        
        <Link 
          to={ROUTES.PROJECTS} 
          className="inline-flex items-center gap-2 text-gray hover:text-black mb-6 transition-colors font-medium no-underline"
        >
          <FiArrowLeft size={18} />
          <span>Back to Campaigns</span>
        </Link>

        <ProjectHeader project={project} />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button variant="yellow" className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <FiHeart size={16} />
            Support Campaign
          </Button>
          <Button variant="outlineDark" className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <FiShare2 size={16} />
            Share
          </Button>
        </div>

        <ProjectInfo project={project} />

      </div>
    </div>
  );
}