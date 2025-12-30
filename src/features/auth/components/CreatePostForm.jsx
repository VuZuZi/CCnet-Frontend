import { useState } from 'react';
import { useCreatePost } from '../hooks/useCreatePost';

const CreatePostForm = () => {
  const [content, setContent] = useState('');
  const { mutate, isPending } = useCreatePost();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    mutate(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        className="form-control mb-2"
        rows={3}
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button className="btn btn-primary" disabled={isPending}>
        Post
      </button>
    </form>
  );
};

export default CreatePostForm;
