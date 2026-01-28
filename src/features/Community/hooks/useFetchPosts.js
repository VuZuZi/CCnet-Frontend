import { postAPI } from '../api/postAPI'
import { useEffect } from 'react'
import { usePostStore } from '../stores/usePostStore'

export function useFetchPosts() {
  const { setPosts, setLoading, setError } = usePostStore()

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await postAPI.getPosts()
        setPosts(res.data.data ?? res.data)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])
}
