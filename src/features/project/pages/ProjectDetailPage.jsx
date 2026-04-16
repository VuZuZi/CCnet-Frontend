import { useState, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useProjectDetail } from '../hooks/useProjectQueries';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { PageLoader } from '@/shared/components/ui/PageLoader';

import { ProjectCover } from '../components/detail/ProjectCover';
import { ProjectHeader } from '../components/detail/ProjectHeader';
import { ProjectTabs } from '../components/detail/ProjectTabs';
import { ProjectFinancialsTab } from '../components/detail/ProjectFinancialsTab';
import { TabStory } from '../components/detail/TabStory';
import { VolunteerManager } from '@/features/volunteer/components/VolunteerManager.jsx';
import { SidebarPublic } from '../components/sidebar/SidebarPublic';
import { SidebarOrganizer } from '../components/detail/SidebarOrganizer';
import { ProjectCommunityFeed } from '@/features/project/components/detail/ProjectCommunityFeed';
import { useConversations } from "@/features/chat/hooks/conversations/useConversations";

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading, isError } = useProjectDetail(id);
  const { conversations = [] } = useConversations();
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState("story");
  const [activeSubTab, setActiveSubTab] = useState("pending");
  const volunteerManagerRef = useRef(null);

  const handleNavigateToVolunteerTab = (tab, subTab) => {
    setActiveTab(tab);
    if (subTab) {
      setActiveSubTab(subTab);
    }

    setTimeout(() => {
      if (volunteerManagerRef.current) {
        volunteerManagerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const onVolunteerClick = () => {
    handleNavigateToVolunteerTab("volunteer", "pending");
  };

  // Logic Identity an toàn hơn từ nhánh dev2
  const identity = useMemo(() => {
    if (!currentUser || !project) return "GUEST";

    const currentUserId =
      currentUser?.userId || currentUser?._id || currentUser?.id || "";
      
    const organizerId =
      project?.organizerId?._id ||
      project?.organizerId?.id ||
      project?.organizerId ||
      "";

    if (String(organizerId) === String(currentUserId)) return "ORGANIZER";
    return "USER";
  }, [currentUser, project]);

  // Logic tìm kiếm cuộc hội thoại của dự án (từ dev2)
  const projectConversation = useMemo(() => {
    if (!project?._id || !Array.isArray(conversations)) return null;

    return (
      conversations.find(
        (conversation) =>
          String(conversation?.projectId || "") === String(project._id),
      ) || null
    );
  }, [conversations, project?._id]);

  const canOpenProjectGroup =
    project?.status === "ACTIVE" && Boolean(projectConversation?._id);

  const handleOpenProjectGroup = () => {
    if (!projectConversation?._id) return;
    navigate(`/messages/${projectConversation._id}`);
  };

  if (isLoading) return <PageLoader />;

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-red-100 bg-white px-8 py-16 text-center shadow-sm">
          <p className="text-xl font-bold text-red-500">
            Không tìm thấy dự án!
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Dự án có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
        </div>
      </div>
    );
  }

  const isOrganizer = identity === "ORGANIZER";

  const renderTabContent = () => {
    switch (activeTab) {
      case "story":
        return (
          <TabStory
            project={project}
            isOrganizer={isOrganizer}
            onVolunteerClick={onVolunteerClick}
          />
        );

      case "volunteer":
        return (
          <div ref={volunteerManagerRef}>
            <VolunteerManager
              projectId={project._id}
              initialSubTab={activeSubTab}
            />
          </div>
        );

      case "financials":
        return <ProjectFinancialsTab project={project} />;

      case "community":
        return (
          <ProjectCommunityFeed
            project={project}
            isOrganizer={isOrganizer}
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_0%,#FFE8B3_0%,transparent_26%),radial-gradient(circle_at_92%_18%,#E7F2FF_0%,transparent_24%),linear-gradient(180deg,#FFFDF8_0%,#FFF7E2_100%)] pb-20">
      <div className="border-b border-[#F59E0B]/15 bg-white/75 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/20 bg-[#FFFBEB] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#B45309] shadow-sm">
              Project Detail
            </div>

            {/* UI Nút mở nhóm chat (Từ dev2) */}
            {canOpenProjectGroup ? (
              <button
                type="button"
                onClick={handleOpenProjectGroup}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-slate-900 shadow-sm transition-colors hover:bg-amber-500"
              >
                <MessageCircle size={16} />
                Mở nhóm dự án
              </button>
            ) : project?.status === "ACTIVE" ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500">
                <MessageCircle size={15} />
                Nhóm dự án đang đồng bộ...
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        <section className="w-full space-y-8 lg:col-span-8">
          <ProjectCover project={project} isOrganizer={isOrganizer} />
          <ProjectHeader project={project} isOrganizer={isOrganizer} />

          <div className="items-center rounded-[28px] border border-slate-200/80 bg-white/95 p-3 shadow-sm backdrop-blur-sm">
            <ProjectTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isOrganizer={isOrganizer}
              projectType={project.projectType}
            />

            <div className="animate-in fade-in duration-300">
              {renderTabContent()}
            </div>
          </div>
        </section>

        <aside className="w-full lg:col-span-4">
          <div className="lg:sticky lg:top-6">
          {isOrganizer ? (
            <SidebarOrganizer
              project={project}
              onNavigateToVolunteerTab={(tabKey) => setActiveTab(tabKey)}
            />
          ) : (
            <SidebarPublic project={project} />
          )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default ProjectDetailPage;