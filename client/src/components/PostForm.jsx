import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPost, createPost, updatePost } from '../services/postsService'

export default function PostForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [link, setLink] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      getPost(id)
        .then(post => {
          setTitle(post.title)
          setBody(post.body)
          setLink(post.link || '')
        })
        .catch(() => setError('Failed to load post'))
    }
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const post = id
        ? await updatePost(id, { title, body, link })
        : await createPost({ title, body, link })
      navigate(`/posts/${post._id}`)
    } catch {
      setError('Failed to save post')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="body">Body</label>
        <textarea
          id="body"
          value={body}
          onChange={e => setBody(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="link">Link (optional)</label>
        <input
          id="link"
          type="url"
          value={link}
          onChange={e => setLink(e.target.value)}
        />
      </div>
      {error && <p>{error}</p>}
      <button type="submit">{id ? 'Save changes' : 'Create post'}</button>
    </form>
  )
}
