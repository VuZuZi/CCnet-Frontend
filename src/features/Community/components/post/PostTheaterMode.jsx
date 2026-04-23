import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import httpClient from "@/shared/lib/httpClient";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";
import MediaViewer from "../common/MediaViewer";
import CommentComposer from "../comment/CommentComposer";
import CommentList from "../comment/CommentList";
import { usePostMutations } from "../../hooks/usePostMutations";
import { usePostDetail } from "../../hooks/usePosts";
import {
  appendReplyToTree,
  extractComments,
  extractCommentTotal,
  extractRootCommentTotal,
  getCommentTotal,
  getInitialComments,
  getPostId,
  hydrateCommentAuthor,
  mergeComments,
  replaceCommentInTree,
} from "../../utils/comment.utils";

const PostTheaterMode = ({
  post,
  postId,
  onClose,
  initialIndex = 0,
  targetCommentId = "",
}) => {
  const resolvedPostId = postId || getPostId(post);
  const { data: detailData, isLoading: isLoadingPost } = usePostDetail(
    post ? null : resolvedPostId,
  );
  const activePost = post || detailData?.data || null;
  const activePostId = getPostId(activePost) || resolvedPostId;
  const activePostReadyKey = activePost ? activePostId : "";
  const initialComments = useMemo(() => getInitialComments(activePost), [activePost]);
  const initialCommentTotal = useMemo(() => getCommentTotal(activePost), [activePost]);
  const bootstrapRef = useRef({
    postKey: activePostReadyKey,
    comments: initialComments,
    total: initialCommentTotal,
  });

  if (bootstrapRef.current.postKey !== activePostReadyKey) {
    bootstrapRef.current = {
      postKey: activePostReadyKey,
      comments: initialComments,
      total: initialCommentTotal,
    };
  }

  const [commentContent, setCommentContent] = useState("");
  const [sortMode, setSortMode] = useState("relevant");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [allComments, setAllComments] = useState(() => initialComments);
  const [commentTotal, setCommentTotal] = useState(() => initialCommentTotal);
  const [rootCommentTotal, setRootCommentTotal] = useState(() =>
    Math.max(initialComments.length, 0),
  );
  const [activeReplyId, setActiveReplyId] = useState("");
  const [replyValue, setReplyValue] = useState("");
  const [activeLikeId, setActiveLikeId] = useState("");
  const dropdownRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const { addComment, toggleCommentReaction } = usePostMutations();

  useBodyScrollLock(true);

  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ["postComments", activePostId, page, sortMode],
    queryFn: async () => {
      const res = await httpClient.get(
        `/posts/${activePostId}/comments?page=${page}&sort=${sortMode}`,
      );
      return res.data;
    },
    enabled: Boolean(activePostId) && page > 0,
    keepPreviousData: true,
  });

  useEffect(() => {
    const bootComments = bootstrapRef.current.comments || [];
    const bootTotal = bootstrapRef.current.total || 0;
    setAllComments(bootComments);
    setCommentTotal(bootTotal);
    setRootCommentTotal(Math.max(bootComments.length, 0));
    setPage(1);
    setSortMode("relevant");
    setActiveReplyId("");
    setReplyValue("");
  }, [activePostReadyKey]);

  useEffect(() => {
    if (!commentsData) return;

    const nextComments = extractComments(commentsData);
    setAllComments((prev) =>
      mergeComments(prev, nextComments, { replace: page === 1 }),
    );
    setCommentTotal((prev) => extractCommentTotal(commentsData, prev));
    setRootCommentTotal((prev) =>
      extractRootCommentTotal(commentsData, Math.max(prev, nextComments.length)),
    );
  }, [commentsData, page]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePostComment = async (event) => {
    event.preventDefault();
    if (!commentContent.trim() || addComment.isPending || !activePostId) return;

    try {
      const result = await addComment.mutateAsync({
        postId: activePostId,
        content: commentContent.trim(),
      });
      const newComment = hydrateCommentAuthor(result?.data || result, user);

      if (newComment) {
        setAllComments((prev) =>
          mergeComments(prev, [newComment], { prepend: true }),
        );
        setCommentTotal((prev) => prev + 1);
        setRootCommentTotal((prev) => prev + 1);
      }

      setCommentContent("");
    } catch (error) {
      console.error("Comment failed:", error);
    }
  };

  const handleSortChange = (mode) => {
    setSortMode(mode);
    setAllComments([]);
    setPage(1);
    setIsSortOpen(false);
  };

  const handleOpenReply = (comment) => {
    const targetId = comment?._id || comment?.id;
    if (!targetId) return;
    setActiveReplyId(String(targetId));
    setReplyValue("");
  };

  const handleCancelReply = () => {
    setActiveReplyId("");
    setReplyValue("");
  };

  const handleSubmitReply = async (event, comment) => {
    event.preventDefault();
    if (!replyValue.trim() || addComment.isPending || !activePostId) return;

    const targetId = comment?._id || comment?.id;
    if (!targetId) return;

    try {
      const result = await addComment.mutateAsync({
        postId: activePostId,
        content: replyValue.trim(),
        parentCommentId: targetId,
      });
      const newReply = hydrateCommentAuthor(result?.data || result, user);
      if (newReply) {
        setAllComments((prev) => appendReplyToTree(prev, targetId, newReply));
        setCommentTotal((prev) => prev + 1);
      }
      handleCancelReply();
    } catch (error) {
      console.error("Reply failed:", error);
    }
  };

  const handleToggleCommentLike = async (comment) => {
    const commentId = comment?._id || comment?.id;
    if (!commentId || toggleCommentReaction.isPending || !activePostId) return;

    try {
      setActiveLikeId(String(commentId));
      const result = await toggleCommentReaction.mutateAsync({
        postId: activePostId,
        commentId,
        type: "like",
      });
      const updatedComment =
        result?.data?.comment || result?.comment || result?.data || result;
      if (updatedComment) {
        setAllComments((prev) => replaceCommentInTree(prev, updatedComment));
      }
    } catch (error) {
      console.error("Toggle comment like failed:", error);
    } finally {
      setActiveLikeId("");
    }
  };

  if (!activePost) {
    return createPortal(
      <div className="ccnet-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 p-4">
        <div className="ccnet-modal-panel rounded-3xl bg-white px-6 py-5 text-sm font-bold text-slate-700 shadow-2xl">
          {isLoadingPost ? "Đang tải bài viết..." : "Không thể tải bài viết."}
        </div>
      </div>,
      document.body,
    );
  }

  const authorName =
    activePost.author?.fullName ||
    activePost.author?.username ||
    "Người ẩn danh";
  const authorInitials = authorName.substring(0, 1).toUpperCase();
  const hasMoreComments = allComments.length < rootCommentTotal;
  const privacyLabel =
    activePost.privacy === "private" ? "Riêng tư" : "Công khai";
  const privacyIcon = activePost.privacy === "private" ? "lock" : "public";

  const modalContent = (
    <div
      className="ccnet-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-950/45 p-0 md:p-6"
      onMouseDown={onClose}
    >
      <div
        className="ccnet-modal-panel flex h-full w-full cursor-default flex-col overflow-hidden bg-white shadow-[0_28px_90px_rgba(15,23,42,0.35)] md:h-[90vh] md:max-w-7xl md:flex-row md:rounded-[28px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative min-h-[280px] flex-1 overflow-hidden bg-black md:min-h-0">
          <MediaViewer
            images={activePost.images}
            onClose={onClose}
            initialIndex={initialIndex}
          />
        </div>

        <section className="flex min-h-0 w-full flex-col border-l border-slate-100 bg-white md:w-[440px]">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-200 text-sm font-black text-amber-900">
                {activePost.author?.avatar ? (
                  <img
                    src={activePost.author.avatar}
                    alt={authorName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  authorInitials
                )}
              </div>
              <div className="min-w-0">
                <h4 className="truncate text-sm font-black leading-tight text-slate-900">
                  {authorName}
                </h4>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span>
                    {new Date(activePost.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">
                      {privacyIcon}
                    </span>
                    {privacyLabel}
                  </span>
                  {activePost.isEdited ? (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="italic">Đã chỉnh sửa</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              aria-label="Đóng popup"
            >
              <X size={18} />
            </button>
          </header>

          <div className="ccnet-modal-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {activePost.content ? (
              <article className="mb-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800 [overflow-wrap:anywhere]">
                {activePost.content}
              </article>
            ) : null}

            <div className="mb-4 flex items-center justify-between border-y border-slate-100 py-3 text-sm font-bold text-slate-500">
              <span>{commentTotal} Bình luận</span>
              <span className="text-xs font-medium text-slate-400">
                {new Date(activePost.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <CommentList
              comments={allComments}
              totalComments={commentTotal}
              sortMode={sortMode}
              isSortOpen={isSortOpen}
              onToggleSort={() => setIsSortOpen((value) => !value)}
              onSortChange={handleSortChange}
              sortRef={dropdownRef}
              targetCommentId={targetCommentId}
              hasMoreComments={hasMoreComments}
              isLoadingMore={isLoadingComments}
              onLoadMore={() => {
                if (!isLoadingComments && hasMoreComments) {
                  setPage((prev) => prev + 1);
                }
              }}
              activeReplyId={activeReplyId}
              replyValue={replyValue}
              onReplyValueChange={setReplyValue}
              onOpenReply={handleOpenReply}
              onCancelReply={handleCancelReply}
              onSubmitReply={handleSubmitReply}
              onToggleLike={handleToggleCommentLike}
              isSubmittingReply={addComment.isPending && Boolean(activeReplyId)}
              activeLikeId={activeLikeId}
            />
          </div>

          <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-3">
            <CommentComposer
              value={commentContent}
              onChange={setCommentContent}
              onSubmit={handlePostComment}
              isSubmitting={addComment.isPending && !activeReplyId}
            />
          </footer>
        </section>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PostTheaterMode;
