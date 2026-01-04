import { postAPI } from '../api/postAPI'

export function useCreatePost() {
  const createPost = async ({ content, images }) => {
    const formData = new FormData()
    formData.append('content', content)

    images.forEach(img => {
      formData.append('images', img)
    })

    return postAPI.createPost(formData)
  }

  return { createPost }
}
