export function ProjectTabs({ activeTab, setActiveTab, isOrganizer, projectType }) {
    const tabs = [
        { id: 'story', label: 'Story' },
        { id: 'community', label: 'Community Feed' },
    ];

    if (projectType !== 'VOLUNTEER_ONLY') {
        tabs.push({ 
            id: 'financials', 
            label: isOrganizer ? 'Financial Management' : 'Transparency & Financials' 
        });
    }

    if (isOrganizer) {
        tabs.push({ id: 'volunteer', label: 'Volunteer Manager' });
    }

    return (
        <div className="flex justify-center gap-8 bg-gray-50/95 backdrop-blur-md pt-4 pb-4 border-b border-gray-200 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                        ? 'font-bold text-gray-900 border-b-2 border-amber-400'
                        : 'font-medium text-gray-500 hover:text-gray-900'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}