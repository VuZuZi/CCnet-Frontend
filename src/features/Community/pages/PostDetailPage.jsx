import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { postAPI } from '../api/postAPI'
import { usePostStore } from '../stores/usePostStore'

// Simple, lightweight "time ago" formatter — no external dependencies!
const formatTimeAgo = (dateString) => {
  const now = new Date()
  const past = new Date(dateString)
  const diffInMs = now - past
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 7)}w ago`
  return `${Math.floor(diffInDays / 365)}y ago`
}

export function PostDetailPage() {
  const { postId } = useParams()
  const [commentContent, setCommentContent] = useState('')
  const [commenting, setCommenting] = useState(false)

  const postStore = usePostStore()
  const { post, loading } = postStore
  const { setPost, setLoading } = postStore

  useEffect(() => {
  
  setPost(null)
  setLoading(true)

  const fetchPost = async () => {
    try {
      const res = await postAPI.getPostById(postId)
      const newPost = res.data.data ?? res.data

      const safePost = {
        ...newPost,
        author: {
          fullName: newPost.author?.fullName || 'Anonymous',
        },
        comments: (newPost.comments || []).map(comment => ({
          ...comment,
          author: {
            fullName: comment.author?.fullName || comment.author || 'Anonymous',
          },
        })),
      }

      setPost(safePost)
    } catch (err) {
      console.error('Failed to fetch post:', err)
      setPost(null)
    } finally {
      setLoading(false)
    }
  }

  fetchPost()
}, [postId, setPost, setLoading])
  const handleLike = async () => {
    try {
      const res = await postAPI.toggleLike(postId)
      setPost(res.data.data ?? res.data)
    } catch (err) {
      console.error('Like failed:', err)
      alert('Failed to like post')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    const trimmed = commentContent.trim()
    if (!trimmed) return

    try {
      setCommenting(true)
      const res = await postAPI.addComment(postId, trimmed)
      const newComment = res.data.data

      setPost({
        ...post,
        comments: [...(post.comments || []), newComment],
      })

      setCommentContent('')
    } catch (err) {
      console.error('Comment failed:', err)
      alert('Failed to add comment')
    } finally {
      setCommenting(false)
    }
  }

  if (loading) return <div className="text-center py-5"><p>Loading post...</p></div>
  if (!post) return <div className="text-center py-5"><p>Post not found</p></div>

  const {
    content,
    images = [],
    author,
    createdAt,
    likes = 0,
    hasLiked = false,
    comments = [],
  } = post

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <div className="card shadow-sm">
        {images.length > 0 && (
          <div className="p-3 bg-light">
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              {images.map((url, i) => {
                const imageSrc = url.startsWith('http')
                  ? url
                  : `http://localhost:5000${url.startsWith('/') ? '' : '/api/v1/uploads/'}${url}`

                return (
                  <img
                    key={i}
                    src={imageSrc}
                    alt={`Post image ${i + 1}`}
                    className="rounded shadow-sm"
                    style={{
                      width: images.length === 1 ? '100%' : '300px',
                      maxHeight: '500px',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none' 
                    }}
                  />
                )
              })}
            </div>
          </div>
        )}

        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h6 className="mb-1 fw-bold">{author?.fullName || 'Anonymous'}</h6>
              <small className="text-muted">{formatTimeAgo(createdAt)}</small>
            </div>

            <button
              onClick={handleLike}
              className={`btn ${hasLiked ? 'btn-primary' : 'btn-outline-primary'} btn-sm d-flex align-items-center gap-1`}
            >
              👍 <span>{likes?.length || 0} { (likes?.length || 0) === 1 ? 'Like' : 'Likes'}</span>
            </button>
          </div>

          <div className="mb-4 whitespace-pre-wrap">
            {content.split('\n').map((line, i) => (
              <p key={i} className="mb-2">
                {line || <br />}
              </p>
            ))}
          </div>

          <hr className="my-4" />

          <h5 className="mb-4">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h5>

          <form onSubmit={handleAddComment} className="mb-5">
            <textarea
              className="form-control mb-3"
              rows="4"
              placeholder="Write a thoughtful comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={commenting}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={commenting || !commentContent.trim()}
            >
              {commenting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="text-muted text-center py-4">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="border-start border-4 border-primary ps-4 py-3 bg-light rounded"
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <strong>{comment.author?.fullName || 'Anonymous'}</strong>
                    <small className="text-muted">{formatTimeAgo(comment.createdAt)}</small>
                  </div>
                  <p className="mb-0 text-dark">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}