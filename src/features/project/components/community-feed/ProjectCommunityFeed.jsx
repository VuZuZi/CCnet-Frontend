import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Lock, FileText } from "lucide-react";

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

const VOLUNTEER_FEED_ALLOWED_STATUSES = new Set([
  "APPROVED",
  "WITHDRAW_REQUESTED",
]);

export function ProjectCommunityFeed({
  project,
  isOrganizer,
  isVolunteerMember = false,
  applicationStatus: applicationStatusFromParent = "",
}) {
  const toast = useToast();
  const user = useAuthStore((state) => state.user);

  const projectId = normalizeProjectFeedId(project?._id || project?.id);
  const projectOrganizerId = normalizeProjectFeedId(project?.organizerId);
  const userId = normalizeProjectFeedId(user?._id || user?.id || user?.userId);

  const [postContent, setPostContent] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [postMedia, setPostMedia] = useState(null);

  const fileInputRef = useRef(null);

  const shouldFetchApplication =
    Boolean(projectId && userId && !isOrganizer) &&
    !VOLUNTEER_FEED_ALLOWED_STATUSES.has(
      String(applicationStatusFromParent || "").toUpperCase()
    );

  const { data: application } = useQuery({
    queryKey: ["volunteer-application-by-project", projectId, userId],
    queryFn: () => volunteerAPI.getApplicationByProject(projectId),
    enabled: shouldFetchApplication,
    staleTime: 60 * 1000,
    retry: false,
  });

  const effectiveApplicationStatus = String(
    applicationStatusFromParent || application?.status || ""
  ).toUpperCase();

  const isApprovedVolunteerForFeed =
    isVolunteerMember ||
    VOLUNTEER_FEED_ALLOWED_STATUSES.has(effectiveApplicationStatus);

  const { canPost, canEngage } = useMemo(
    () =>
      getProjectFeedPermissions({
        userId,
        isOrganizer,
        isVolunteerRole: isApprovedVolunteerForFeed,
        applicationStatus: effectiveApplicationStatus,
      }),
    [effectiveApplicationStatus, isApprovedVolunteerForFeed, isOrganizer, userId]
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
        "Chỉ chủ dự án hoặc tình nguyện viên đã được duyệt mới có thể đăng bài."
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
      toast.error(getProjectFeedErrorMessage(error, "Có lỗi khi đăng bài"));
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
        "Chỉ chủ dự án hoặc tình nguyện viên đã được duyệt mới có thể bình luận."
      );
      return;
    }

    const content = String(commentDrafts[postId] || "").trim();
    if (!content) return;

    try {
      await createComment.mutateAsync({ postId, content });
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      toast.error(getProjectFeedErrorMessage(error, "Có lỗi khi bình luận"));
    }
  };

  const handleCommentDraftChange = (postId, value) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleDonateClick = () => {
    toast.success("Tính năng ủng hộ đang được phát triển.");
  };

  const postLockedPlaceholder =
    "Chỉ chủ dự án và tình nguyện viên đã được duyệt mới có thể đăng bài trong dự án này.";
  const engageLockedPlaceholder =
    "Chỉ chủ dự án và tình nguyện viên đã được duyệt mới có thể tương tác...";

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-amber-200/70 bg-gradient-to-r from-[#FFF8E6] via-[#FFFFFF] to-[#EFF6FF] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-white/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
              <Sparkles size={13} />
              Bảng tin cộng đồng
            </p>

            <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
              Cập nhật tiến độ dự án
            </h3>

            <p className="mt-2 max-w-[640px] text-sm leading-6 text-slate-600">
              Chỉ chủ dự án hoặc tình nguyện viên đã được duyệt mới được đăng bài,
              bình luận và thả tim trong bảng tin.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FileText size={18} />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Bài viết
                </p>
                <p className="text-2xl font-black leading-none text-slate-900">
                  {posts.length}
                </p>
              </div>
            </div>
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

      {postsQuery.isLoading && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
          Đang tải bảng tin...
        </div>
      )}

      {!postsQuery.isLoading && posts.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
          <p className="text-base font-bold text-slate-700">
            Chưa có bài viết nào
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Hãy là người đầu tiên đăng cập nhật
          </p>
        </div>
      )}

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

      {postsQuery.hasNextPage && (
        <button
          type="button"
          onClick={() => postsQuery.fetchNextPage()}
          disabled={postsQuery.isFetchingNextPage}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          {postsQuery.isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
        </button>
      )}

      {(!canPost || !canEngage) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <Lock size={16} className="mt-0.5" />
            <p>
              Bạn cần là chủ dự án hoặc tình nguyện viên đã được duyệt để đăng bài và
              tương tác.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProjectCommunityFeed;