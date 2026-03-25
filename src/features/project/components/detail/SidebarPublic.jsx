// src/features/project/components/SidebarPublic.jsx
import { Heart, Share2, Flag } from 'lucide-react';
import { ApplyVolunteerButton } from '@/features/volunteer/components/ApplyVolunteerButton';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

export function SidebarPublic({ project }) {
    const currentAmount = project?.currentAmount || 0;
    const targetAmount = project?.targetAmount || 1;
    const progressPercent = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
    const user = useAuthStore(authSelectors.user);

    return (
        <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl flex flex-col gap-8">
            {/* Progress Section */}
            <div className="space-y-3">
                <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {currentAmount.toLocaleString()}đ <span className="text-gray-500 text-lg font-medium">raised of {targetAmount.toLocaleString()}đ</span>
                </div>
                <div className="w-full h-4 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full relative transition-all duration-1000" style={{ width: `${progressPercent}%` }}>
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
                    <span className="text-2xl font-bold text-gray-900">{project?.stats?.donorCount?.toLocaleString() || 0}</span>
                    <span className="text-sm font-medium text-gray-500 mt-1">Donors</span>
                </div>
                <div className="bg-green-100/50 p-4 rounded-2xl flex flex-col items-center justify-center border border-green-100">
                    <span className="text-2xl font-bold text-green-700">{project?.stats?.currentVolunteers?.toLocaleString() || 0}</span>
                    <span className="text-sm font-medium text-green-600 mt-1">Volunteers</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
                <button className="w-full py-5 text-xl font-bold text-black bg-amber-400 rounded-2xl hover:bg-amber-500 transition-colors shadow-lg shadow-yellow-500/30 flex justify-center items-center gap-2">
                    <Heart className="w-6 h-6 fill-current" /> Donate Now
                </button>

                {/* Volunteer Button */}
                <ApplyVolunteerButton
                    user={user}
                    projectId={project?._id || project?.id}
                    projectName={project?.name}
                />
            </div>

            <hr className="border-gray-100" />

            {/* Social Actions */}
            <div className="flex justify-center gap-8">
                <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                        <Heart className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold">Follow</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold">Share</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-yellow-600 transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
                        <Flag className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold">Report</span>
                </button>
            </div>
        </div>
    );
}