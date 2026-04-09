import React, { useState, useRef, useEffect } from "react";
import MediaViewer from "../common/MediaViewer";
import CommentItem from "../comment/CommentItem";
import { usePostMutations } from "../../hooks/usePostMutations";
import { useQuery } from "@tanstack/react-query";
import httpClient from "@/shared/lib/httpClient";

const PostTheaterMode = ({ post, onClose, initialIndex = 0 }) => {
  const [commentContent, setCommentContent] = useState("");
  const [sortMode, setSortMode] = useState("relevant");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [allComments, setAllComments] = useState(post?.latestComments || []);
  const dropdownRef = useRef(null);

  const { addComment } = usePostMutations();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ["postComments", post?._id, page, sortMode],
    queryFn: async () => {
      const res = await httpClient.get(
        `/posts/${post._id}/comments?page=${page}&sort=${sortMode}`,
      );
      return res.data;
    },
    enabled: !!post?._id && page > 0,
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

  if (!post) return null;

  const authorName =
    post.author?.fullName || post.author?.username || "Anonymous";
  const authorInitials = authorName.substring(0, 1).toUpperCase();
  const totalComments = post.stats?.comments || 0;
  const hasMoreComments = allComments.length < totalComments;

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || addComment.isPending) return;
    try {
      const result = await addComment.mutateAsync({
        postId: post._id,
        content: commentContent,
      });
      const newComment = result?.data || result;
      if (newComment && newComment._id)
        setAllComments((prev) => [newComment, ...prev]);
      setCommentContent("");
    } catch (err) {
      console.error(err);
    }
  };

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

  return (
    <div className="fixed inset-0 z-[9999] flex items-stretch justify-center bg-black/95">
      <div className="w-full max-w-7xl h-screen flex flex-col md:flex-row overflow-hidden md:rounded-2xl bg-white shadow-2xl my-auto">
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden h-full">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-[50] p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full text-white md:hidden"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <MediaViewer
            images={post.images}
            onClose={onClose}
            initialIndex={initialIndex}
          />
        </div>

        <section className="w-full md:w-[420px] h-full flex flex-col bg-white border-l border-gray-100 relative min-h-0">
          <header className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-sm shrink-0">
                {authorInitials}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-gray-900 leading-tight truncate">
                  {authorName}
                </h4>
                <p className="text-[11px] text-gray-400 uppercase tracking-tighter">
                  Community Member
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hidden md:flex text-gray-400 hover:text-gray-600 p-1"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 w-full min-h-0">
            <div className="w-full overflow-hidden mb-6">
              <article className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words break-all">
                <div className="overflow-x-auto custom-scrollbar">
                  {post.content}
                </div>
              </article>
            </div>

            <div className="flex items-center justify-between py-2 border-y border-gray-50 mb-3 w-full text-xs font-bold text-gray-500">
              <span>{totalComments} Bình luận</span>
              <span className="font-normal text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="relative mb-4 w-full" ref={dropdownRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="text-[14px] font-semibold text-gray-600 hover:text-gray-900 flex items-center"
              >
                {getSortLabel()}
                <span className="material-symbols-outlined text-sm ml-1">
                  expand_more
                </span>
              </button>

              {isSortOpen && (
                <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1">
                  {["relevant", "newest", "all"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleSortChange(mode)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-semibold text-sm text-gray-900">
                        {mode === "relevant"
                          ? "Phù hợp nhất"
                          : mode === "newest"
                            ? "Mới nhất"
                            : "Tất cả bình luận"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 w-full">
              {allComments.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm w-full">
                  Chưa có bình luận nào.
                </div>
              ) : (
                allComments.map((comment) => (
                  <CommentItem key={comment._id} comment={comment} />
                ))
              )}
              {hasMoreComments && (
                <button
                  onClick={() => setPage((prev) => (prev === 0 ? 1 : prev + 1))}
                  disabled={isLoadingComments}
                  className="text-[13.5px] font-semibold text-gray-500 hover:underline pt-2 block w-full text-center"
                >
                  {isLoadingComments ? "Đang tải..." : "Xem thêm bình luận"}
                </button>
              )}
            </div>
          </div>

          <footer className="p-4 border-t border-gray-100 bg-white shrink-0 mt-auto">
            <form
              onSubmit={handlePostComment}
              className="flex items-center space-x-2 w-full"
            >
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-yellow-400 transition-all min-w-0 border border-transparent">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="w-full bg-transparent border-none focus:ring-0 text-[14px] outline-none min-w-0"
                  disabled={addComment.isPending}
                />
              </div>
              <button
                type="submit"
                disabled={!commentContent.trim() || addComment.isPending}
                className="text-yellow-500 font-bold disabled:opacity-40 hover:text-yellow-600 transition-colors shrink-0 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-2xl">send</span>
              </button>
            </form>
          </footer>
        </section>
      </div>
    </div>
  );
};

export default PostTheaterMode;
