import { Plus, Edit2, BadgeCheck } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useFollowMutations, useFollowStatus } from '@/features/Community/hooks/useFollow';

export function ProjectHeader({ project, isOrganizer }) {
    const user = useAuthStore((s) => s.user);
    const organizerUserId = project?.organizerId?._id;
    const followStatus = useFollowStatus(user?.id ? organizerUserId : null);
    const { follow, unfollow } = useFollowMutations();
    const isFollowing = Boolean(followStatus.data?.isFollowing);

    const handleToggleFollow = () => {
        if (!organizerUserId) return;
        if (!user?.id) return;
        if (isFollowing) {
            unfollow.mutate(organizerUserId);
        } else {
            follow.mutate(organizerUserId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                    {project?.title || 'Đang cập nhật tên dự án...'}
                </h1>
                {isOrganizer && (
                    <button className="flex-shrink-0 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                        <Edit2 className="text-gray-700 w-5 h-5" />
                    </button>
                )}
            </div>

            {!isOrganizer && (
                <div className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border border-green-200 text-green-700 font-bold text-xl">
                            {project?.organizerId?.avatar ? (
                                <img src={project.organizerId.avatar} alt="Organizer" className="w-full h-full object-cover" />
                            ) : (
                                project?.organizerId?.fullName?.charAt(0) || 'O'
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-lg text-gray-900">
                                    {project?.organizerId?.fullName || 'Tổ chức ẩn danh'}
                                </h3>
                                {project?.organizerId?.isVerified && (
                                    <BadgeCheck className="text-blue-500 w-5 h-5" />
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                                Registered Non-Profit • {project?.organizerId?.activeProjects || 0} Active Projects
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleToggleFollow}
                        disabled={!user?.id || follow.isPending || unfollow.isPending || followStatus.isLoading}
                        className={`hidden sm:flex items-center gap-1 py-2 px-4 text-sm font-bold rounded-xl transition-colors ${
                            isFollowing
                                ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                        } ${!user?.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <Plus className="w-5 h-5" /> {isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>
            )}
        </div>
    );
}
