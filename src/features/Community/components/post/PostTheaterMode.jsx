import React, { useState, useRef, useEffect } from "react";
import MediaViewer from "../common/MediaViewer";
import CommentItem from "../comment/CommentItem";
import { usePostMutations } from "../../hooks/usePostMutations";
import { useQuery } from "@tanstack/react-query";
import httpClient from "@/shared/lib/httpClient";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

const PostTheaterMode = ({
  post,
  onClose,
  initialIndex = 0,
  targetCommentId = "",
}) => {
  const [commentContent, setCommentContent] = useState("");
  const [sortMode, setSortMode] = useState("relevant");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [allComments, setAllComments] = useState(post?.latestComments || []);
  const dropdownRef = useRef(null);
  const user = useAuthStore((state) => state.user);

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
    post.author?.fullName || post.author?.username || "Người ẩn danh";
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
    // 1. THẺ NỀN BÊN NGOÀI: Đã thêm onClick={onClose} để bấm nền thoát
    <div
      className="fixed inset-0 z-[9999] flex items-stretch justify-center bg-slate-900/50 backdrop-blur-sm overflow-y-auto py-10"
      onClick={onClose}
    >
      {/* 3. KHUNG HIỂN THỊ CHÍNH Ở GIỮA: Đã thêm e.stopPropagation() để chặn click lan ra nền đen */}
      <div
        className="my-auto flex h-[90vh] min-h-[600px] w-full max-w-7xl flex-col overflow-hidden bg-white shadow-2xl md:flex-row md:rounded-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex h-full flex-1 items-center justify-center overflow-hidden bg-black">
          <MediaViewer
            images={post.images}
            onClose={onClose}
            initialIndex={initialIndex}
          />
        </div>

        <section className="relative flex h-full min-h-0 w-full flex-col border-l border-gray-100 bg-white md:w-[420px]">
          <header className="flex shrink-0 items-center justify-between border-b border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-black overflow-hidden">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  authorInitials
                )}
              </div>
              <div className="min-w-0">
                <h4 className="truncate text-sm font-bold leading-tight text-gray-900">
                  {authorName}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">{post.privacy === "private" ? "lock" : "public"}</span>
                    {post.privacy === "private" ? "Riêng tư" : "Công khai"}
                  </span>
                  {post.isEdited && (
                    <>
                      <span>•</span>
                      <span className="italic">Đã chỉnh sửa</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </header>

          <div className="custom-scrollbar flex-1 min-h-0 w-full overflow-y-auto p-4">
            <div className="mb-6 w-full overflow-hidden">
              <article className="break-all whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                <div className="custom-scrollbar overflow-x-auto">
                  {post.content}
                </div>
              </article>
            </div>

            <div className="mb-3 flex w-full items-center justify-between border-y border-gray-50 py-2 text-xs font-bold text-gray-500">
              <span>{totalComments} Bình luận</span>
              <span className="font-normal text-gray-400">
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <div className="relative mb-4 w-full" ref={dropdownRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center text-[14px] font-semibold text-gray-600 hover:text-gray-900"
              >
                {getSortLabel()}
                <span className="material-symbols-outlined ml-1 text-sm">
                  expand_more
                </span>
              </button>

              {isSortOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-[280px] rounded-lg border border-gray-100 bg-white py-1 shadow-xl">
                  {["relevant", "newest", "all"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleSortChange(mode)}
                      className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="text-sm font-semibold text-gray-900">
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

            <div className="w-full space-y-4">
              {allComments.length === 0 ? (
                <div className="w-full py-10 text-center text-sm text-gray-400">
                  Chưa có bình luận nào.
                </div>
              ) : (
                allComments.map((comment) => (
                  <CommentItem
                    key={comment._id || comment.id}
                    comment={comment}
                    targetCommentId={targetCommentId}
                  />
                ))
              )}

              {hasMoreComments && (
                <button
                  onClick={() => setPage((prev) => (prev === 0 ? 1 : prev + 1))}
                  disabled={isLoadingComments}
                  className="block w-full pt-2 text-center text-[13.5px] font-semibold text-gray-500 hover:underline"
                >
                  {isLoadingComments ? "Đang tải..." : "Xem thêm bình luận"}
                </button>
              )}
            </div>
          </div>

          <footer className="mt-auto shrink-0 border-t border-gray-100 bg-white p-4">
            <form
              onSubmit={handlePostComment}
              className="flex w-full items-center space-x-2"
            >
              <div className="min-w-0 flex-1 rounded-full border border-transparent bg-gray-100 px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-yellow-400">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="min-w-0 w-full border-none bg-transparent text-[14px] outline-none focus:ring-0"
                  disabled={addComment.isPending}
                />
              </div>
              <button
                type="submit"
                disabled={!commentContent.trim() || addComment.isPending}
                className="flex shrink-0 items-center justify-center font-bold text-yellow-500 transition-colors hover:text-yellow-600 disabled:opacity-40"
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
