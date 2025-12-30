import { postAPI } from '../api/postAPI'
import { usePostStore } from '../stores/usePostStore'
import { useEffect } from 'react'

export function useFetchPosts() {
  const { setPosts, setLoading, setError } = usePostStore()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const res = await postAPI.getPosts()
        setPosts(res.data.data ?? res.data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [setPosts, setLoading, setError])
}
