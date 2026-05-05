import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPost } from '../services/postsService'
import PostActions from './PostActions'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPost(id)
      .then(setPost)
      .catch(() => setError('Post not found'))
  }, [id])

  if (error) return <p>{error}</p>
  if (!post) return <p>Loading...</p>

  return (
    <div>
      <h1>{post.title}</h1>
      <p>by {post.authorUsername} &middot; {new Date(post.createdAt).toLocaleDateString()}</p>
      <PostActions post={post} />
      <p>{post.body}</p>
      {post.link && <a href={post.link} target="_blank" rel="noreferrer">{post.link}</a>}
    </div>
  )
}
