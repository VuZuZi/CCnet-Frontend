import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiImage } from 'react-icons/fi';
import { usePostMutations } from '../hooks/usePostMutations';
import { Button } from '@/shared/components/ui/Button/Button';

export function CreatePostPage() {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  
  // Dùng Mutation thay cho Custom Hook cũ
  const { createPost } = usePostMutations();
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...files].slice(0, 5)); // Backend giới hạn max 5 ảnh
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...files].slice(0, 5));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      
      images.forEach((file) => {
        formData.append('images', file); 
      });

      await createPost.mutateAsync(formData);
      navigate('/community');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert(error.response?.data?.message || 'Failed to publish. Please try again.');
    }
  };

  return (
    <div className="min-h-screen py-8 bg-off-white px-4 md:px-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-light-gray p-6 md:p-8">
          <h3 className="text-2xl font-bold text-black mb-6">Create a New Post</h3>
          
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full rounded-md border border-light-gray py-3 px-4 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors mb-6 resize-y min-h-[150px]"
              rows="5"
              placeholder="What do you want to share with the community?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={createPost.isPending}
              required
            />

            <div 
              className="border-2 border-dashed border-gray/50 bg-light-gray/30 p-8 text-center rounded-xl mb-6 cursor-pointer hover:bg-light-gray/80 transition-colors flex flex-col items-center justify-center"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <FiImage size={32} className="text-gray mb-3" />
              <p className="text-black font-medium mb-1">Drag and drop images here</p>
              <p className="text-gray text-sm mb-0">or click to browse (max 5)</p>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={createPost.isPending}
              />
            </div>

            {images.length > 0 && (
              <div className="mb-6">
                <p className="font-bold text-black mb-3">Preview ({images.length} images):</p>
                <div className="flex flex-wrap gap-4">
                  {images.map((file, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="rounded-lg shadow-sm border border-light-gray object-cover w-[120px] h-[120px]"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(i);
                        }}
                        className="absolute -top-2 -right-2 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-gray-200 transition-colors border-none cursor-pointer"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="yellow"
              className="w-full !py-3 !text-lg"
              disabled={createPost.isPending || !content.trim()}
              isLoading={createPost.isPending}
            >
              {createPost.isPending ? 'Publishing...' : 'Publish Post'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}