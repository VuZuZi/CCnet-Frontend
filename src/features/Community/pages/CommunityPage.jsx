import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useFetchPosts } from '../hooks/useFetchPosts'
import { usePostStore } from '../stores/usePostStore'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'

export function CommunityPage() {
  useFetchPosts()

  const { posts, loading, error, toggleLike, toggleDislike, addComment } = usePostStore()
  const { isAuthenticated, user } = useAuthStore()

  const currentUserId = user?._id || user?.id || user?.userId

  // Sync current user ID to post store for optimistic updates
  useEffect(() => {
    if (currentUserId) {
      usePostStore.getState().setCurrentUserId(currentUserId)
    }
  }, [currentUserId])

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Community</h2>

        {isAuthenticated && (
          <Link to="/community/create" className="btn btn-primary">
            Create Post
          </Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="text-center">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-muted text-center">No posts yet. Be the first!</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {posts.map((post) => {
            const isLiked = currentUserId && post.likes.some(u => (u._id || u) === currentUserId)
            const isDisliked = currentUserId && post.dislikes.some(u => (u._id || u) === currentUserId)

            return (
              <div key={post._id} className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-secondary rounded-circle me-3" style={{ width: 40, height: 40 }} />
                    <h6 className="mb-0 text-muted">
                      {post.author?.fullName || 'Anonymous'}
                    </h6>
                  </div>

                  <Link to={`/community/${post._id}`} className="text-decoration-none text-dark">
                    <p className="mb-3">{post.content}</p>

                    {post.images?.length > 0 && (
                      <div className="d-flex gap-2 flex-wrap mb-3">
                        {post.images.map((img, i) => (
                          <img
                            key={i}
                            src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`}
                            alt="post image"
                            className="rounded"
                            style={{ width: 120, height: 120, objectFit: 'cover' }}
                          />
                        ))}
                      </div>
                    )}
                  </Link>

                  <div className="d-flex align-items-center gap-4 mb-3">
                    <button
                      onClick={() => toggleLike(post._id)}
                      disabled={!isAuthenticated}
                      className={`btn btn-sm d-flex align-items-center gap-1 ${
                        isLiked ? 'text-primary fw-bold' : 'text-muted'
                      }`}
                    >
                      <span>Like</span> {post.likes.length}
                    </button>

                    <button
                      onClick={() => toggleDislike(post._id)}
                      disabled={!isAuthenticated}
                      className={`btn btn-sm d-flex align-items-center gap-1 ${
                        isDisliked ? 'text-danger fw-bold' : 'text-muted'
                      }`}
                    >
                      <span>Dislike</span> {post.dislikes.length}
                    </button>

                    <span className="text-muted">Comments {post.comments.length}</span>
                  </div>

                  <div className="border-top pt-3">
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="mb-3">
                        <strong>{comment.author?.fullName || 'Anonymous'}:</strong> {comment.content}
                        <small className="text-muted ms-2">
                          {new Date(comment.createdAt).toLocaleString()}
                        </small>
                      </div>
                    ))}

                    {isAuthenticated && (
                      <CommentInput onSubmit={(content) => addComment(post._id, content)} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CommentInput({ onSubmit }) {
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    onSubmit(content.trim())
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="d-flex gap-2 mt-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="form-control form-control-sm"
        required
      />
      <button type="submit" className="btn btn-primary btn-sm">
        Send
      </button>
    </form>
  )
}