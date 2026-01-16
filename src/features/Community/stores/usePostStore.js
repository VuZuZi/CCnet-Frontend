import { create } from "zustand";
import { postAPI } from "@/features/community/api/postAPI";

export const usePostStore = create((set, get) => ({
  posts: [],
  post: null,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  limit: 6,
  currentUserId: null,
  setCurrentUserId: (id) => set({ currentUserId: id }),
  setPosts: (posts) => set({ posts }),
  setPost: (post) => set({ post }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  fetchPosts: async () => {
    set({ loading: true, error: null, page: 1, hasMore: true });
    try {
      console.log("Fetching initial page 1 with limit:", get().limit);
      const res = await postAPI.getPosts({ page: 1, limit: get().limit });
      const rawPosts = res.data?.data || res.data || res || [];
      const newPosts = Array.isArray(rawPosts) ? rawPosts : [];

      console.log("Initial posts loaded:", newPosts.length);

      set({
        posts: newPosts,
        page: 1,
        hasMore: newPosts.length === get().limit,
        loading: false,
      });
    } catch (err) {
      console.error("fetchPosts error:", err);
      set({ error: err.message || "Failed to load posts", loading: false });
    }
  },

  fetchMorePosts: async () => {
    const { page, loading, hasMore, limit } = get();
    console.log(
      "fetchMorePosts called! Current page:",
      page,
      "hasMore:",
      hasMore,
      "loading:",
      loading
    );

    if (loading || !hasMore) {
      console.log("Blocked: loading or no more posts");
      return;
    }

    set({ loading: true, error: null });

    try {
      const nextPage = page + 1;
      console.log("Requesting page:", nextPage, "with limit:", limit);
      const res = await postAPI.getPosts({ page: nextPage, limit });
      const rawPosts = res.data?.data || res.data || res || [];
      const newPosts = Array.isArray(rawPosts) ? rawPosts : [];

      console.log("Received new posts:", newPosts.length);

      set((state) => ({
        posts: [...state.posts, ...newPosts],
        page: nextPage,
        hasMore: newPosts.length === limit,
        loading: false,
      }));
    } catch (err) {
      console.error("fetchMorePosts error:", err);
      set({ error: err.message || "Failed to load more", loading: false });
    }
  },
  fetchPostById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await postAPI.getPostById(id);
      set({ post: res.data, loading: false });
    } catch (err) {
      set({ error: err.message || "Failed to fetch post", loading: false });
    }
  },

  createNewPost: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await postAPI.createPost(data);
      const newPost = response.data;
      set((state) => ({
        posts: [newPost, ...state.posts],
        loading: false,
      }));

      await get().fetchPosts();

      return newPost;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create post",
        loading: false,
      });
      throw error;
    }
  },

  toggleLike: async (postId) => {
    const { posts, currentUserId } = get();
    if (!currentUserId) return;

    const postIndex = posts.findIndex((p) => p._id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const isCurrentlyLiked = post.likes.some(
      (u) => (u._id || u) === currentUserId
    );
    const isCurrentlyDisliked = post.dislikes.some(
      (u) => (u._id || u) === currentUserId
    );

    // Optimistic update: toggle like + remove from dislikes if present
    const updatedLikes = isCurrentlyLiked
      ? post.likes.filter((u) => (u._id || u) !== currentUserId)
      : [...post.likes, { _id: currentUserId }];

    const updatedDislikes = isCurrentlyDisliked
      ? post.dislikes.filter((u) => (u._id || u) !== currentUserId)
      : post.dislikes;

    const newPosts = [...posts];
    newPosts[postIndex] = {
      ...post,
      likes: updatedLikes,
      dislikes: updatedDislikes,
    };

    set({ posts: newPosts });

    try {
      await postAPI.toggleLike(postId);
    } catch (error) {
      // Rollback on failure
      set({ posts });
      console.error("Like failed:", error);
    }
  },

  toggleDislike: async (postId) => {
    const { posts, currentUserId } = get();
    if (!currentUserId) return;

    const postIndex = posts.findIndex((p) => p._id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const isCurrentlyDisliked = post.dislikes.some(
      (u) => (u._id || u) === currentUserId
    );
    const isCurrentlyLiked = post.likes.some(
      (u) => (u._id || u) === currentUserId
    );

    // Optimistic update: toggle dislike + remove from likes if present
    const updatedDislikes = isCurrentlyDisliked
      ? post.dislikes.filter((u) => (u._id || u) !== currentUserId)
      : [...post.dislikes, { _id: currentUserId }];

    const updatedLikes = isCurrentlyLiked
      ? post.likes.filter((u) => (u._id || u) !== currentUserId)
      : post.likes;

    const newPosts = [...posts];
    newPosts[postIndex] = {
      ...post,
      likes: updatedLikes,
      dislikes: updatedDislikes,
    };

    set({ posts: newPosts });

    try {
      await postAPI.toggleDislike(postId);
    } catch (error) {
      // Rollback on failure
      set({ posts });
      console.error("Dislike failed:", error);
    }
  },

  addComment: async (postId, content) => {
    const { currentUserId } = get();
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      content,
      author: {
        _id: currentUserId,
        fullName: "You",
      },
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      posts: state.posts.map((post) =>
        post._id === postId
          ? {
              ...post,
              comments: [...(post.comments || []), optimisticComment],
            }
          : post
      ),
    }));

    try {
      const res = await postAPI.addComment(postId, content);
      const realComment = res.data.data ?? res.data;

      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((c) =>
                  c._id === optimisticComment._id ? realComment : c
                ),
              }
            : post
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  },
}));
