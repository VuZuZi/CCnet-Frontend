import clsx from 'clsx';
import {
  BookOpen,
  Users,
  Wallet,
  BriefcaseBusiness,
} from 'lucide-react';

function getProjectTabs({ isOrganizer, projectType }) {
  const tabs = [
    {
      key: 'story',
      label: 'Câu chuyện',
      icon: BookOpen,
    },
    {
      key: 'community',
      label: 'Cộng đồng',
      icon: Users,
    },
  ];

  if (projectType === 'FUNDED' || !projectType) {
    tabs.push({
      key: 'financials',
      label: 'Quản lý tài chính',
      icon: Wallet,
    });
  }

  if (isOrganizer) {
    tabs.push({
      key: 'volunteer',
      label: 'Quản lý volunteer',
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
    <div className="mb-4 rounded-[24px] border border-slate-200 bg-slate-50 p-2">
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
                'inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-extrabold transition-all outline-none',
                'focus-visible:ring-2 focus-visible:ring-[#D97706]/35 focus-visible:ring-offset-2',
                isActive
                  ? 'border border-[#E2A400] bg-[linear-gradient(135deg,#FFC107_0%,#FFB300_100%)] text-slate-900 shadow-[0_10px_22px_rgba(255,193,7,0.28)]'
                  : 'border border-transparent bg-transparent text-slate-500 hover:border-[#FDE68A] hover:bg-[#FFF8DC] hover:text-[#B45309]'
              )}
            >
              <Icon
                className={clsx(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-[#B45309]' : 'text-current'
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