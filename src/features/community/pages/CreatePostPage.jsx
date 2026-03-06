import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePost } from '@/features/community/hooks/useCreatePost'

export function CreatePostPage() {
  const [content, setContent] = useState('')
  const [images, setImages] = useState([]) 
  const [uploading, setUploading] = useState(false)
  const { createPost, loading } = useCreatePost()
  const navigate = useNavigate()

  
  const CLOUD_NAME = 'dehphwer7'  
  const UPLOAD_PRESET = 'ccnet-unsigned'   

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.secure_url
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    setImages(prev => [...prev, ...files])
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      alert('Please write something!')
      return
    }

    if (images.length === 0) {
      await createPost({ content: trimmedContent, images: [] })
      navigate('/community')
      return
    }

    setUploading(true)
    try {
      const imageUrls = await Promise.all(
        images.map(file => uploadToCloudinary(file))
      )

      await createPost({
        content: trimmedContent,
        images: imageUrls,
      })

      navigate('/community')
    } catch (err) {
      console.error(err)
      alert('Failed to upload images. Try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 700, margin: '40px auto' }}>
      <h2 className="mb-4">Create Post</h2>

      <form onSubmit={handleSubmit}>
        <textarea
          className="form-control mb-4"
          rows={6}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
          className="border border-dashed rounded p-5 text-center mb-4"
          style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
        >
          <p className="mb-2"><strong>Drag & drop images here</strong></p>
          <p className="text-muted">or click to browse (max 5)</p>
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
          <div className="mb-4">
            <p className="fw-bold mb-3">Preview ({images.length} images):</p>
            <div className="d-flex flex-wrap gap-3">
              {images.map((file, i) => (
                <div key={i} className="position-relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="rounded shadow-sm"
                    style={{ width: 150, height: 150, objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="btn-close position-absolute top-0 end-0 bg-white rounded-circle"
                    style={{ transform: 'translate(50%, -50%)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg w-100"
          disabled={loading || uploading || !content.trim()}
        >
          {uploading ? 'Uploading images...' : loading ? 'Posting...' : 'Publish Post'}
        </button>
      </form>
    </div>
  )
}