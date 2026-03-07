import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { usePostDetail } from '../hooks/usePosts';
import { usePostMutations } from '../hooks/usePostMutations';
import { Button } from '@/shared/components/ui/Button/Button';

const formatTimeAgo = (dateString) => {
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return `${Math.floor(diffInDays / 7)}w ago`;
};

export function PostDetailPage() {
  const { id: postId } = useParams();
  const [commentContent, setCommentContent] = useState('');

  const { data: responseData, isLoading, isError } = usePostDetail(postId);
  const { addComment } = usePostMutations();

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await addComment.mutateAsync({ postId, content: commentContent });
      setCommentContent('');
    } catch (error) {
      console.error('Failed to comment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 flex justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-yellow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (isError || !responseData?.data) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-[#dc3545] font-bold">Post not found or an error occurred.</p>
      </div>
    );
  }

  const currentPost = responseData.data;
  const authorName = currentPost.author?.fullName || currentPost.author?.username || 'Anonymous';
  const authorInitials = authorName.substring(0, 1).toUpperCase();

  const comments = currentPost.latestComments || currentPost.comments || [];

  return (
    <div className="min-h-screen py-8 bg-off-white px-4">
      <div className="w-full max-w-3xl mx-auto">

        <Link to="/community" className="inline-flex items-center gap-2 text-gray hover:text-black mb-6 transition-colors font-medium no-underline">
          <FiArrowLeft size={18} />
          <span>Back to Community</span>
        </Link>

        {/* Post Card */}
        <div className="bg-white shadow-sm border border-light-gray rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow text-black flex items-center justify-center font-bold text-lg shrink-0 mr-4">
              {authorInitials}
            </div>
            <div>
              <h5 className="font-bold text-black mb-0">{authorName}</h5>
              <small className="text-gray">{formatTimeAgo(currentPost.createdAt)}</small>
            </div>
          </div>

          <p className="text-black text-lg whitespace-pre-wrap leading-relaxed mb-4">
            {currentPost.content}
          </p>

          {currentPost.images?.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {currentPost.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt="Post attachment"
                  className="rounded-lg border border-light-gray max-w-full h-auto object-cover max-h-[300px]"
                />
              ))}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white shadow-sm border border-light-gray rounded-2xl p-6 md:p-8">
          <h4 className="font-bold text-black mb-6">Comments ({comments.length})</h4>

          <form onSubmit={handleComment} className="mb-8">
            <textarea
              className="w-full rounded-md border border-light-gray py-3 px-4 text-black focus:outline-none focus:ring-1 focus:border-yellow transition-colors mb-4 resize-y"
              rows="3"
              placeholder="Write a thoughtful comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={addComment.isPending}
              required
            />
            <Button
              type="submit"
              variant="yellow"
              disabled={addComment.isPending || !commentContent.trim()}
              isLoading={addComment.isPending}
            >
              Post Comment
            </Button>
          </form>

          {comments.length === 0 ? (
            <p className="text-gray text-center py-4">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="border-l-4 border-yellow pl-4 py-3 bg-[#fafafa] rounded-r-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <strong className="text-black">{comment.author?.fullName || comment.author?.username || 'Anonymous'}</strong>
                    <small className="text-gray">{formatTimeAgo(comment.createdAt)}</small>
                  </div>
                  <p className="mb-0 text-dark">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}