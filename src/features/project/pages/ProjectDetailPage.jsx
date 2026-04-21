import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { useProjectDetail } from "../hooks/useProjectQueries";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useConversations } from "@/features/chat/hooks/conversations/useConversations";
import { useVolunteerQueries } from "@/features/volunteer/hooks/useVolunteerQueries.js";

import { PageLoader } from "@/shared/components/ui/PageLoader";
import { ProjectCover } from "../components/detail/ProjectCover";
import { ProjectHeader } from "../components/detail/ProjectHeader";
import { ProjectTabs } from "../components/detail/ProjectTabs";
import { ProjectFinancialsTab } from "../components/detail/ProjectFinancialsTab";
import { TabStory } from "../components/detail/TabStory";
import { SidebarOrganizer } from "../components/detail/SidebarOrganizer";
import { SidebarPublic } from "../components/sidebar/SidebarPublic";
import { SidebarVolunteer } from "../components/sidebar/SidebarVolunteer";
import { VolunteerManager } from "@/features/volunteer/components/VolunteerManager.jsx";
import { ProjectCommunityFeed } from "@/features/project/components/community-feed/ProjectCommunityFeed";
import { ProjectMilestonesTab } from "@/features/evidence/components/ProjectMilestonesTab";

const PROJECT_GROUP_OPENABLE_STATUSES = ["ACTIVE", "EXECUTING", "PAUSED"];
const VOLUNTEER_MEMBER_STATUSES = new Set(["APPROVED", "WITHDRAW_REQUESTED"]);

function normalizeProjectTab(tabValue, isOrganizer) {
  const raw = String(tabValue || "").trim().toLowerCase();

  if (raw === "volunteer" || raw === "volunteers") {
    return isOrganizer ? "volunteer" : "story";
  }

  if (raw === "financials") return "financials";
  if (raw === "community") return "community";
  if (raw === "story") return "story";

  return "story";
}

function normalizeVolunteerSubTab(subTabValue) {
  const raw = String(subTabValue || "").trim().toLowerCase();

  if (raw === "approved") return "approved";
  if (raw === "rejected") return "rejected";
  if (raw === "withdraw" || raw === "withdraw_requested") return "withdraw";

  return "pending";
}

function restoreScroll(scrollY) {
  const top = Number(scrollY || 0);

  requestAnimationFrame(() => {
    window.scrollTo({ top, left: 0, behavior: "auto" });

    setTimeout(() => {
      window.scrollTo({ top, left: 0, behavior: "auto" });
    }, 0);
  });
}

