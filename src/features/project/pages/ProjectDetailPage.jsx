// src/features/project/pages/ProjectDetailPage.jsx
import { useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectDetail } from '../hooks/useProjectQueries';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { PageLoader } from '@/shared/components/ui/PageLoader';

import { ProjectCover } from '../components/detail/ProjectCover';
import { ProjectHeader } from '../components/detail/ProjectHeader';
import { ProjectTabs } from '../components/detail/ProjectTabs';
import { TabStory } from '../components/detail/TabStory';
import { VolunteerManager } from '@/features/volunteer/components/VolunteerManager.jsx';  // ✅ Import VolunteerManager
import { SidebarPublic } from '../components/detail/SidebarPublic';
import { SidebarOrganizer } from '../components/detail/SidebarOrganizer';

export function ProjectDetailPage() {
  const { id } = useParams();
  const { data: project, isLoading, isError } = useProjectDetail(id);
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState('story');
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const volunteerManagerRef = useRef(null);

  const handleNavigateToVolunteerTab = (tab, subTab) => {
    setActiveTab(tab);
    if (subTab) {
      setActiveSubTab(subTab);
    }
    // Đợi state cập nhật và render xong mới cuộn
    setTimeout(() => {
      if (volunteerManagerRef.current) {
        volunteerManagerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const identity = useMemo(() => {
    if (!currentUser || !project) return 'GUEST';
    if (project.organizerId?._id === currentUser.id) return 'ORGANIZER';
    return 'USER';
  }, [currentUser, project]);

  if (isLoading) return <PageLoader />;
  if (isError || !project) return <div className="text-center py-20 text-red-500">Không tìm thấy dự án!</div>;

  const isOrganizer = identity === 'ORGANIZER';

  // ✅ Hàm render nội dung theo tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'story':
        return <TabStory project={project} />;
      case 'volunteer':  // ✅ Xử lý tab volunteer
        return (
            <div ref={volunteerManagerRef}>
              <VolunteerManager projectId={project._id} initialSubTab={activeSubTab} />
            </div>
        );
      case 'financials':
        return (
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center h-64 text-gray-400 font-medium">
              Nội dung Financials đang được xây dựng...
            </div>
        );
      case 'community':
        return (
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center h-64 text-gray-400 font-medium">
              Nội dung Community Feed đang được xây dựng...
            </div>
        );
      default:
        return (
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center h-64 text-gray-400 font-medium">
              Nội dung đang được xây dựng...
            </div>
        );
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <main className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

          <div className="lg:w-[65%] w-full space-y-8">
            <ProjectCover project={project} isOrganizer={isOrganizer} />
            <ProjectHeader project={project} isOrganizer={isOrganizer} />
            <ProjectTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOrganizer={isOrganizer}
            />

            {/* ✅ Render nội dung theo tab */}
            {renderTabContent()}

          </div>

          <div className="lg:w-[35%] w-full">
            {isOrganizer ? (
                <SidebarOrganizer
                    project={project}
                    onNavigateToVolunteerTab={handleNavigateToVolunteerTab}
                />
            ) : (
                <SidebarPublic project={project} />
            )}
          </div>

        </main>
      </div>
  );
}