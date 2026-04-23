import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import httpClient from "@/shared/lib/httpClient";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";
import { usePostMutations } from "../../hooks/usePostMutations";
import { SharedEntityCard } from "./SharedEntityCard";
import CommentComposer from "../comment/CommentComposer";
import CommentList from "../comment/CommentList";
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

const PRIVACY_LABELS = {
  public: { label: "Công khai", icon: "public" },
  private: { label: "Riêng tư", icon: "lock" },
  friends: { label: "Bạn bè", icon: "group" },
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";

  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return "Hôm qua";
  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffWeek < 4) return `${diffWeek} tuần trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getMediaSrc = (image) =>
  typeof image === "string"
    ? image
    : image?.url || image?.secureUrl || image?.path || "";

const PostMediaGrid = ({ images }) => {
  if (!images?.length) return null;

  const count = images.length;
  const visibleImages = images.slice(0, 5);
  const remainingCount = count - 5;

  const getGridClass = () => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2 grid-rows-2";
    if (count === 4) return "grid-cols-2 grid-rows-2";
    return "grid-cols-6 grid-rows-2";
  };

  const getItemClassName = (index) => {
    if (count === 1) return "col-span-1 aspect-[16/10]";
    if (count === 2) return "aspect-[4/5]";
    if (count === 3) {
      if (index === 0) return "row-span-2 aspect-auto h-full";
      return "aspect-square";
    }
    if (count === 4) return "aspect-square";
    if (index < 3) return "col-span-2 aspect-[4/3]";
    return "col-span-3 aspect-[16/9]";
  };

  return (
    <section
      className={`mb-5 grid gap-0.5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${getGridClass()}`}
    >
      {visibleImages.map((image, index) => (
        <div
          key={`${getMediaSrc(image)}-${index}`}
          className={`relative overflow-hidden bg-slate-100 bg-center bg-cover ${getItemClassName(index)}`}
          style={{ backgroundImage: `url("${getMediaSrc(image)}")` }}
        >
          {index === 4 && remainingCount > 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-3xl font-black text-white">
              +{remainingCount}
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
};

const TextOnlyPostView = ({
  post,
  commentContent,
  setCommentContent,
  toggleReaction,
  addComment,
  targetCommentId = "",
  onClose,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const dropdownRef = useRef(null);
  const postId = getPostId(post);
  const initialComments = useMemo(() => getInitialComments(post), [post]);
  const initialCommentTotal = useMemo(() => getCommentTotal(post), [post]);
  const bootstrapRef = useRef({
    postId,
    comments: initialComments,
    total: initialCommentTotal,
  });

  if (bootstrapRef.current.postId !== postId) {
    bootstrapRef.current = {
      postId,
      comments: initialComments,
      total: initialCommentTotal,
    };
  }
  const {
    addComment: localAddComment,
    toggleCommentReaction,
  } = usePostMutations();
  const commentMutation = addComment || localAddComment;

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

  useBodyScrollLock(true);

  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ["postComments", postId, page, sortMode],
    queryFn: async () => {
      const res = await httpClient.get(
        `/posts/${postId}/comments?page=${page}&sort=${sortMode}`,
      );
      return res.data;
    },
    enabled: Boolean(postId) && page > 0,
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
  }, [postId]);

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

  const authorName =
    post?.author?.fullName ||
    post?.author?.username ||
    post?.authorName ||
    "Người ẩn danh";
  const displayTime = post?.timeAgo || formatRelativeTime(post?.createdAt);
  const privacyInfo = PRIVACY_LABELS[post?.privacy] || PRIVACY_LABELS.public;
  const isLiked = post?.userReaction === "like";
  const hasMoreComments = allComments.length < rootCommentTotal;
  const mediaItems = Array.isArray(post?.images) ? post.images : [];

  const handleBack = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  const handleSortChange = (mode) => {
    setSortMode(mode);
    setAllComments([]);
    setPage(1);
    setIsSortOpen(false);
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!commentContent.trim() || commentMutation.isPending) return;

    try {
      const result = await commentMutation.mutateAsync({
        postId,
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
    if (!replyValue.trim() || commentMutation.isPending) return;

    const targetId = comment?._id || comment?.id;
    if (!targetId) return;

    try {
      const result = await commentMutation.mutateAsync({
        postId,
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
    if (!commentId || toggleCommentReaction.isPending) return;

    try {
      setActiveLikeId(String(commentId));
      const result = await toggleCommentReaction.mutateAsync({
        postId,
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

  const modalContent = (
    <div
      className="ccnet-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-3 sm:p-4"
      onMouseDown={handleBack}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="ccnet-modal-backdrop absolute inset-0 bg-slate-950/20"
        aria-hidden="true"
      />
      <div
        className="ccnet-modal-panel relative z-10 flex max-h-[92vh] min-h-[520px] w-full max-w-3xl cursor-default flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.35)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-slate-900">
              Bài viết của {authorName}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {commentTotal} bình luận
            </p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Đóng popup"
          >
            <X size={18} />
          </button>
        </header>

        <div className="ccnet-modal-scroll min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5 sm:px-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-200 text-lg font-black text-slate-500">
              {post?.author?.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={authorName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                authorName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-black leading-tight text-slate-900">
                {authorName}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{displayTime}</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">
                    {privacyInfo.icon}
                  </span>
                  {privacyInfo.label}
                </span>
                {post?.isEdited ? (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="italic text-slate-400">Đã chỉnh sửa</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {post?.content ? (
            <article className="mb-4 whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-800 [overflow-wrap:anywhere]">
              {post.content}
            </article>
          ) : null}

          <SharedEntityCard entity={post?.sharedEntity} isPreview />

          <PostMediaGrid images={mediaItems} />

          <div className="mt-5 flex items-center gap-3 border-y border-slate-100 py-3">
            <button
              type="button"
              onClick={() =>
                toggleReaction?.mutate({ postId, type: "like" })
              }
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                isLiked
                  ? "bg-rose-50 text-rose-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              {post?.stats?.likes || 0} Thích
            </button>

            <div className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-slate-500">
              <MessageCircle size={18} />
              {commentTotal} Bình luận
            </div>
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
            isSubmittingReply={commentMutation.isPending && Boolean(activeReplyId)}
            activeLikeId={activeLikeId}
          />
        </div>

        <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
          <CommentComposer
            value={commentContent}
            onChange={setCommentContent}
            onSubmit={handleCommentSubmit}
            isSubmitting={commentMutation.isPending && !activeReplyId}
          />
        </footer>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TextOnlyPostView;
