import InfiniteScroll from "react-infinite-scroll-component";
import { useFetchPosts } from "../hooks/useFetchPosts";
import PostCard from "../components/PostCard";
import PostForm from "../components/PostForm";
import { Spinner } from "react-bootstrap";

const CommunityPage = () => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    status 
  } = useFetchPosts();

  const posts = data?.pages.flatMap((page) => page.data) || [];

  if (status === "pending") {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (status === "error") {
    return <div className="alert alert-danger m-3">Failed to load feed.</div>;
  }

  return (
    <div className="container py-4" style={{ maxWidth: "680px" }}>
      <PostForm />

      <h5 className="mb-4 fw-bold">News Feed</h5>

      <InfiniteScroll
        dataLength={posts.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={<div className="text-center py-3"><Spinner animation="grow" size="sm" /></div>}
        endMessage={
          <p className="text-center text-muted mt-3">
             You have seen it all!
          </p>
        }
      >
        <div className="d-flex flex-column">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default CommunityPage;