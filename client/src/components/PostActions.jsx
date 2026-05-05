import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { deletePost } from '../services/postsService'

export default function PostActions({ post, onDeleted }) {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  async function handleDelete() {
    if (!user) return
    await deletePost(post._id)
    if (onDeleted) {
      onDeleted()
    } else {
      navigate('/')
    }
  }

  return (
    <div>
      <Link to={`/posts/${post._id}/edit`}>Edit</Link>
      <button type="button" onClick={handleDelete}>Delete</button>
    </div>
  )
}
