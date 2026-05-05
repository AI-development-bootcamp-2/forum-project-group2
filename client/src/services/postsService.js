const BASE = '/api/posts'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function listPosts(page = 1, limit = 10) {
  const res = await fetch(`${BASE}?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export async function getPost(id) {
  const res = await fetch(`${BASE}/${id}`)
  if (!res.ok) throw new Error('Post not found')
  return res.json()
}

export async function createPost({ title, body }) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title, body }),
  })
  if (!res.ok) throw new Error('Failed to create post')
  return res.json()
}

export async function updatePost(id, { title, body }) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title, body }),
  })
  if (!res.ok) throw new Error('Failed to update post')
  return res.json()
}

export async function deletePost(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete post')
  return res.json()
}
