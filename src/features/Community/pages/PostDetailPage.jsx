import { useParams, useNavigate } from "react-router-dom";
import { usePostDetail } from "../hooks/usePostDetails";
import PostCard from "../components/PostCard";
import CommentSection from "../components/CommentSection";
import { Spinner } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

export const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: postResponse, isLoading, isError } = usePostDetail(id);
  const post = postResponse?.data;

  if (isLoading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (isError || !post) {
    return (
        <div className="text-center mt-5">
            <h3>Post not found</h3>
            <button className="btn btn-link" onClick={() => navigate('/community')}>Back to Feed</button>
        </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "680px" }}>
      <button 
        className="btn btn-link text-decoration-none text-dark mb-3 ps-0 d-flex align-items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft /> Back
      </button>

      <PostCard post={post} isDetail={true} />

      <div className="bg-white p-3 rounded shadow-sm border-0">
         <CommentSection postId={post._id} />
      </div>
    </div>
  );
};

export default PostDetailPage;