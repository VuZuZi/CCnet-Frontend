import { create } from 'zustand'

export const usePostStore = create((set) => ({
  // list page
  posts: [],
  setPosts: (posts) => set({ posts }),

  // detail page
  post: null,
  setPost: (post) => set({ post }),

  // shared
  loading: false,
  setLoading: (loading) => set({ loading }),

  error: null,
  setError: (error) => set({ error }),
}))
