import { useState, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import { useExploreProjects } from '../hooks/useProjectQueries';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/useDebounce';

import { OrganizerWorkspaceBar } from '../components/OrganizerWorkspaceBar';
import { FeaturedProject } from '../components/FeaturedProject';
import { CategoryExplore } from '../components/CategoryExplore';
import { VolunteerCall } from '../components/VolunteerCall';
import { ProjectFilterBar } from '../components/ProjectFilterBar';
import { ProjectCard } from '../components/ProjectCard';

export function ProjectListPage() {
  const { t } = useTranslation();
  const [localLocation, setLocalLocation] = useState('');
  const debouncedLocation = useDebounce(localLocation, 500); 
  
  const [category, setCategory] = useState('');
  const filters = useMemo(
    () => ({ category, location: debouncedLocation }),
    [category, debouncedLocation],
  );

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isLoading, 
    isFetching, 
    isError 
  } = useExploreProjects(filters);

  const projects = useMemo(() => {
    return data?.pages.flatMap((page) => page.projects) || [];
  }, [data]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  if (isLoading && !projects.length) return <PageLoader />;
  if (isError) return <div className="text-center py-20 text-red-500 font-bold">{t('common.error_fetching')}</div>;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <OrganizerWorkspaceBar />
        <FeaturedProject />
        <CategoryExplore />
        <VolunteerCall />

        <div className="mt-16">
          <ProjectFilterBar 
            localLocation={localLocation}
            setLocalLocation={setLocalLocation}
            filters={filters}
            onCategoryChange={handleCategoryChange}
            isFetching={isFetching}
          />

          {projects.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium text-lg">{t('project.no_projects_found')}</p>
              <button 
                onClick={() => { setCategory(''); setLocalLocation(''); }} 
                className="mt-4 px-6 py-2 bg-slate-100 text-slate-700 rounded-full font-semibold hover:bg-slate-200 transition-colors"
              >
                {t('project.clear_filters')}
              </button>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={projects.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={
                <div className="col-span-full text-center py-8 text-slate-400 font-medium flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> {t('project.loading_more')}
                </div>
              }
              endMessage={
                <div className="col-span-full text-center py-10">
                  <span className="bg-slate-200 text-slate-500 px-4 py-2 rounded-full text-sm font-medium">{t('project.all_projects_viewed')}</span>
                </div>
              }
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
              style={{ overflow: 'visible' }}
            >
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </InfiniteScroll>
          )}
        </div>

      </div>
    </main>
  );
}
