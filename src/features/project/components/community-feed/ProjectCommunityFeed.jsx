import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Lock } from "lucide-react";

import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useToast } from "@/shared/contexts/ToastContext";
import { volunteerAPI } from "@/features/volunteer/api/volunteerAPI";
import {
  useCreateProjectFeedComment,
  useCreateProjectFeedPost,
  useProjectFeedPosts,
  useToggleProjectFeedCommentLike,
  useToggleProjectFeedPostLike,
} from "@/features/project/hooks/useProjectFeed";

import FeedComposer from "./FeedComposer";
import FeedPostCard from "./FeedPostCard";
import {
  getProjectFeedErrorMessage,
  getProjectFeedPermissions,
  normalizeProjectFeedId,
} from "./utils/projectFeed.utils";

export function ProjectCommunityFeed({ project, isOrganizer }) {
  const toast = useToast();
  const user = useAuthStore((state) => state.user);

  const projectId = normalizeProjectFeedId(project?._id || project?.id);
  const projectOrganizerId = normalizeProjectFeedId(project?.organizerId);
  const userId = normalizeProjectFeedId(user?._id || user?.id || user?.userId);
  const normalizedRole = String(user?.role || "").toLowerCase();
  const isVolunteerRole = normalizedRole === "volunteer";

  const [postContent, setPostContent] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [postMedia, setPostMedia] = useState(null);

  const fileInputRef = useRef(null);

  const { data: application } = useQuery({
    queryKey: ["volunteer-application-by-project", projectId],
    queryFn: () => volunteerAPI.getApplicationByProject(projectId),
    enabled: Boolean(projectId && userId && !isOrganizer),
  });

  const { canPost, canEngage } = useMemo(
    () =>
      getProjectFeedPermissions({
        userId,
        isOrganizer,
        isVolunteerRole,
        applicationStatus: application?.status,
      }),
    [application?.status, isOrganizer, isVolunteerRole, userId],
  );

  const postsQuery = useProjectFeedPosts(projectId, { limit: 10 });
  const createPost = useCreateProjectFeedPost(projectId);
  const createComment = useCreateProjectFeedComment(projectId);
  const togglePostLike = useToggleProjectFeedPostLike(projectId);
  const toggleCommentLike = useToggleProjectFeedCommentLike(projectId);

  const posts = useMemo(() => {
    const pages = postsQuery.data?.pages || [];
    return pages.flatMap((page) => page?.posts || []);
  }, [postsQuery.data]);

  const handleCreatePost = async () => {
    if (!canPost) {
      toast.error(
        "Chỉ project owner hoặc volunteer đã được duyệt mới có thể đăng feed.",
      );
      return;
    }

    const content = postContent.trim();
    if (!content && !postMedia) {
      toast.error("Vui lòng nhập nội dung hoặc chọn ảnh/video");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", content);

      if (postMedia?.file) {
        formData.append("media", postMedia.file);
      }

      await createPost.mutateAsync(formData);

      setPostContent("");
      setPostMedia(null);
      toast.success("Đăng bài thành công!");
    } catch (error) {
      toast.error(
        getProjectFeedErrorMessage(error, "Có lỗi khi đăng bài"),
      );
    }
  };

  const handleMediaUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Chỉ hỗ trợ ảnh và video.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File quá lớn. Tối đa 50MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setPostMedia({
        file,
        preview: loadEvent.target?.result,
        type: isImage ? "image" : "video",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCreateComment = async (postId) => {
    if (!canEngage) {
      toast.error(
        "Chỉ project owner hoặc volunteer đã được duyệt mới có thể bình luận.",
      );
      return;
    }

    const content = String(commentDrafts[postId] || "").trim();
    if (!content) return;

    try {
      await createComment.mutateAsync({ postId, content });
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      toast.error(
        getProjectFeedErrorMessage(error, "Có lỗi khi bình luận"),
      );
    }
  };

  const handleCommentDraftChange = (postId, value) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleDonateClick = () => {
    toast.success("Tính năng Donate đang được phát triển.");
  };

  const postLockedPlaceholder =
    "Chỉ project owner và volunteer đã được duyệt mới có thể đăng feed trong dự án này.";
  const engageLockedPlaceholder =
    "Chỉ project owner và volunteer đã được duyệt mới có thể tương tác...";

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-amber-200/70 bg-gradient-to-r from-[#FFF8E6] via-[#FFFFFF] to-[#EFF6FF] p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-white/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
              <Sparkles size={13} />
              Community Feed
            </p>
            <h3 className="mt-2 text-lg font-extrabold text-slate-900">
              Cập nhật tiến độ dự án
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Chỉ project owner hoặc volunteer đã được duyệt mới được đăng bài,
              bình luận và thả tim trong feed dự án.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Bài viết
            </p>
            <p className="text-xl font-black text-slate-900">{posts.length}</p>
          </div>
        </div>
      </div>

      <FeedComposer
        user={user}
        canPost={canPost}
        postContent={postContent}
        setPostContent={setPostContent}
        postMedia={postMedia}
        setPostMedia={setPostMedia}
        createPost={createPost}
        onCreatePost={handleCreatePost}
        onMediaUpload={handleMediaUpload}
        onDonateClick={handleDonateClick}
        fileInputRef={fileInputRef}
        postLockedPlaceholder={postLockedPlaceholder}
      />

      {postsQuery.isLoading ? (
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
          Đang tải feed dự án...
        </div>
      ) : null}

      {!postsQuery.isLoading && posts.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
          <p className="text-base font-bold text-slate-700">
            Chưa có bài viết nào trong dự án này
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Hãy là người đầu tiên đăng cập nhật để cộng đồng theo dõi tiến độ.
          </p>
        </div>
      ) : null}

      {posts.map((post) => (
        <FeedPostCard
          key={post._id}
          post={post}
          projectOrganizerId={projectOrganizerId}
          user={user}
          canEngage={canEngage}
          commentDraft={commentDrafts[post._id] || ""}
          onCommentDraftChange={handleCommentDraftChange}
          onCreateComment={handleCreateComment}
          onTogglePostLike={(postId) => togglePostLike.mutate(postId)}
          onToggleCommentLike={(commentId) => toggleCommentLike.mutate(commentId)}
          createComment={createComment}
          togglePostLike={togglePostLike}
          toggleCommentLike={toggleCommentLike}
          toast={toast}
          engageLockedPlaceholder={engageLockedPlaceholder}
        />
      ))}

      {postsQuery.hasNextPage ? (
        <button
          type="button"
          onClick={() => postsQuery.fetchNextPage()}
          disabled={postsQuery.isFetchingNextPage}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          {postsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      ) : null}

      {!canPost || !canEngage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <Lock size={16} className="mt-0.5 flex-shrink-0" />
            <p>
              Bạn cần là chủ dự án hoặc volunteer đã được duyệt để đăng bài và
              tương tác trong Community Feed.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProjectCommunityFeed;