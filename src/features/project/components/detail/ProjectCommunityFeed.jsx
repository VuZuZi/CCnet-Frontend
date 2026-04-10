import { useMemo, useState, useRef } from 'react';
import { Heart, MessageCircle, Lock, MoreHorizontal, BadgeCheck, ImagePlus, SendHorizontal, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useToast } from '@/shared/contexts/ToastContext';
import { useQuery } from '@tanstack/react-query';
import { volunteerAPI } from '@/features/volunteer/api/volunteerAPI';
import {
    useCreateProjectFeedComment,
    useCreateProjectFeedPost,
    useProjectFeedPosts,
    useToggleProjectFeedCommentLike,
    useToggleProjectFeedPostLike,
} from '@/features/project/hooks/useProjectFeed';

export function ProjectCommunityFeed({ project, isOrganizer }) {
    const toast = useToast();
    const user = useAuthStore((s) => s.user);
    const projectId = project?._id;
    const normalizedRole = String(user?.role || '').toLowerCase();
    const isVolunteerRole = normalizedRole === 'volunteer';

    const { data: application } = useQuery({
        queryKey: ['volunteer-application-by-project', projectId],
        queryFn: () => volunteerAPI.getApplicationByProject(projectId),
        enabled: !!projectId && !!user?.id && !isOrganizer,
    });

    const canPost = useMemo(() => {
        if (!user?.id) return false;
        if (isOrganizer) return true;
        return isVolunteerRole && application?.status === 'APPROVED';
    }, [application?.status, isOrganizer, isVolunteerRole, user?.id]);

    const canEngage = useMemo(() => {
        return Boolean(user?.id);
    }, [user?.id]);

    const postsQuery = useProjectFeedPosts(projectId, { limit: 10 });
    const createPost = useCreateProjectFeedPost(projectId);
    const createComment = useCreateProjectFeedComment(projectId);
    const togglePostLike = useToggleProjectFeedPostLike(projectId);
    const toggleCommentLike = useToggleProjectFeedCommentLike(projectId);

    const posts = useMemo(() => {
        const pages = postsQuery.data?.pages || [];
        return pages.flatMap((p) => p?.posts || []);
    }, [postsQuery.data]);

    const [postContent, setPostContent] = useState('');
    const [commentDrafts, setCommentDrafts] = useState({});
    const [postMedia, setPostMedia] = useState(null);
    const fileInputRef = useRef(null);

    const handleCreatePost = async () => {
        if (!canPost) {
            toast.error('Chỉ project owner hoặc volunteer đã được duyệt mới có thể đăng feed.');
            return;
        }
        const content = postContent.trim();
        if (!content && !postMedia) {
            toast.error('Vui lòng nhập nội dung hoặc chọn ảnh/video');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('content', content);

            // Add media file if exists
            if (postMedia?.file) {
                formData.append('media', postMedia.file);
            }

            await createPost.mutateAsync(formData);

            setPostContent('');
            setPostMedia(null);
            toast.success('Đăng bài thành công!');
        } catch (error) {
            console.error('[handleCreatePost] Error:', error);
            const apiError = error?.response?.data?.message || error?.message || 'Có lỗi khi đăng bài';
            toast.error(apiError);
        }
    };

    const handleMediaUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            toast.error('Chỉ hỗ trợ ảnh và video.');
            return;
        }

        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File quá lớn. Tối đa 50MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setPostMedia({
                file,
                preview: event.target?.result,
                type: isImage ? 'image' : 'video'
            });
        };
        reader.readAsDataURL(file);
    };

    const handleCreateComment = async (postId) => {
        if (!canEngage) {
            toast.error('Bạn cần đăng nhập để bình luận.');
            return;
        }
        const content = String(commentDrafts[postId] || '').trim();
        if (!content) return;
        await createComment.mutateAsync({ postId, content });
        setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    };

    const postLockedPlaceholder =
        'Chỉ project owner và volunteer đã được duyệt mới có thể đăng feed trong dự án này.';
    const engageLockedPlaceholder = 'Đăng nhập để bình luận về dự án này...';

    return (
        <section className="space-y-5">
            <div className="rounded-[28px] border border-amber-200/70 bg-gradient-to-r from-[#FFF8E6] via-[#FFFFFF] to-[#EFF6FF] p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-white/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
                            <Sparkles size={13} />
                            Community Feed
                        </p>
                        <h3 className="mt-2 text-lg font-extrabold text-slate-900">Cập nhật tiến độ dự án</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            Tất cả người dùng đã đăng nhập có thể xem, thả tim và bình luận. Chỉ project owner hoặc volunteer đã được duyệt mới được đăng feed.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Bài viết</p>
                        <p className="text-xl font-black text-slate-900">{posts.length}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white text-center text-base font-bold leading-[42px] text-slate-700">
                        {user?.avatar ? (
                            <img alt="avatar" className="w-full h-full object-cover" src={user.avatar} />
                        ) : (
                            (user?.fullName || 'U').slice(0, 1).toUpperCase()
                        )}
                    </div>

                    <div className="flex-1 space-y-3">
                        <div className={`rounded-2xl border p-3 transition ${canPost ? 'border-slate-200 bg-slate-50/70' : 'border-amber-200 bg-amber-50/70'}`}>
                            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                                {!canPost ? <Lock size={14} /> : null}
                                {canPost ? 'Tạo bài viết mới' : 'Bạn chỉ có quyền tương tác'}
                            </div>
                            <textarea
                                className="min-h-[96px] w-full resize-y rounded-xl border border-transparent bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                placeholder={canPost ? 'Chia sẻ cập nhật mới về tiến độ, hoạt động, hoặc lời cảm ơn...' : postLockedPlaceholder}
                                disabled={!canPost || createPost.isPending}
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                            />
                        </div>

                        {postMedia && (
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                {postMedia.type === 'image' ? (
                                    <img alt="preview" className="w-full h-auto max-h-80 object-cover" src={postMedia.preview} />
                                ) : (
                                    <video className="w-full h-auto max-h-80 object-cover" src={postMedia.preview} controls />
                                )}
                                <button
                                    type="button"
                                    onClick={() => setPostMedia(null)}
                                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={!canPost || createPost.isPending}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${!canPost || createPost.isPending
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                        : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                                        }`}
                                    title="Upload ảnh hoặc video"
                                >
                                    <ImagePlus size={16} />
                                    Ảnh/Video
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleMediaUpload}
                                    className="hidden"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => toast.success('Tính năng Donate đang được phát triển.')}
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-black shadow-sm transition-colors hover:bg-primary-hover"
                                >
                                    Donate
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreatePost}
                                    disabled={!canPost || (!postContent.trim() && !postMedia) || createPost.isPending}
                                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${!canPost || (!postContent.trim() && !postMedia) || createPost.isPending
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <SendHorizontal size={14} />
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {postsQuery.isLoading ? (
                <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
                    Đang tải feed dự án...
                </div>
            ) : null}

            {!postsQuery.isLoading && posts.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
                    <p className="text-base font-bold text-slate-700">Chưa có bài viết nào trong dự án này</p>
                    <p className="mt-2 text-sm text-slate-500">Hãy là người đầu tiên đăng cập nhật để cộng đồng theo dõi tiến độ.</p>
                </div>
            ) : null}

            {posts.map((p) => (
                <div
                    key={p._id}
                    className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0 text-slate-700 font-bold text-lg">
                                {p.author?.avatar ? (
                                    <img alt="avatar" className="w-full h-full object-cover" src={p.author.avatar} />
                                ) : (
                                    (p.author?.fullName || 'U').slice(0, 1).toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate">
                                        {p.author?.fullName || 'User'}
                                    </h4>
                                    {p.author?.isVerified && (
                                        <BadgeCheck size={16} className="text-blue-500" title="Verified" />
                                    )}
                                    {String(project?.organizerId?._id) === String(p.author?._id) && (
                                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                                            Organizer
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-500">
                                    {new Date(p.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <button type="button" className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    <p className="text-slate-700 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                        {p.content}
                    </p>

                    {Array.isArray(p.media) && p.media.length > 0 && (
                        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-video">
                            {p.media[0].type?.startsWith('video') || p.media[0].url?.match(/\.(mp4|webm|mov)$/i) ? (
                                <video
                                    alt="post media"
                                    className="w-full h-full object-cover"
                                    src={p.media[0].url}
                                    controls
                                />
                            ) : (
                                <img
                                    alt="post media"
                                    className="w-full h-full object-cover"
                                    src={p.media[0].url}
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ccc" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => togglePostLike.mutate(p._id)}
                            disabled={!canEngage || togglePostLike.isPending}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${p.likedByMe ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                                }`}
                            title={canEngage ? 'Thả tim bài viết' : 'Đăng nhập để thả tim'}
                        >
                            <Heart size={18} />
                            {Number(p.likesCount || 0)}
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-500 transition-colors"
                        >
                            <MessageCircle size={18} />
                            {Number(p.commentsCount || 0)}
                        </button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                        {(p.latestComments || []).map((c) => (
                            <div key={c._id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-slate-700 font-bold text-sm border border-slate-200 overflow-hidden">
                                    {c.author?.avatar ? (
                                        <img alt="avatar" className="w-full h-full object-cover" src={c.author.avatar} />
                                    ) : (
                                        (c.author?.fullName || 'U').slice(0, 1).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 min-w-0">
                                    <div className="flex items-center justify-between gap-3 mb-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-bold text-sm text-slate-900 truncate">
                                                {c.author?.fullName || 'User'}
                                            </span>
                                            {c.author?.isVerified && (
                                                <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" title="Verified" />
                                            )}
                                            <span className="text-xs text-slate-500 flex-shrink-0">
                                                {new Date(c.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleCommentLike.mutate(c._id)}
                                            disabled={!canEngage || toggleCommentLike.isPending}
                                            className={`flex items-center gap-1 text-xs font-bold ${c.likedByMe ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                                                }`}
                                            title={canEngage ? 'Thả tim bình luận' : 'Đăng nhập để thả tim'}
                                        >
                                            <Heart size={14} />
                                            {Number(c.likesCount || 0)}
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                        {c.content}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div className="flex gap-3 pt-2">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-slate-700 font-bold text-sm border border-slate-200 overflow-hidden">
                                {user?.avatar ? (
                                    <img alt="avatar" className="w-full h-full object-cover" src={user.avatar} />
                                ) : (
                                    (user?.fullName || 'U').slice(0, 1).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                                <input
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    placeholder={canEngage ? 'Viết bình luận...' : engageLockedPlaceholder}
                                    disabled={!canEngage || createComment.isPending}
                                    value={commentDrafts[p._id] || ''}
                                    onChange={(e) =>
                                        setCommentDrafts((prev) => ({ ...prev, [p._id]: e.target.value }))
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => handleCreateComment(p._id)}
                                    disabled={!canEngage || !String(commentDrafts[p._id] || '').trim() || createComment.isPending}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${!canEngage || !String(commentDrafts[p._id] || '').trim() || createComment.isPending
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                        : 'bg-primary text-black hover:bg-primary-hover'
                                        }`}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {postsQuery.hasNextPage && (
                <button
                    type="button"
                    onClick={() => postsQuery.fetchNextPage()}
                    disabled={postsQuery.isFetchingNextPage}
                    className="w-full py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    {postsQuery.isFetchingNextPage ? 'Loading...' : 'Load more'}
                </button>
            )}
        </section>
    );
}
