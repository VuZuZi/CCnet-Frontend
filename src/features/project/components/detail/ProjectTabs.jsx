import clsx from "clsx";
import {
  BookOpen,
  Users,
  Wallet,
  BriefcaseBusiness,
  ClipboardCheck,
} from "lucide-react";

function getProjectTabs({ isOrganizer, projectType }) {
  const tabs = [
    { key: "story", label: "Câu chuyện", icon: BookOpen },
    { key: "community", label: "Cộng đồng", icon: Users },
  ];

  tabs.push({
    key: "milestones",
    label: "Tiến độ & Nghiệm thu",
    icon: ClipboardCheck,
  });

  if (projectType === "FUNDED" || !projectType) {
    tabs.push({
      key: "financials",
      label: "Quản lý tài chính",
      icon: Wallet,
    });
  }

  if (isOrganizer) {
    tabs.push({
      key: "volunteer",
      label: "Quản lý tình nguyện viên",
      icon: BriefcaseBusiness,
    });
  }

  return tabs;
}

export function ProjectTabs({
  activeTab,
  setActiveTab,
  isOrganizer = false,
  projectType,
}) {
  const tabs = getProjectTabs({ isOrganizer, projectType });

  return (
    <div className="mb-4 rounded-[24px] border border-[#FDE7A8] bg-[linear-gradient(180deg,#FFFDF7_0%,#FFF8E7_100%)] p-2 shadow-[0_10px_30px_rgba(251,191,36,0.08)]">
      <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setActiveTab(tab.key);
              }}
              aria-pressed={isActive}
              className={clsx(
                "inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-extrabold transition-all outline-none",
                "focus-visible:ring-2 focus-visible:ring-[#F59E0B]/30 focus-visible:ring-offset-2",
                isActive
                  ? "border border-[#F4B000] bg-[linear-gradient(135deg,#FBBF24_0%,#F59E0B_100%)] text-slate-900 shadow-[0_12px_24px_rgba(251,191,36,0.30)]"
                  : "border border-transparent bg-transparent text-slate-600 hover:border-[#FDE7A8] hover:bg-[#FFF7DB] hover:text-[#B45309]"
              )}
            >
              <Icon
                className={clsx(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-[#92400E]" : "text-current"
                )}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectTabs;