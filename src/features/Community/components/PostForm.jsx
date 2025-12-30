import { useState } from 'react'
import { useCreatePost } from '../hooks/useCreatePosts'

export function PostForm() {
  const [content, setContent] = useState('')
  const { createPost } = useCreatePost()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    await createPost(content)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <textarea
        className="form-control"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button className="btn btn-primary mt-2">Post</button>
    </form>
  )
}
