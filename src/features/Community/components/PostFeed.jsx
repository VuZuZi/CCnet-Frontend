import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { usePosts } from "../hooks/usePosts";
import PostCard from "./PostCard";

const PostFeed = ({ currentUserId, onReport, feedType }) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isError, error } =
    usePosts(10, feedType);

  if (isLoading) return <PostFeedSkeleton />;

  if (isError)
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-medium">
        ⚠️ Error: {error.message}
      </div>
    );

  const posts = data?.pages.flatMap((page) => page.data) || [];

  if (posts.length === 0)
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
        <span className="material-symbols-outlined text-slate-300 text-5xl mb-2">
          post_add
        </span>
        <p className="text-slate-500 font-medium">
          No posts yet. Be the first to share something!
        </p>
      </div>
    );

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      scrollThreshold={0.8}
      loader={
        <div className="space-y-4 py-6">
          <p className="text-center text-primary font-bold animate-pulse text-sm">
            Loading older posts...
          </p>
        </div>
      }
      endMessage={
        <div className="text-center py-10">
          <p className="text-slate-400 font-bold text-sm">
            ✨ You've reached the end of the feed
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-2 text-primary text-xs font-bold hover:underline"
          >
            Back to top
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUserId}
            onReport={onReport}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

const PostFeedSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-white rounded-2xl h-64 border border-slate-100"
      />
    ))}
  </div>
);

export default PostFeed;
