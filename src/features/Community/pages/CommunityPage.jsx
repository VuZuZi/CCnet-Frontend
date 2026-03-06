import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useFetchPosts } from "../hooks/useFetchPosts";
import { usePostStore } from "../stores/usePostStore";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import ReportModal from "../components/ReportModal";

const getAuthorName = (author) => {
  if (!author) return "Anonymous";
  if (typeof author === "string") return author;
  if (typeof author === "object") {
    return author.fullName || author.name || author.username || "Anonymous";
  }
  return "Anonymous";
};

function CommentInput({ onSubmit }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex gap-2 mt-3">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="form-control form-control-sm"
        required
      />
      <button type="submit" className="btn btn-primary btn-sm px-3">
        Send
      </button>
    </form>
  );
}

export function CommunityPage() {
  useFetchPosts();

  const {
    posts,
    loading,
    error,
    hasMore,
    fetchMorePosts,
    toggleLike,
    toggleDislike,
    addComment,
  } = usePostStore();

  const { isAuthenticated, user } = useAuthStore();
  const currentUserId = user?._id || user?.id || user?.userId;
  const [reportPostId, setReportPostId] = useState(null);

  useEffect(() => {
    if (currentUserId) {
      usePostStore.getState().setCurrentUserId(currentUserId);
    }
  }, [currentUserId]);

  return (
    <div className="container-fluid px-0">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-7 col-xxl-6 px-3 px-md-4">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h2 className="mb-0 fw-bold">Community</h2>

            {isAuthenticated && (
              <Link to="/community/create" className="btn btn-primary btn-sm">
                Create Post
              </Link>
            )}
          </div>

          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          <InfiniteScroll
            dataLength={posts.length}
            next={fetchMorePosts}
            hasMore={hasMore && !loading}
            loader={
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading more...</span>
                </div>
              </div>
            }
            endMessage={
              posts.length > 0 && (
                <p className="text-center text-muted py-5">
                  You've reached the end of the feed 🎉
                </p>
              )
            }
            scrollThreshold={0.9}
          >
            {loading && posts.length === 0 ? (
              <p className="text-center py-5">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-muted text-center py-5">
                No posts yet. Be the first!
              </p>
            ) : (
              <div className="d-flex flex-column gap-4 pb-5">
                {posts.map((post) => {
                  const isLiked =
                    currentUserId &&
                    post.likes?.some((u) => (u._id || u) === currentUserId);
                  const isDisliked =
                    currentUserId &&
                    post.dislikes?.some((u) => (u._id || u) === currentUserId);

                  const previewComments = post.comments?.slice(0, 2) || [];

                  return (
                    <div
                      key={post._id}
                      className="card shadow-sm border-0 rounded-4 position-relative"
                    >
                      <button
                        className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-3 z-3 opacity-75 hover-opacity-100"
                        style={{ zIndex: 10 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setReportPostId(post._id);
                        }}
                        title="Report this post"
                      >
                        Report
                      </button>

                      <div className="card-body px-4 py-4">
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="bg-secondary rounded-circle me-3 flex-shrink-0"
                            style={{ width: 48, height: 48 }}
                          />
                          <h6 className="mb-0 fw-semibold">
                            {getAuthorName(post.author)}
                          </h6>
                        </div>

                        <Link
                          to={`/community/${post._id}`}
                          className="text-decoration-none text-dark"
                        >
                          <p className="mb-3 fs-6">{post.content}</p>

                          {post.images?.length > 0 && (
                            <div className="mb-3">
                              <div
                                className="grid gap-2"
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fill, minmax(180px, 1fr))",
                                  gridAutoRows: "200px",
                                }}
                              >
                                {post.images.map((img, i) => {
                                  const imageSrc = img.startsWith("http")
                                    ? img
                                    : `${import.meta.env.VITE_API_URL}${img}`;

                                  return (
                                    <div
                                      key={i}
                                      className="overflow-hidden rounded-3 cursor-pointer shadow-sm"
                                      style={{ aspectRatio: "4/3" }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.open(imageSrc, "_blank");
                                      }}
                                    >
                                      <img
                                        src={imageSrc}
                                        alt={`Post image ${i + 1}`}
                                        className="w-100 h-100 object-fit-cover transition-transform hover:scale-105"
                                        loading="lazy"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </Link>

                        <div className="d-flex align-items-center gap-4 mb-3">
                          <button
                            onClick={() => toggleLike(post._id)}
                            disabled={!isAuthenticated}
                            className={`btn btn-sm d-flex align-items-center gap-2 p-0 bg-transparent border-0 ${
                              isLiked ? "text-primary fw-bold" : "text-muted"
                            }`}
                          >
                            👍 {post.likes?.length || 0}
                          </button>

                          <button
                            onClick={() => toggleDislike(post._id)}
                            disabled={!isAuthenticated}
                            className={`btn btn-sm d-flex align-items-center gap-2 p-0 bg-transparent border-0 ${
                              isDisliked ? "text-danger fw-bold" : "text-muted"
                            }`}
                          >
                            👎 {post.dislikes?.length || 0}
                          </button>

                          <span className="text-muted small">
                            {post.comments?.length || 0} comments
                          </span>
                        </div>

                        <div className="border-top pt-3">
                          {previewComments.length > 0 ? (
                            previewComments.map((comment) => (
                              <div key={comment._id} className="mb-3 small">
                                <strong className="me-2">
                                  {getAuthorName(comment.author)}
                                </strong>
                                {comment.content}
                                <div
                                  className="text-muted mt-1"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  {new Date(comment.createdAt).toLocaleString()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted small mb-2">
                              No comments yet
                            </p>
                          )}

                          {post.comments?.length > 2 && (
                            <Link
                              to={`/community/${post._id}`}
                              className="text-primary text-decoration-none small fw-medium"
                            >
                              View all {post.comments.length} comments →
                            </Link>
                          )}

                          {isAuthenticated && (
                            <CommentInput
                              onSubmit={(content) =>
                                addComment(post._id, content)
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </InfiniteScroll>
        </div>
      </div>
      <ReportModal
        isOpen={!!reportPostId}
        onClose={() => setReportPostId(null)}
        postId={reportPostId}
      />
    </div>
  );
}
