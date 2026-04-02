import { Link } from 'react-router-dom'

export function PostList({ post }) {
  return (
    <Link to={`/community/${post._id}`} className="no-underline text-black block">
      <div className="border border-light-gray rounded-xl p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <p className="text-dark mb-0 whitespace-pre-wrap">{post.content}</p>

        {post.images?.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {post.images.map((img, i) => (
              <img
                key={i}
                src={`${import.meta.env.VITE_API_URL}${img}`}
                alt="Post attachment"
                className="w-[100px] h-[100px] object-cover rounded-lg shrink-0 border border-light-gray"
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}