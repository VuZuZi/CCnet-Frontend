import { useState } from 'react'
import { useNavigate } from 'react-router-dom'  // ← Add this import
import { useCreatePost } from '@/features/community/hooks/useCreatePost'

export function CreatePostPage() {
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const { createPost, loading } = useCreatePost()
  
  const navigate = useNavigate() 

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    )
    setImages(prev => [...prev, ...files])
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await createPost({ content, images })
      

      setContent('')
      setImages([])
      

      navigate('/community') 
    } catch (error) {

      console.error('Failed to create post:', error)
      alert('Failed to post. Please try again.')
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '20px auto' }}>
      <form onSubmit={handleSubmit}>
        <textarea
          className="form-control mb-3"
          rows={4}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
          className="border rounded p-4 text-center mb-3"
          style={{ cursor: 'pointer' }}
        >
          <strong>Drag & drop images</strong>
          <div className="text-muted">or click to select</div>

          <input
            id="fileInput"
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={handleFileSelect}
          />
        </div>

        {images.length > 0 && (
          <div className="d-flex gap-2 flex-wrap mb-3">
            {images.map((img, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="btn-close"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                  }}
                  aria-label="Remove image"
                />
              </div>
            ))}
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary w-100" 
          disabled={loading || !content.trim()}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  )
}