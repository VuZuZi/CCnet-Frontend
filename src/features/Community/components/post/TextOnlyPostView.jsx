import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import httpClient from "@/shared/lib/httpClient";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

const PRIVACY_LABELS = {
  public: { label: "Công khai", icon: "public" },
  private: { label: "Riêng tư", icon: "lock" },
  friends: { label: "Bạn bè", icon: "group" },
};

const SharedEntityCard = ({ entity }) => {
  if (!entity) return null;
  const isProject = entity.entityModel === "Project";
  const linkTo = isProject
    ? `/projects/${entity.entityId}`
    : `/need-help/${entity.entityId}`;
  const badgeClass = isProject ? "bg-blue-600" : "bg-red-500";
  const btnClass = isProject
    ? "bg-blue-50 text-blue-700 border-blue-100"
    : "bg-red-50 text-red-700 border-red-100";

  return (
    <div className="relative mt-4 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:flex-row">
      <div className="relative h-[140px] w-full shrink-0 border-b border-slate-200 bg-slate-200 sm:h-auto sm:w-[160px] sm:border-b-0 sm:border-r">
        {entity.thumbnail ? (
          <img
            src={entity.thumbnail}
            alt="Ảnh đại diện"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400">
            Không có ảnh
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-md px-2 py-1 text-[9px] font-bold uppercase text-white shadow-sm ${badgeClass}`}
        >
          {isProject ? "DỰ ÁN" : "CẦN GIÚP ĐỠ"}
        </span>
      </div>
      <div className="flex flex-1 flex-col bg-white p-4">
        <h4 className="mb-1.5 line-clamp-2 font-bold text-slate-900">
          {entity.title}
        </h4>
        <p className="mb-3 line-clamp-2 text-sm text-slate-500">
          {entity.description || "Nhấn để xem chi tiết..."}
        </p>
        <div className="mt-auto">
          <Link
            to={linkTo}
            className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-bold transition-colors hover:opacity-80 ${btnClass}`}
          >
            {isProject ? "Xem Dự Án" : "Giúp Đỡ Ngay"}
            <FiArrowRight className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
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
  const isLiked = post.userReaction === "like";
 

  const [sortMode, setSortMode] = useState("relevant");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [allComments, setAllComments] = useState(
    post?.latestComments || post?.comments || [],
  );
  const dropdownRef = useRef(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // KHAI BÁO HOOK CHUYỂN TRANG
  const navigate = useNavigate();

  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ["postComments", post?.id || post?._id, page, sortMode],
    queryFn: async () => {
      const res = await httpClient.get(
        `/posts/${post.id || post._id}/comments?page=${page}&sort=${sortMode}`,
      );
      return res.data;
    },
    enabled: !!(post?.id || post?._id) && page > 0,
  });

  useEffect(() => {
    if (commentsData) {
      const fetchedData =
        commentsData?.data?.data || commentsData?.data || commentsData;
      if (Array.isArray(fetchedData) && fetchedData.length > 0) {
        setAllComments((prev) => {
          const newComments = [...prev, ...fetchedData];
          return Array.from(
            new Map(newComments.map((c) => [c._id, c])).values(),
          );
        });
      }
    }
  }, [commentsData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortChange = (mode) => {
    setSortMode(mode);
    setAllComments([]);
    setPage(1);
    setIsSortOpen(false);
  };

  const getSortLabel = () => {
    if (sortMode === "relevant") return "Phù hợp nhất";
    if (sortMode === "newest") return "Mới nhất";
    return "Tất cả bình luận";
  };

  const totalComments = post.stats?.comments || 0;
  const hasMoreComments = allComments.length < totalComments;

  const onCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || addComment.isPending) return;

    try {
      const result = await addComment.mutateAsync({
        postId: post.id || post._id,
        content: commentContent,
      });

      const newComment = result?.data || result;
      if (newComment && newComment._id) {
        if (!newComment.author || typeof newComment.author !== 'object' || !newComment.author.fullName) {
          newComment.author = {
            _id: user?._id || user?.id,
            fullName: user?.fullName,
            username: user?.username,
            avatar: user?.avatar,
          };
        }
        setAllComments((prev) => [newComment, ...prev]);
      }

      setCommentContent("");
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const handleBack = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  const getRelativeTime = (dateStr) => {
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

  const authorName = post.author?.fullName || post.author?.username || post.authorName || "Người ẩn danh";
  const displayTime = post.timeAgo || getRelativeTime(post.createdAt);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-hidden"
      onClick={handleBack}
    >
      {/* KHUNG POPUP CỐ ĐỊNH */}
      <div
        className="relative flex w-full max-w-[700px] max-h-[90vh] min-h-[500px] flex-col rounded-xl bg-white shadow-2xl cursor-default overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. FIXED HEADER */}
        <div className="flex shrink-0 items-center justify-center border-b border-gray-200 p-4 relative z-10 w-full h-[64px] bg-white">
          <h2 className="text-xl font-bold text-gray-900 truncate px-12">Bài viết của {authorName}</h2>
          <button
            onClick={handleBack}
            className="absolute right-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* 2. SCROLLABLE CONTENT BODY */}
        <div 
          className="flex-1 overflow-y-auto overscroll-contain transform-gpu custom-scrollbar p-5 md:p-6 bg-white" 
          style={{ WebkitOverflowScrolling: 'touch', willChange: 'transform, scroll-position' }}
        >
          <div className="mb-5 flex items-center gap-3 border-b border-transparent pb-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-500 overflow-hidden border border-slate-100">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                authorName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">{authorName}</h3>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                <span>{displayTime}</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">{PRIVACY_LABELS[post.privacy]?.icon || "public"}</span>
                  {PRIVACY_LABELS[post.privacy]?.label || "Công khai"}
                </span>
                {post.isEdited && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-0.5 text-slate-400 italic">
                      <span className="material-symbols-outlined text-[11px]">edit</span>
                      Đã chỉnh sửa
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-slate prose-lg max-w-none whitespace-pre-wrap break-words leading-relaxed text-slate-800 text-[15px] mb-4">
            {post.content}
          </div>

          <SharedEntityCard entity={post.sharedEntity} />

          <div className="mt-4 flex items-center gap-6 border-y border-slate-100 py-3">
            <button
              onClick={() => toggleReaction.mutate({ postId: post.id || post._id, type: "like" })}
              className={`flex items-center gap-2 text-sm font-bold transition-all hover:opacity-70 ${isLiked ? "text-rose-500" : "text-slate-500"}`}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isLiked ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {post.stats?.likes || 0} Thích
            </button>
            <div className="ml-auto flex items-center gap-2 text-sm font-bold text-slate-500">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {totalComments} Bình luận
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[14px] font-bold text-slate-900">Bình luận ({totalComments})</span>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center text-[14px] font-semibold text-gray-600 hover:text-gray-900"
                >
                  {getSortLabel()}
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-[220px] rounded-lg border border-gray-100 bg-white py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                    <button onClick={() => handleSortChange("relevant")} className="w-full px-4 py-2 text-left transition-colors hover:bg-gray-50"><div className="text-[14px] font-semibold text-gray-900">Phù hợp nhất</div></button>
                    <button onClick={() => handleSortChange("newest")} className="w-full px-4 py-2 text-left transition-colors hover:bg-gray-50"><div className="text-[14px] font-semibold text-gray-900">Mới nhất</div></button>
                    <button onClick={() => handleSortChange("all")} className="w-full px-4 py-2 text-left transition-colors hover:bg-gray-50"><div className="text-[14px] font-semibold text-gray-900">Tất cả bình luận</div></button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 pb-2">
              {allComments.length === 0 ? (
                <div className="py-6 text-center"><p className="text-sm text-gray-400">Chưa có bình luận nào.</p></div>
              ) : (
                allComments.map((comment) => {
                  const commentId = comment._id || comment.id || "";
                  const isTarget = targetCommentId && String(commentId) === String(targetCommentId);
                  return (
                    <div key={comment._id || comment.id} id={commentId ? `comment-${commentId}` : undefined} className={`flex w-full items-start gap-2.5 rounded-2xl transition-all duration-300 ${isTarget ? "bg-yellow-50/70 p-2" : ""}`}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500 overflow-hidden border border-slate-100">
                        {comment.author?.avatar ? <img src={comment.author.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (comment.author?.fullName || comment.author?.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 break-words rounded-[18px] border border-slate-100 bg-slate-100/70 px-3.5 py-2.5 text-[14px]">
                        <span className="mr-2 font-bold text-slate-900 block md:inline">{comment.author?.fullName || comment.author?.username || "Người ẩn danh"}</span>
                        <span className="whitespace-pre-wrap break-words text-slate-700 leading-snug">{comment.content}</span>
                      </div>
                    </div>
                  );
                })
              )}
              {hasMoreComments && (
                <button onClick={() => setPage((prev) => (prev === 0 ? 1 : prev + 1))} disabled={isLoadingComments} className="block w-full py-2 text-center text-[13.5px] font-semibold text-slate-500 hover:text-slate-800 hover:underline">
                  {isLoadingComments ? "Đang tải..." : "Xem thêm bình luận"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. FIXED FOOTER */}
        <div className="shrink-0 border-t border-gray-200 bg-white p-3 md:p-4 relative z-10 w-full drop-shadow-[0_-4px_6px_rgba(0,0,0,0.02)]">
          <form onSubmit={onCommentSubmit} className="flex items-center space-x-2">
            <div className="flex flex-1 rounded-full bg-gray-100 px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-yellow-400">
              <input type="text" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="Viết bình luận..." className="w-full border-none bg-transparent text-[14px] outline-none focus:ring-0" disabled={addComment.isPending} />
            </div>
            <button type="submit" disabled={!commentContent.trim() || addComment.isPending} className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-yellow-500 transition-colors hover:bg-slate-50 hover:text-yellow-600 disabled:opacity-40">
              <svg className="h-[22px] w-[22px] rotate-45 transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TextOnlyPostView;
