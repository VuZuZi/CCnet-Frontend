import { useState } from "react";
import { usePostComments } from "../hooks/usePostDetails";
import { usePostMutations } from "../hooks/usePostMutations";
import { formatDistanceToNow } from "date-fns";
import { Spinner } from "react-bootstrap";
import { Button } from "@/shared/components/ui/Button/Button";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";

const CommentItem = ({ comment }) => (
  <div className="d-flex mb-3">
    <img
      src={comment.author?.avatar || "https://via.placeholder.com/32"}
      className="rounded-circle me-2"
      width={32} height={32} alt="User"
    />
    <div className="bg-light p-3 rounded-3 w-100">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <strong className="small">{comment.author?.fullName}</strong>
        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </small>
      </div>
      <p className="mb-0 small">{comment.content}</p>
    </div>
  </div>
);

const CommentSection = ({ postId }) => {
  const [content, setContent] = useState("");
  const user = useAuthStore(authSelectors.user);
  
  const { data, fetchNextPage, hasNextPage, isLoading } = usePostComments(postId);
  const { addCommentMutation } = usePostMutations();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    addCommentMutation.mutate(
      { postId, content: content.trim() },
      { onSuccess: () => setContent("") }
    );
  };

  const comments = data?.pages.flatMap(page => page.data) || [];

  return (
    <div className="mt-4">
      <h6 className="mb-3 fw-bold">Comments</h6>
      
      <div className="d-flex mb-4">
         <img
            src={user?.avatar || "https://via.placeholder.com/32"}
            className="rounded-circle me-2"
            width={32} height={32} alt="Me"
         />
         <form onSubmit={handleSubmit} className="w-100 position-relative">
            <textarea
                className="form-control"
                rows={2}
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: "none", paddingRight: "80px" }}
            />
            <div className="position-absolute bottom-0 end-0 p-2">
                <Button 
                    size="sm" 
                    variant="black" 
                    disabled={!content.trim() || addCommentMutation.isPending}
                    style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                >
                    {addCommentMutation.isPending ? 'Sending...' : 'Send'}
                </Button>
            </div>
         </form>
      </div>

      {isLoading ? (
        <div className="text-center my-3"><Spinner size="sm" /></div>
      ) : comments.length > 0 ? (
        <div>
            {comments.map(comment => (
                <CommentItem key={comment._id} comment={comment} />
            ))}
            
            {hasNextPage && (
                <button 
                    className="btn btn-link btn-sm w-100 text-decoration-none"
                    onClick={fetchNextPage}
                >
                    Load more comments
                </button>
            )}
        </div>
      ) : (
        <p className="text-center text-muted small">No comments yet. Be the first to share your thoughts!</p>
      )}
    </div>
  );
};

export default CommentSection;