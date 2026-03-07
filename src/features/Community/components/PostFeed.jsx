import InfiniteScroll from "react-infinite-scroll-component";
import { usePosts } from "../hooks/usePosts";
import { PostCard } from "./PostCard";

export function PostFeed({ currentUserId, onReport }) {
  const { data, fetchNextPage, hasNextPage, isLoading, isError, error } = usePosts(10);

  if (isLoading) return <p className="text-center py-8 text-gray">Loading posts...</p>;
  if (isError) return <div className="bg-[#f8d7da] text-[#842029] p-4 rounded-lg">{error.message}</div>;

  const posts = data?.pages.flatMap(page => page.data) || [];

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-light-gray p-8 text-center">
        <p className="text-gray mb-0">No posts yet. Be the first!</p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<p className="text-center py-4 text-yellow">Loading more...</p>}
      endMessage={<p className="text-center text-gray py-8">You've reached the end of the feed ✨</p>}
    >
      {posts.map((post) => (
        <PostCard 
          key={post._id} 
          post={post} 
          currentUserId={currentUserId} 
          onReport={onReport} 
        />
      ))}
    </InfiniteScroll>
  );
}