function extractProjectApplicationStatus(project) {
  const candidates = [
    project?.currentUserParticipation?.volunteerStatus,
    project?.currentUserParticipation?.status,
    project?.currentUserVolunteer?.status,
    project?.myVolunteerApplication?.status,
    project?.myApplication?.status,
    project?.applicationStatus,
    project?.volunteerStatus,
  ];

  const matched = candidates.find((value) => value !== null && value !== undefined);
  return String(matched || "").trim().toUpperCase();
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: project, isLoading, isError } = useProjectDetail(id);
  const { conversations = [] } = useConversations();
  const currentUser = useAuthStore((state) => state.user);

  const volunteerManagerRef = useRef(null);

  const [activeTab, setActiveTab] = useState("story");
  const [activeSubTab, setActiveSubTab] = useState("pending");

  const tabFromQuery = searchParams.get("tab") || "";
  const subTabFromQuery = searchParams.get("subTab") || "";
  const applicationIdFromQuery = searchParams.get("applicationId") || "";

  const currentUserId =
    currentUser?.userId || currentUser?._id || currentUser?.id || "";

  const organizerId =
    project?.organizerId?._id ||
    project?.organizerId?.id ||
    project?.organizerId ||
    "";

  const { useApplicationStatus } = useVolunteerQueries();
  const {
    data: currentApplication,
    isFetching: isCheckingApplication,
  } = useApplicationStatus(id, currentUserId);

  const projectConversation = useMemo(() => {
    if (!project?._id || !Array.isArray(conversations)) return null;

    return (
      conversations.find(
        (conversation) =>
          String(conversation?.projectId || "") === String(project._id)
      ) || null
    );
  }, [conversations, project?._id]);

  const isOrganizer = Boolean(
    currentUser &&
    project &&
    String(currentUserId) &&
    String(currentUserId) === String(organizerId)
  );

  const projectLevelApplicationStatus = extractProjectApplicationStatus(project);
  const queryLevelApplicationStatus = String(
    currentApplication?.status || ""
  ).toUpperCase();

  const effectiveApplicationStatus =
    queryLevelApplicationStatus || projectLevelApplicationStatus;

  const isVolunteerMember = Boolean(
    currentUser &&
    project &&
    !isOrganizer &&
    VOLUNTEER_MEMBER_STATUSES.has(effectiveApplicationStatus)
  );

  useEffect(() => {
    if (!project) return;

    const nextTab = normalizeProjectTab(tabFromQuery, isOrganizer);
    const nextSubTab = normalizeVolunteerSubTab(subTabFromQuery);

    setActiveTab(tabFromQuery ? nextTab : "story");

    if (nextTab === "volunteer") {
      setActiveSubTab(nextSubTab);
    }
  }, [project, tabFromQuery, subTabFromQuery, isOrganizer]);

  useEffect(() => {
    if (!project) return;
    if (activeTab !== "volunteer") return;
    if (!applicationIdFromQuery) return;

    const timer = setTimeout(() => {
      volunteerManagerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [project, activeTab, applicationIdFromQuery]);

  const updateSearchParamsPreserveScroll = (updater) => {
    const currentScrollY = window.scrollY;
    const nextParams = new URLSearchParams(searchParams);

    updater(nextParams);
    setSearchParams(nextParams, { replace: true });

    restoreScroll(currentScrollY);
  };

  const handleNavigateToVolunteerTab = (subTab = "pending") => {
    const normalizedSubTab = normalizeVolunteerSubTab(subTab);

    setActiveTab("volunteer");
    setActiveSubTab(normalizedSubTab);

    updateSearchParamsPreserveScroll((nextParams) => {
      nextParams.set("tab", "volunteer");
      nextParams.set("subTab", normalizedSubTab);
      nextParams.delete("applicationId");
    });
  };

  const handleOpenCommunityTab = () => {
    setActiveTab("community");

    updateSearchParamsPreserveScroll((nextParams) => {
      nextParams.set("tab", "community");
      nextParams.delete("subTab");
      nextParams.delete("applicationId");
    });
  };

  const handleOpenFinancialsTab = () => {
    setActiveTab("financials");

    updateSearchParamsPreserveScroll((nextParams) => {
      nextParams.set("tab", "financials");
      nextParams.delete("subTab");
      nextParams.delete("applicationId");
    });
  };

  const handleTabChange = (nextTab) => {
    if (!nextTab) return;

    setActiveTab(nextTab);

    updateSearchParamsPreserveScroll((nextParams) => {
      if (nextTab === "volunteer" && isOrganizer) {
        nextParams.set("tab", "volunteer");
        nextParams.set("subTab", activeSubTab || "pending");
        return;
      }

      if (nextTab === "financials") {
        nextParams.set("tab", "financials");
      } else if (nextTab === "community") {
        nextParams.set("tab", "community");
      } else {
        nextParams.set("tab", "story");
      }

      nextParams.delete("subTab");
      nextParams.delete("applicationId");
    });
  };

  const canOpenProjectGroup =
    PROJECT_GROUP_OPENABLE_STATUSES.includes(String(project?.status || "")) &&
    Boolean(projectConversation?._id);

  const handleOpenProjectGroup = () => {
    if (!projectConversation?._id) return;
    navigate(`/messages/${projectConversation._id}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "story":
        return <TabStory project={project} />;

      case "volunteer":
        return (
          <div ref={volunteerManagerRef}>
            <VolunteerManager
              projectId={project._id}
              initialSubTab={activeSubTab}
              highlightedApplicationId={applicationIdFromQuery}
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

      case 'milestones':
        return <ProjectMilestonesTab project={project} isOrganizer={isOrganizer} />;

      default:
        return null;
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_0%,#FFE8B3_0%,transparent_26%),radial-gradient(circle_at_92%_18%,#E7F2FF_0%,transparent_24%),linear-gradient(180deg,#FFFDF8_0%,#FFF7E2_100%)] pb-20">
      <div className="border-b border-[#F59E0B]/15 bg-white/75 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/20 bg-[#FFFBEB] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#B45309] shadow-sm">
              Chi tiết dự án
            </div>

            {canOpenProjectGroup ? (
              <button
                type="button"
                onClick={handleOpenProjectGroup}
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] px-4 py-2 text-sm font-black text-slate-900 shadow-[0_10px_22px_rgba(255,193,7,0.22)] transition hover:brightness-105"
              >
                <MessageCircle size={16} />
                Mở nhóm dự án
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        <section className="w-full space-y-8 lg:col-span-8">
          <ProjectCover project={project} isOrganizer={isOrganizer} />
          <ProjectHeader project={project} isOrganizer={isOrganizer} />

          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-3 shadow-sm backdrop-blur-sm">
            <ProjectTabs
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              isOrganizer={isOrganizer}
              projectType={project.projectType}
            />

            <div className="animate-in fade-in duration-300">
              {renderTabContent()}
            </div>
          </div>
        </section>

        <aside className="w-full lg:col-span-4">
          <div className="lg:sticky lg:top-[104px]">
            {isOrganizer ? (
              <SidebarOrganizer
                project={project}
                projectConversation={projectConversation}
                onOpenProjectGroup={handleOpenProjectGroup}
              />
            ) : isVolunteerMember ? (
              <SidebarVolunteer
                project={project}
                projectConversation={projectConversation}
                onOpenProjectGroup={handleOpenProjectGroup}
                onOpenCommunityTab={handleOpenCommunityTab}
                onOpenFinancialsTab={handleOpenFinancialsTab}
                applicationStatus={effectiveApplicationStatus}
                isCheckingApplication={isCheckingApplication}
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