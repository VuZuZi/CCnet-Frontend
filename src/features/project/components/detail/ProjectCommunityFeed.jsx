import { useMemo, useState } from 'react';
import { Heart, MessageCircle, Lock, MoreHorizontal, BadgeCheck } from 'lucide-react';
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
} from '../../hooks/useProjectFeed';

export function ProjectCommunityFeed({ project, isOrganizer}) {
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const projectId = project?._id;

  const { data: application } = useQuery({
    queryKey: ['volunteer-application-by-project', projectId],
    queryFn: () => volunteerAPI.getApplicationByProject(projectId),
    enabled: !!projectId && !!user?.id && !isOrganizer,
  });

  const canInteract = useMemo(() => {
    if (!user?.id) return false;
    if (isOrganizer) return true;
    return application?.status === 'APPROVED';
  }, [application?.status, isOrganizer, user?.id]);

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

  const handleCreatePost = async () => {
    if (!canInteract) {
      toast.error('Chỉ nhà tổ chức hoặc tình nguyện viên đã được duyệt mới có thể đăng bài.');
      return;
    }
    const content = postContent.trim();
    if (!content) return;
    await createPost.mutateAsync({ content });
    setPostContent('');
  };

  const handleCreateComment = async (postId) => {
    if (!canInteract) {
      toast.error('Chỉ nhà tổ chức hoặc tình nguyện viên đã được duyệt mới có thể bình luận.');
      return;
    }
    const content = String(commentDrafts[postId] || '').trim();
    if (!content) return;
    await createComment.mutateAsync({ postId, content });
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const lockedPlaceholder =
    'Chỉ nhà tổ chức và tình nguyện viên đã được duyệt mới có thể đăng bài/bình luận. Hãy tham gia dự án để chia sẻ!';

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className={`flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 ${canInteract ? '' : 'opacity-60'}`}>
          {!canInteract && <Lock className="text-slate-500" size={18} />}
          <input
            className="w-full bg-transparent border-none text-slate-700 placeholder-slate-400 focus:ring-0 p-0 text-sm outline-none"
            placeholder={canInteract ? 'Chia sẻ cập nhật mới về dự án...' : lockedPlaceholder}
            disabled={!canInteract || createPost.isPending}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => toast.success('Tính năng Donate đang được phát triển.')}
            className="py-2 px-4 text-sm font-bold text-black bg-primary rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
          >
            Donate
          </button>
          <button
            type="button"
            onClick={handleCreatePost}
            disabled={!canInteract || !postContent.trim() || createPost.isPending}
            className={`py-2 px-4 text-sm font-bold rounded-xl transition-colors ${!canInteract || !postContent.trim() || createPost.isPending
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
          >
            Post
          </button>
        </div>
      </div>

      {posts.map((p) => (
        <div
          key={p._id}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0 text-slate-700 font-bold text-lg">
                {p.author?.avatar ? (
                  <img alt="avatar" className="w-full h-full object-cover" src={p.author.avatar} />
                ) : (
                  (p.author?.fullName || 'U').slice(0, 1).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{p.author?.fullName || 'User'}</h4>
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

          <p className="text-slate-700 whitespace-pre-line">{p.content}</p>

          {Array.isArray(p.media) && p.media.length > 0 && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-video">
              <img alt="post media" className="w-full h-full object-cover" src={p.media[0].url} />
            </div>
          )}

          <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => togglePostLike.mutate(p._id)}
              disabled={!canInteract || togglePostLike.isPending}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${p.likedByMe ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                }`}
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
                <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100">
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
                      disabled={!canInteract || toggleCommentLike.isPending}
                      className={`flex items-center gap-1 text-xs font-bold ${c.likedByMe ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                        }`}
                    >
                      <Heart size={14} />
                      {Number(c.likesCount || 0)}
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-line">{c.content}</p>
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
                  placeholder={canInteract ? 'Viết bình luận...' : lockedPlaceholder}
                  disabled={!canInteract || createComment.isPending}
                  value={commentDrafts[p._id] || ''}
                  onChange={(e) =>
                    setCommentDrafts((prev) => ({ ...prev, [p._id]: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => handleCreateComment(p._id)}
                  disabled={!canInteract || !String(commentDrafts[p._id] || '').trim() || createComment.isPending}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${!canInteract || !String(commentDrafts[p._id] || '').trim() || createComment.isPending
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
    </div>
  );
}
