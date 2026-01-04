import { Link } from 'react-router-dom'

export function PostList({ post }) {
  return (
    <Link to={`/community/${post._id}`} className="text-decoration-none text-dark">
      <div className="border rounded p-3 mb-3">
        <p>{post.content}</p>

        {post.images?.length > 0 && (
          <div className="d-flex gap-2 mt-2">
            {post.images.map((img, i) => (
              <img
                key={i}
                src={`${import.meta.env.VITE_API_URL}${img}`}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 6,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
