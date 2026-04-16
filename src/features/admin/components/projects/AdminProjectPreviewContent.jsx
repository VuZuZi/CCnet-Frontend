import { ProjectCover } from "@/features/project/components/detail/ProjectCover";
import { ProjectHeader } from "@/features/project/components/detail/ProjectHeader";
import { ProjectTabs } from "@/features/project/components/detail/ProjectTabs";
import { TabStory } from "@/features/project/components/detail/TabStory";
import { SidebarPublic } from "@/features/project/components/sidebar/SidebarPublic";
import AdminProjectSubmissionSummary from "./AdminProjectSubmissionSummary";

export default function AdminProjectPreviewContent({
  project,
  activeTab,
  setActiveTab,
  isHighlighted,
  revisionCount,
}) {
  const renderTabContent = () => {
    switch (activeTab) {
      case "story":
        return <TabStory project={project} />;

      case "financials":
      case "community":
        return (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-[#FFFBEB] text-sm font-semibold text-slate-500">
              Nội dung đang được xây dựng...
            </div>
          </div>
        );

      default:
        return <TabStory project={project} />;
    }
  };

  return (
    <div
      className={`rounded-[32px] transition-all duration-500 ${
        isHighlighted
          ? "ring-4 ring-[#FBBF24]/35 shadow-[0_0_0_10px_rgba(251,191,36,0.08)]"
          : ""
      }`}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.65fr_0.95fr]">
        <div className="space-y-8">
          <ProjectCover project={project} isOrganizer={false} />
          <ProjectHeader project={project} isOrganizer={false} />

          <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <ProjectTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isOrganizer={false}
            />
          </div>

          {renderTabContent()}
        </div>

        <div className="space-y-6">
          <AdminProjectSubmissionSummary
            project={project}
            revisionCount={revisionCount}
          />
          <SidebarPublic project={project} />
        </div>
      </div>
    </div>
  );
}