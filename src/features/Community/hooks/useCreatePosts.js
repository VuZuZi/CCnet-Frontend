import { postAPI } from '../api/postAPI'
import { usePostStore } from '../stores/usePostStore'

export function useCreatePost() {
  const { addPost, setLoading, setError } = usePostStore()

  const createPost = async (content) => {
    try {
      setLoading(true)
      const res = await postAPI.createPost(content)
      addPost(res.data.data ?? res.data)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createPost }
}
