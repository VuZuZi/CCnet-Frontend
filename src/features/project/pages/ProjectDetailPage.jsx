import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectDetail } from '../hooks/useProjectQueries';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { PageLoader } from '@/shared/components/ui/PageLoader';

import { ProjectCover } from '../components/detail/ProjectCover';
import { ProjectHeader } from '../components/detail/ProjectHeader';
import { ProjectTabs } from '../components/detail/ProjectTabs';
import { TabStory } from '../components/detail/TabStory';
import { SidebarPublic } from '../components/detail/SidebarPublic';
import { SidebarOrganizer } from '../components/detail/SidebarOrganizer';

export function ProjectDetailPage() {
  const { id } = useParams();
  const { data: project, isLoading, isError } = useProjectDetail(id);
  const currentUser = useAuthStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState('story');

  const identity = useMemo(() => {
    if (!currentUser || !project) return 'GUEST';
    if (project.organizerId?._id === currentUser.id) return 'ORGANIZER';
    return 'USER'; 
  }, [currentUser, project]);

  if (isLoading) return <PageLoader />;
  if (isError || !project) return <div className="text-center py-20 text-red-500">Không tìm thấy dự án!</div>;

  const isOrganizer = identity === 'ORGANIZER';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        <div className="lg:w-[65%] w-full space-y-8">
          <ProjectCover project={project} isOrganizer={isOrganizer} />
          <ProjectHeader project={project} isOrganizer={isOrganizer} />
          <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} isOrganizer={isOrganizer} />
          
          {activeTab === 'story' ? (
            <TabStory project={project} />
          ) : (
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center h-64 text-gray-400 font-medium">
              Nội dung tab đang được xây dựng... (Nợ kỹ thuật)
            </div>
          )}
        </div>

        <div className="lg:w-[35%] w-full">
          {isOrganizer ? (
            <SidebarOrganizer project={project} />
          ) : (
            <SidebarPublic project={project} />
          )}
        </div>

      </main>
    </div>
  );
}