import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { listPosts, createPost } from '../services/postsService'
import PostActions from './PostActions'
import mockData from '../tests.json'

export default function PostList() {
  const { user } = useContext(AuthContext)
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [formError, setFormError] = useState(null)

  function fetchPosts(p) {
    listPosts(p)
      .then(data => {
        setPosts(data.posts)
        setTotalPages(data.totalPages)
      })
      .catch(() => {
        setPosts(mockData.posts)
        setTotalPages(mockData.totalPages)
      })
  }

  useEffect(() => { fetchPosts(page) }, [page])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError(null)
    try {
      await createPost({ title, body })
      setTitle('')
      setBody('')
      setShowPopup(false)
      fetchPosts(1)
      setPage(1)
    } catch {
      setFormError('Failed to create post')
    }
  }

  if (error) return <p>{error}</p>

  return (
    <div>
      {user && (
        <button type="button" onClick={() => setShowPopup(true)}>Add Post</button>
      )}

      {showPopup && (
        <div>
          <form onSubmit={handleCreate}>
            <h2>New Post</h2>
            <div>
              <label htmlFor="new-title">Title</label>
              <input
                id="new-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="new-body">Body</label>
              <textarea
                id="new-body"
                value={body}
                onChange={e => setBody(e.target.value)}
                required
              />
            </div>
            {formError && <p>{formError}</p>}
            <button type="submit">Create</button>
            <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
          </form>
        </div>
      )}

      {posts.map(post => (
        <div key={post._id}>
          <Link to={`/posts/${post._id}`}>
            <h2>{post.title}</h2>
          </Link>
          <p>by {post.authorUsername} &middot; {new Date(post.createdAt).toLocaleDateString()}</p>
          <PostActions post={post} onDeleted={() => fetchPosts(page)} />
        </div>
      ))}

      <div>
        <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</button>
        <span> Page {page} of {totalPages} </span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</button>
      </div>
    </div>
  )
}
