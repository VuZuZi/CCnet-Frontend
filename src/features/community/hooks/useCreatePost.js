import { postAPI } from '../api/postAPI'

export function useCreatePost() {
  const createPost = async ({ content, images = [] }) => {
    
    return postAPI.createPost({
      content,
      images, 
    })
  }

  return { createPost }
}