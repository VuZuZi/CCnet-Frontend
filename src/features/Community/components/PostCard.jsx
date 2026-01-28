import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { usePostMutations } from "../hooks/usePostMutations";
import AdaptiveImage from "./AdaptiveImage";
import { FaHeart, FaRegHeart, FaRegComment, FaShare } from "react-icons/fa";
import clsx from "clsx";

const PostCard = ({ post, isDetail = false }) => {
  const { reactionMutation } = usePostMutations();

  const handleReaction = (e, type) => {
    e.preventDefault();
    e.stopPropagation(); 
    reactionMutation.mutate({ postId: post._id, type });
  };

  const renderImages = () => {
    if (!post.images?.length) return null;
    const displayImages = isDetail ? post.images : post.images.slice(0, 4);
    const remainCount = post.images.length - 4;

    return (
      <div className={clsx("row g-2 mt-3", {
        "row-cols-1": displayImages.length === 1,
        "row-cols-2": displayImages.length > 1,
      })}>
        {displayImages.map((img, index) => (
          <div key={img.publicId || index} className="col position-relative">
            <AdaptiveImage media={img} className="rounded" />
            {!isDetail && index === 3 && remainCount > 0 && (
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center text-white fw-bold rounded pointer-events-none">
                    +{remainCount}
                </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const likes = post.stats?.likes || 0;
  const comments = post.stats?.comments || 0;
  const isLiked = post.userReaction === 'like'; 

  const Wrapper = isDetail ? 'div' : Link;
  const wrapperProps = isDetail ? {} : { 
    to: `/community/${post._id}`, 
    className: "text-decoration-none text-dark" 
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body p-0">
        <div className="p-3 d-flex align-items-center">
          <img 
            src={post.author?.avatar || "https://via.placeholder.com/40"} 
            className="rounded-circle me-3 object-fit-cover"
            width={40} height={40} alt="Avatar"
          />
          <div>
            <h6 className="mb-0 fw-bold">{post.author?.fullName || "Unknown User"}</h6>
            <small className="text-muted">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
            </small>
          </div>
        </div>

        <Wrapper {...wrapperProps}>
          <div className="px-3">
            <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
            {post.hashtags?.length > 0 && (
               <div className="mb-2 text-primary">
                 {post.hashtags.map(tag => <span key={tag} className="me-2">#{tag}</span>)}
               </div>
            )}
          </div>
          {post.images?.length > 0 && <div className="px-3 pb-3">{renderImages()}</div>}
        </Wrapper>

        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-2">
          <button 
            className={clsx("btn btn-link text-decoration-none", 
              isLiked ? 'text-danger' : 'text-dark')}
            onClick={(e) => handleReaction(e, 'like')}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />} 
            <span className="ms-2 fw-semibold">{likes}</span>
          </button>

          <Link to={`/community/${post._id}`} className="btn btn-link text-decoration-none text-dark">
            <FaRegComment /> <span className="ms-2">{comments} Comments</span>
          </Link>
          
          <button className="btn btn-link text-decoration-none text-dark">
            <FaShare /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;