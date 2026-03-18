import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function TabStory({ project }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`relative bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-gray-100 shadow-sm transition-all duration-300 ${!isExpanded ? 'overflow-hidden h-[600px]' : ''}`}>

            <div
                className="prose prose-lg max-w-none text-gray-600 space-y-6"
                dangerouslySetInnerHTML={{ __html: project?.description || '<p>Chưa có thông tin chi tiết.</p>' }}
            />

            {!isExpanded && (
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-8 pt-10">
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="py-3 px-6 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 z-10"
                    >
                        Read More <ChevronDown className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}