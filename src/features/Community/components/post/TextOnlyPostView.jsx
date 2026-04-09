import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
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
    <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col sm:flex-row relative">
      <div className="w-full sm:w-[160px] h-[140px] sm:h-auto shrink-0 bg-slate-200 border-b sm:border-b-0 sm:border-r border-slate-200 relative">
        {entity.thumbnail ? (
          <img
            src={entity.thumbnail}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
            No Image
          </div>
        )}
        <span
          className={`absolute top-2 left-2 px-2 py-1 text-[9px] font-bold uppercase rounded-md shadow-sm text-white ${badgeClass}`}
        >
          {isProject ? "PROJECT" : "NEED HELP"}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1 bg-white">
        <h4 className="font-bold text-slate-900 line-clamp-2 mb-1.5">
          {entity.title}
        </h4>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
          {entity.description || "Nhấn để xem chi tiết..."}
        </p>
        <div className="mt-auto">
          <Link
            to={linkTo}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-colors border hover:opacity-80 ${btnClass}`}
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

  return (
    <div className="flex flex-col items-center justify-center px-4 pb-8 min-h-[80vh]">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 shrink-0">
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{post.authorName}</h3>
            <p className="text-sm text-slate-500">
              {post.timeAgo} • {post.privacy}
            </p>
          </div>
        </div>

        <div className="prose prose-slate prose-lg max-w-none whitespace-pre-wrap leading-relaxed text-slate-800 break-words">
          {post.content}
        </div>

        <SharedEntityCard entity={post.sharedEntity} />

        <div className="flex items-center gap-6 py-4 border-t border-b border-slate-100 mt-6 mb-6">
          <button
            onClick={() =>
              toggleReaction.mutate({
                postId: post.id || post._id,
                type: "like",
              })
            }
            className={`flex items-center gap-2 font-bold text-sm transition-all hover:opacity-70 ${isLiked ? "text-yellow-500" : "text-slate-500"}`}
          >
            <span
              className={`material-symbols-outlined ${isLiked ? "fill-current" : ""}`}
            >
              favorite
            </span>
            {post.stats?.likes || 0} Likes
          </button>

          <button
            onClick={() =>
              toggleReaction.mutate({
                postId: post.id || post._id,
                type: "dislike",
              })
            }
            className={`flex items-center gap-2 font-bold text-sm transition-all hover:opacity-70 ${isDisliked ? "text-red-500" : "text-slate-500"}`}
          >
            <span
              className={`material-symbols-outlined ${isDisliked ? "fill-current" : ""}`}
            >
              thumb_down
            </span>
          </button>

          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm ml-auto">
            <span className="material-symbols-outlined">chat_bubble</span>{" "}
            {totalComments} Comments
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-bold text-slate-900">
              Comments ({totalComments})
            </span>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="text-[14px] font-semibold text-gray-600 hover:text-gray-900 flex items-center"
              >
                {getSortLabel()}
                <svg
                  className="w-4 h-4 ml-1"
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
                <div className="absolute top-full right-0 mt-2 w-[260px] bg-white border border-gray-100 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-50 py-2">
                  <button
                    onClick={() => handleSortChange("relevant")}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-[14px] text-gray-900">
                      Phù hợp nhất
                    </div>
                  </button>
                  <button
                    onClick={() => handleSortChange("newest")}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-[14px] text-gray-900">
                      Mới nhất
                    </div>
                  </button>
                  <button
                    onClick={() => handleSortChange("all")}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-[14px] text-gray-900">
                      Tất cả bình luận
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {allComments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">Chưa có bình luận nào.</p>
              </div>
            ) : (
              allComments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex gap-3 items-start w-full"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {(
                      comment.author?.fullName ||
                      comment.author?.username ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="text-sm bg-slate-50 px-4 py-3 rounded-2xl flex-1 border border-slate-100 min-w-0 break-words">
                    <span className="font-bold text-slate-900 mr-2">
                      {comment.author?.fullName ||
                        comment.author?.username ||
                        "Anonymous"}
                    </span>
                    <span className="text-slate-700 break-words whitespace-pre-wrap">
                      {comment.content}
                    </span>
                  </div>
                </div>
              ))
            )}

            {hasMoreComments && (
              <button
                onClick={() => setPage((prev) => (prev === 0 ? 1 : prev + 1))}
                disabled={isLoadingComments}
                className="text-[13.5px] font-semibold text-gray-500 hover:underline hover:text-gray-800 pt-2 block"
              >
                {isLoadingComments ? "Đang tải..." : "Xem thêm bình luận"}
              </button>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100">
            <form
              onSubmit={onCommentSubmit}
              className="flex items-center space-x-2"
            >
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-yellow-400 transition-all">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-[14px]"
                  disabled={addComment.isPending}
                />
              </div>
              <button
                type="submit"
                disabled={!commentContent.trim() || addComment.isPending}
                className="text-yellow-500 font-bold text-sm px-2 disabled:opacity-40 hover:text-yellow-600 transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5 transform rotate-45"
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
