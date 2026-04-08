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
import { VolunteerManager } from '@/features/volunteer/components/VolunteerManager.jsx';
import { SidebarPublic } from '../components/detail/SidebarPublic';
import { SidebarOrganizer } from '../components/detail/SidebarOrganizer';
import { ProjectCommunityFeed } from '@/features/project/components/detail/ProjectCommunityFeed';

export function ProjectDetailPage() {
  const { id } = useParams();
  const { data: project, isLoading, isError } = useProjectDetail(id);
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState('story');
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const volunteerManagerRef = useRef(null);

  //  Định nghĩa hàm điều hướng đến tab volunteer
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

  //  Định nghĩa hàm onVolunteerClick (để dùng trong các component con)
  const onVolunteerClick = () => {
    handleNavigateToVolunteerTab('volunteer', 'pending');
  };

  const identity = useMemo(() => {
    if (!currentUser || !project) return 'GUEST';
    if (project.organizerId?._id === currentUser.id) return 'ORGANIZER';
    return 'USER';
  }, [currentUser, project]);

  if (isLoading) return <PageLoader />;

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-red-100 bg-white px-8 py-16 text-center shadow-sm">
          <p className="text-xl font-bold text-red-500">Không tìm thấy dự án!</p>
          <p className="mt-3 text-sm text-slate-500">
            Dự án có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
        </div>
      </div>
    );
  }

  const isOrganizer = identity === 'ORGANIZER';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'story':
        return <TabStory project={project} />;
      case 'volunteer':
        return (
          <div ref={volunteerManagerRef}>
            <VolunteerManager
              projectId={project._id}
              initialSubTab={activeSubTab}
            />
          </div>
        ); case 'financials':
        return (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-[#FFFBEB] text-sm font-semibold text-slate-500">
              Nội dung Financial Management đang được xây dựng...
            </div>
          </div>
        );
      case 'community':
        return (
          <ProjectCommunityFeed
            project={project}
            isOrganizer={isOrganizer}
            onVolunteerClick={onVolunteerClick}
          />
        );
      default:
        return (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-[#FFFBEB] text-sm font-semibold text-slate-500">
              Nội dung đang được xây dựng...
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FFFDF8_0%,#FFF8E6_100%)] pb-20">
      <div className="border-b border-[#FBBF24]/15 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/20 bg-[#FFFBEB] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#B45309] shadow-sm">
            Project Detail
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-8 sm:px-6 lg:flex-row lg:px-8">
        <div className="w-full space-y-8 lg:w-[66%]">
          <ProjectCover project={project} isOrganizer={isOrganizer} />
          <ProjectHeader project={project} isOrganizer={isOrganizer} />

          <div className="items-center rounded-[28px] border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
            <ProjectTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isOrganizer={isOrganizer}
            />

            <div className="animate-in fade-in duration-300">{renderTabContent()}</div>
          </div>
        </div>

        <div className="w-full lg:w-[34%]">
          {isOrganizer ? (
            <SidebarOrganizer
              project={project}
              onNavigateToVolunteerTab={(tabKey) => setActiveTab(tabKey)}
            />
          ) : (
            <SidebarPublic project={project} />
          )}
        </div>
      </main>
    </div>
  );
}

export default ProjectDetailPage;