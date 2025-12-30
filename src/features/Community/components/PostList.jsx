import { Link } from 'react-router-dom'

export function PostList({ post }) {
  return (
    <Link
      to={`/community/${post._id}`}
      className="text-decoration-none text-dark"
    >
      <div className="post-card border rounded p-3 mb-3">
        <h5>{post.title}</h5>
        <p>{post.content.slice(0, 100)}...</p>
      </div>
    </Link>
  )
}
