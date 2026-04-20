import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { usePosts } from "../../hooks/usePosts";
import PostCard from "../post/PostCard";

const PostFeed = ({ currentUserId, onReport, feedType, profileUserId, emptyMessage }) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isError, error } =
    usePosts(10, feedType, { profileUserId });

  if (isLoading) return <PostFeedSkeleton />;

  if (isError)
    return (
      <div className="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-100 text-sm font-medium flex items-center gap-3">
        <span className="material-symbols-outlined text-red-400">error</span>
        <div>
          <p className="font-bold">Đã xảy ra lỗi</p>
          <p className="text-red-500 mt-0.5">{error.message}</p>
        </div>
      </div>
    );

  const posts = data?.pages.flatMap((page) => page.data) || [];

  if (posts.length === 0)
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-slate-50 mb-4">
          <span className="material-symbols-outlined text-slate-300 text-4xl">
            post_add
          </span>
        </div>
        <p className="text-slate-600 font-bold text-base">
          {emptyMessage || "Chưa có bài viết nào"}
        </p>
        <p className="text-slate-400 text-sm mt-1.5">
          {feedType === "profile"
            ? "Hãy chia sẻ bài viết đầu tiên lên tường cá nhân!"
            : "Hãy là người đầu tiên chia sẻ trong cộng đồng!"}
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
        <div className="py-8">
          <PostFeedSkeleton count={1} />
        </div>
      }
      endMessage={
        posts.length > 3 ? (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center size-10 rounded-full bg-slate-50 mb-3">
              <span className="material-symbols-outlined text-slate-300 text-xl">
                check_circle
              </span>
            </div>
            <p className="text-slate-400 font-bold text-sm">
              ✨ Bạn đã xem hết tất cả bài viết
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="mt-2 text-amber-600 text-xs font-bold hover:underline"
            >
              Quay lại đầu trang
            </button>
          </div>
        ) : null
      }
    >
      <div className="space-y-5">
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

const PostFeedSkeleton = ({ count = 3 }) => (
  <div className="space-y-5 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      >
        <div className="p-5 flex items-center gap-3">
          <div className="size-10 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 rounded-lg w-32" />
            <div className="h-2.5 bg-slate-100 rounded-lg w-20" />
          </div>
        </div>
        <div className="px-5 space-y-2 mb-4">
          <div className="h-3 bg-slate-100 rounded-lg w-full" />
          <div className="h-3 bg-slate-100 rounded-lg w-3/4" />
        </div>
        <div className="mx-5 mb-4 h-48 bg-slate-100 rounded-xl" />
        <div className="px-5 py-4 border-t border-slate-50 flex gap-6">
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-4 bg-slate-100 rounded w-20 ml-auto" />
        </div>
      </div>
    ))}
  </div>
);

export default PostFeed;
