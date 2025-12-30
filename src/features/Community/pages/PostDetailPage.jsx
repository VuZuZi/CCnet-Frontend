import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { postAPI } from '../api/postAPI'
import { usePostStore } from '../stores/usePostStore'

export function PostDetailPage() {
  const { postId } = useParams()
  const { post, setPost, loading, setLoading } = usePostStore()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await postAPI.getPostById(postId)
        setPost(res.data.data ?? res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId, setPost, setLoading])

  if (loading) return <p className="m-4">Loading...</p>
  if (!post) return <p className="m-4">Post not found</p>

  return (
    <div className="container mt-4">
      <div className="card">
        {/* FULL IMAGE */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="post"
            className="card-img-top"
          />
        )}

        <div className="card-body">
          <h6 className="text-muted">
            {post.author?.fullName || 'Anonymous'}
          </h6>

          {/* TEXT WITH LINE BREAKS */}
          {post.content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
