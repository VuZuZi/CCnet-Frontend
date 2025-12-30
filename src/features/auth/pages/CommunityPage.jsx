import { usePosts } from '../hooks/usePosts';
import PostItem from '../components/PostItem';
import CreatePostForm from '../components/CreatePostForm';
import { useAuthStore } from '../../auth/stores/useAuthStore';

const CommunityPage = () => {
  const { data: posts, isLoading } = usePosts();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isLoading) return <p>Loading posts...</p>;

  return (
    <div className="container mt-4">
      <h2>Community</h2>

      {isAuthenticated && <CreatePostForm />}

      {posts?.map((post) => (
        <PostItem key={post._id} post={post} />
      ))}
    </div>
  );
};

export default CommunityPage;
