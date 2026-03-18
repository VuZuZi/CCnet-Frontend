import { Edit2 } from 'lucide-react';

export function ProjectCover({ project, isOrganizer }) {
    const coverUrl = project?.coverMedia?.url || 'https://via.placeholder.com/1200x600?text=No+Cover+Image';

    return (
        <div className="w-full rounded-3xl overflow-hidden aspect-video bg-gray-200 shadow-sm border border-gray-100 relative group">
            <img
                alt={project?.title || "Project Cover"}
                className="w-full h-full object-cover"
                src={coverUrl}
            />

            {isOrganizer && (
                <button className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/20 hover:bg-black/70 transition-colors cursor-pointer">
                    <Edit2 className="text-white w-4 h-4" />
                    <span className="text-white text-xs font-bold">Edit Media</span>
                </button>
            )}
        </div>
    );
}