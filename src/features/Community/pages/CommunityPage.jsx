import { Link } from 'react-router-dom'
import { useFetchPosts } from '../hooks/useFetchPosts'
import { usePostStore } from '../stores/usePostStore'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useCreatePost } from '../hooks/useCreatePosts'
import { useState } from 'react'



export function CommunityPage() {
  useFetchPosts()

  const { posts, loading } = usePostStore()
  const { isAuthenticated } = useAuthStore()
  const createPost = useCreatePost()
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    createPost.mutate({ content })
    setContent('')
  }

  return (
    <div className="container mt-4">
      <h2>Community</h2>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-muted">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <Link
            key={post._id}
            to={`/community/${post._id}`}
            className="text-decoration-none text-dark"
          >
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="text-muted">
                  {post.author?.fullName || 'Anonymous'}
                </h6>
                <p>{post.content}</p>
              </div>
            </div>
          </Link>
        ))
      )}

      <hr />

      {isAuthenticated && (
        <form onSubmit={handleSubmit}>
          <textarea
            className="form-control mb-2"
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="btn btn-primary">Post</button>
        </form>
      )}
    </div>
  )
}
