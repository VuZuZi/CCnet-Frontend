// src/features/project/components/detail/ProjectTabs.jsx

export function ProjectTabs({ activeTab, setActiveTab, isOrganizer }) {
    // ✅ Chỉ hiển thị tab pending nếu là organizer
    const tabs = [
        { id: 'story', label: 'Story' },
        { id: 'community', label: 'Community Feed' },
        { id: 'financials', label: isOrganizer ? 'Financial Management' : 'Transparency & Financials' },
    ];

    // ✅ Thêm tab pending chỉ khi là organizer
    if (isOrganizer) {
        tabs.push({ id: 'pending', label: 'Pending Applications' }); // ✅ Sửa typo: bỏ "aa"
    }

    return (
        <div className="sticky top-20 bg-gray-50/95 backdrop-blur-md pt-4 border-b border-gray-200 flex overflow-x-auto gap-8 no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm whitespace-nowrap transition-colors ${
                        activeTab === tab.id
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