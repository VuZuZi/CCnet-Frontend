// src/features/project/components/detail/ProjectTabs.jsx
import { BookOpen, Users, TrendingUp, HeartHandshake } from 'lucide-react';

export function ProjectTabs({ activeTab, setActiveTab, isOrganizer }) {
    const tabs = [
        {
            id: 'story',
            label: 'Story',
            icon: BookOpen,
            activeColor: 'text-amber-500',
            hoverColor: 'group-hover:text-amber-400'
        },
        {
            id: 'community',
            label: 'Community Feed',
            icon: Users,
            activeColor: 'text-amber-500',
            hoverColor: 'group-hover:text-amber-400'
        },
        {
            id: 'financials',
            label: isOrganizer ? 'Financial Management' : 'Transparency & Financials',
            icon: TrendingUp,
            activeColor: 'text-amber-500',
            hoverColor: 'group-hover:text-amber-400'
        },
    ];

    if (isOrganizer) {
        tabs.push({
            id: 'volunteer',
            label: 'Volunteer Manager',
            icon: HeartHandshake,
            activeColor: 'text-amber-500',
            hoverColor: 'group-hover:text-amber-400'
        });
    }

    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1 sm:gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                group relative px-3 sm:px-4 md:px-6 py-3 transition-all duration-200
                                flex items-center gap-2 rounded-t-xl
                                ${isActive
                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }
                            `}
                        >
                            {/* Icon */}
                            <Icon
                                size={18}
                                className={`
                                    transition-all duration-200
                                    ${isActive ? tab.activeColor : 'text-gray-400 dark:text-gray-500'}
                                    ${!isActive && tab.hoverColor}
                                `}
                            />

                            {/* Label */}
                            <span className={`
                                text-sm font-medium whitespace-nowrap
                                ${isActive ? 'font-semibold' : 'font-normal'}
                            `}>
                                {tab.label}
                            </span>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}