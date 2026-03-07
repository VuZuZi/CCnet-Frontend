import { useState } from 'react';
import { usePostMutations } from '../hooks/usePostMutations';
import { Button } from '@/shared/components/ui/Button/Button';

export function PostForm() {
  const [content, setContent] = useState('');
  const { createPost } = usePostMutations();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || createPost.isPending) return;

    const formData = new FormData();
    formData.append('content', content);

    await createPost.mutateAsync(formData);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-light-gray">
      <textarea
        className="w-full border border-light-gray rounded-lg p-3 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors resize-y min-h-[100px]"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={createPost.isPending}
      />
      <div className="mt-3 flex justify-end">
        <Button variant="yellow" type="submit" className="!py-2 !px-6" isLoading={createPost.isPending}>
          Post
        </Button>
      </div>
    </form>
  );
}