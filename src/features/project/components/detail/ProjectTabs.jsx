const getProjectTabs = ({ isOrganizer, projectType }) => {
  const tabs = [
    { id: "story", label: "Story" },
    { id: "community", label: "Community Feed" },
  ];

  if (projectType !== "VOLUNTEER_ONLY") {
    tabs.push({
      id: "financials",
      label: isOrganizer
        ? "Financial Management"
        : "Transparency & Financials",
    });
  }

  if (isOrganizer) {
    tabs.push({ id: "volunteer", label: "Volunteer Manager" });
  }

  return tabs;
};

export function ProjectTabs({
  activeTab,
  setActiveTab,
  isOrganizer,
  projectType,
}) {
  const tabs = getProjectTabs({ isOrganizer, projectType });

  return (
    <div className="mb-2 overflow-x-auto pb-1 no-scrollbar">
      <div className="inline-flex min-w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-2 sm:min-w-0 sm:gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2.5 text-sm whitespace-nowrap transition-all ${
                isActive
                  ? "bg-white font-bold text-slate-900 shadow-sm ring-1 ring-amber-200"
                  : "font-semibold text-slate-500 hover:bg-white/70 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}