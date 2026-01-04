import { create } from 'zustand'
import { postAPI } from '@/features/community/api/postAPI'

export const usePostStore = create((set, get) => ({
  posts: [],
  post: null,
  loading: false,
  error: null,

  currentUserId: null,
  setCurrentUserId: (id) => set({ currentUserId: id }),

  setPosts: (posts) => set({ posts }),
  setPost: (post) => set({ post }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  fetchPosts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await postAPI.getPosts()
      set({ posts: response.data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch posts', loading: false })
    }
  },

  fetchPostById: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await postAPI.getPostById(id)
      set({ post: response.data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch post', loading: false })
    }
  },

  createNewPost: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await postAPI.createPost(data)
      const newPost = response.data
      set((state) => ({
        posts: [newPost, ...state.posts],
        loading: false,
      }))
      return newPost
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create post', loading: false })
      throw error
    }
  },

  toggleLike: async (postId) => {
    const { posts, currentUserId } = get()
    if (!currentUserId) return

    const postIndex = posts.findIndex(p => p._id === postId)
    if (postIndex === -1) return

    const post = posts[postIndex]
    const isCurrentlyLiked = post.likes.some(u => u._id === currentUserId)
    const isCurrentlyDisliked = post.dislikes.some(u => u._id === currentUserId)

    const updatedLikes = isCurrentlyLiked
      ? post.likes.filter(u => u._id !== currentUserId)
      : [...post.likes, { _id: currentUserId }]

    const updatedDislikes = isCurrentlyDisliked
      ? post.dislikes.filter(u => u._id !== currentUserId)
      : post.dislikes

    const newPosts = [...posts]
    newPosts[postIndex] = { ...post, likes: updatedLikes, dislikes: updatedDislikes }
    set({ posts: newPosts })

    try {
      await postAPI.toggleLike(postId)
    } catch (error) {
      set({ posts })
      set({ error: 'Failed to update like' })
    }
  },

  toggleDislike: async (postId) => {
    const { posts, currentUserId } = get()
    if (!currentUserId) return

    const postIndex = posts.findIndex(p => p._id === postId)
    if (postIndex === -1) return

    const post = posts[postIndex]
    const isCurrentlyDisliked = post.dislikes.some(u => u._id === currentUserId)
    const isCurrentlyLiked = post.likes.some(u => u._id === currentUserId)

    const updatedDislikes = isCurrentlyDisliked
      ? post.dislikes.filter(u => u._id !== currentUserId)
      : [...post.dislikes, { _id: currentUserId }]

    const updatedLikes = isCurrentlyLiked
      ? post.likes.filter(u => u._id !== currentUserId)
      : post.likes

    const newPosts = [...posts]
    newPosts[postIndex] = { ...post, likes: updatedLikes, dislikes: updatedDislikes }
    set({ posts: newPosts })

    try {
      await postAPI.toggleDislike(postId)
    } catch (error) {
      set({ posts })
      set({ error: 'Failed to update dislike' })
    }
  },

  addComment: async (postId, content) => {
    const { posts, currentUserId } = get()
    if (!currentUserId || !content.trim()) return

    const tempId = Date.now().toString()
    const optimisticComment = {
      _id: tempId,
      content: content.trim(),
      author: { _id: currentUserId, fullName: 'You' },
      createdAt: new Date().toISOString(),
    }

    set({
      posts: posts.map(p =>
        p._id === postId
          ? { ...p, comments: [...p.comments, optimisticComment] }
          : p
      ),
    })

    try {
      const response = await postAPI.addComment(postId, content.trim())
      const realComment = response.data

      set({
        posts: posts.map(p =>
          p._id === postId
            ? {
                ...p,
                comments: p.comments.map(c =>
                  c._id === tempId ? realComment : c
                ),
              }
            : p
        ),
      })
    } catch (error) {
      set({
        posts: posts.map(p =>
          p._id === postId
            ? { ...p, comments: p.comments.filter(c => c._id !== tempId) }
            : p
        ),
      })
      set({ error: 'Failed to add comment' })
    }
  },

  clearError: () => set({ error: null }),
}))