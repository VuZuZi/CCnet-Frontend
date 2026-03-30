import { useState, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useExploreProjects } from '../hooks/useProjectQueries';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/useDebounce';

import { OrganizerWorkspaceBar } from '../components/OrganizerWorkspaceBar';
import { ProjectFilterBar } from '../components/ProjectFilterBar';
import { ProjectCard } from '../components/ProjectCard';

export function ProjectListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [localLocation, setLocalLocation] = useState('');
  const debouncedLocation = useDebounce(localLocation, 500);

  const [category, setCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid');
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
    <main className="min-h-screen bg-[#f3f4f6] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <OrganizerWorkspaceBar />

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('project.discovery_title')}
              </h1>
              <p className="text-slate-500 mt-1">
                {t('project.discovery_subtitle')}
              </p>
            </div>

            <div className="flex bg-slate-200 rounded-xl p-1 w-full md:w-auto self-stretch md:self-auto">
              <button
                type="button"
                className="flex-1 md:flex-none px-6 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold text-slate-900 transition-all"
              >
                {t('project.active_projects')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/need-help')}
                className="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 transition-all"
              >
                {t('project.need_help_requests')}
              </button>
            </div>
          </div>

          <ProjectFilterBar
            localLocation={localLocation}
            setLocalLocation={setLocalLocation}
            filters={filters}
            onCategoryChange={handleCategoryChange}
            isFetching={isFetching}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
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
              className={
                viewMode === 'list'
                  ? 'flex flex-col gap-4 pb-20'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20'
              }
              style={{ overflow: 'visible' }}
            >
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  viewMode={viewMode}
                />
              ))}
            </InfiniteScroll>
          )}
        </div>

      </div>
    </main>
  );
}
