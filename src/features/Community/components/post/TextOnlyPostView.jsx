import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import httpClient from "@/shared/lib/httpClient";

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
}) => {
  const isLiked = post.userReaction === "like";
  const isDisliked = post.userReaction === "dislike";

  const [sortMode, setSortMode] = useState("relevant");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [allComments, setAllComments] = useState(
    post?.latestComments || post?.comments || [],
  );
  const dropdownRef = useRef(null);

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
        setAllComments((prev) => [newComment, ...prev]);
      }

      setCommentContent("");
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#111111] overflow-y-auto flex flex-col items-center pt-20 px-4 pb-12"
      onClick={handleBack}
    >
      <button
        onClick={handleBack}
        className="fixed left-6 top-6 z-[100] flex items-center gap-2 text-slate-300 hover:text-white font-medium transition-colors"
      >
        <span className="material-symbols-outlined text-xl">arrow_back</span>
        Quay lại
      </button>

      {/* 3. KHUNG BÀI VIẾT: Chặn sự kiện lan ra ngoài bằng stopPropagation */}
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-500">
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{post.authorName}</h3>
            <p className="text-sm text-slate-500">
              {post.timeAgo} • {post.privacy}
            </p>
          </div>
        </div>

        <div className="prose prose-slate prose-lg max-w-none whitespace-pre-wrap break-words leading-relaxed text-slate-800">
          {post.content}
        </div>

        <SharedEntityCard entity={post.sharedEntity} />

        <div className="mb-6 mt-6 flex items-center gap-6 border-b border-t border-slate-100 py-4">
          <button
            onClick={() =>
              toggleReaction.mutate({
                postId: post.id || post._id,
                type: "like",
              })
            }
            className={`flex items-center gap-2 text-sm font-bold transition-all hover:opacity-70 ${
              isLiked ? "text-yellow-500" : "text-slate-500"
            }`}
          >
            <span
              className={`material-symbols-outlined ${isLiked ? "fill-current" : ""}`}
            >
              favorite
            </span>
            {post.stats?.likes || 0} Lượt thích
          </button>

          <button
            onClick={() =>
              toggleReaction.mutate({
                postId: post.id || post._id,
                type: "dislike",
              })
            }
            className={`flex items-center gap-2 text-sm font-bold transition-all hover:opacity-70 ${
              isDisliked ? "text-red-500" : "text-slate-500"
            }`}
          >
            <span
              className={`material-symbols-outlined ${isDisliked ? "fill-current" : ""}`}
            >
              thumb_down
            </span>
          </button>

          <div className="ml-auto flex items-center gap-2 text-sm font-bold text-slate-500">
            <span className="material-symbols-outlined">chat_bubble</span>{" "}
            {totalComments} Bình luận
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[14px] font-bold text-slate-900">
              Bình luận ({totalComments})
            </span>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center text-[14px] font-semibold text-gray-600 hover:text-gray-900"
              >
                {getSortLabel()}
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[260px] rounded-lg border border-gray-100 bg-white py-2 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                  <button
                    onClick={() => handleSortChange("relevant")}
                    className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="text-[14px] font-semibold text-gray-900">
                      Phù hợp nhất
                    </div>
                  </button>
                  <button
                    onClick={() => handleSortChange("newest")}
                    className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="text-[14px] font-semibold text-gray-900">
                      Mới nhất
                    </div>
                  </button>
                  <button
                    onClick={() => handleSortChange("all")}
                    className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="text-[14px] font-semibold text-gray-900">
                      Tất cả bình luận
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="custom-scrollbar mb-4 flex max-h-[320px] flex-col gap-4 overflow-y-auto pr-2">
            {allComments.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-400">Chưa có bình luận nào.</p>
              </div>
            ) : (
              allComments.map((comment) => {
                const commentId = comment._id || comment.id || "";
                const isTarget =
                  targetCommentId &&
                  String(commentId) === String(targetCommentId);

                return (
                  <div
                    key={comment._id || comment.id}
                    id={commentId ? `comment-${commentId}` : undefined}
                    className={`flex w-full items-start gap-3 rounded-2xl transition-all duration-300 ${
                      isTarget ? "bg-yellow-50/70 p-2" : ""
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500">
                      {(
                        comment.author?.fullName ||
                        comment.author?.username ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 break-words rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                      <span className="mr-2 font-bold text-slate-900">
                        {comment.author?.fullName ||
                          comment.author?.username ||
                          "Người ẩn danh"}
                      </span>
                      <span className="whitespace-pre-wrap break-words text-slate-700">
                        {comment.content}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {hasMoreComments && (
              <button
                onClick={() => setPage((prev) => (prev === 0 ? 1 : prev + 1))}
                disabled={isLoadingComments}
                className="block pt-2 text-[13.5px] font-semibold text-gray-500 hover:text-gray-800 hover:underline"
              >
                {isLoadingComments ? "Đang tải..." : "Xem thêm bình luận"}
              </button>
            )}
          </div>

          <div className="mt-2 border-t border-gray-100 pt-4">
            <form
              onSubmit={onCommentSubmit}
              className="flex items-center space-x-2"
            >
              <div className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-yellow-400">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="w-full border-none bg-transparent text-[14px] outline-none focus:ring-0"
                  disabled={addComment.isPending}
                />
              </div>
              <button
                type="submit"
                disabled={!commentContent.trim() || addComment.isPending}
                className="cursor-pointer px-2 text-sm font-bold text-yellow-500 transition-colors hover:text-yellow-600 disabled:opacity-40"
              >
                <svg
                  className="h-5 w-5 rotate-45 transform"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextOnlyPostView;
