## Person 2 — Posts

> Files: `server/routes/posts.js`, `server/controllers/postsController.js`, and everything under `client/src/` that is prefixed with `Post`.
> Do NOT modify `server/index.js`, `App.jsx`, or any file listed under Person 1 or Person 3.

---

### Backend

- [ ] P2-B1 Create `server/controllers/postsController.js` — export a factory `(db) => ({ createPost, listPosts, getPost, updatePost, deletePost })` where each value is an Express handler:
  - `listPosts`: read `page` (default 1) and `limit` (default 10, max 50) from `req.query`; query `posts` collection sorted by `createdAt` desc with `skip`/`limit`; return 200 `{ posts, total, page, totalPages }`
  - `getPost`: find post by `new ObjectId(req.params.id)`; return 200 with post or 404
  - `createPost`: requires auth; validate `title` and `body` non-empty (400 if not); insert `{ title, body, authorId: new ObjectId(req.user.userId), authorUsername: req.user.username, createdAt: new Date(), updatedAt: new Date() }`; return 201 with inserted document
  - `updatePost`: does NOT require auth at the route level (uses `optionalAuth`); fetch post by id (404 if missing); if `req.user` is present and `req.user.userId !== post.authorId.toString()` return 403; if `req.user` is absent (guest), set `authorUsername` to `"guest"`; update `title`, `body`, `authorUsername`, `updatedAt`; return 200 with updated document
  - `deletePost`: requires auth; fetch post (404 if missing); check ownership (403 if not author); delete post from `posts`; delete all comments where `postId === post._id` from `comments`; return 200
- [ ] P2-B2 Create `server/routes/posts.js` — `module.exports = (db) => { ... return router }`:
  - `GET /` → `listPosts` (no auth)
  - `POST /` → `requireAuth`, `createPost`
  - `GET /:id` → `getPost` (no auth)
  - `PUT /:id` → `optionalAuth`, `updatePost`
  - `DELETE /:id` → `requireAuth`, `deletePost`
  - Import `requireAuth` and `optionalAuth` from `../middleware/auth` (read-only import, do not modify that file)

---

### Frontend

- [x] P2-F1 Create `client/src/services/postsService.js` — export:
  - `listPosts(page = 1, limit = 10)` → `GET /api/posts?page=&limit=`
  - `getPost(id)` → `GET /api/posts/:id`
  - `createPost({ title, body })` → `POST /api/posts` with `Authorization` header
  - `updatePost(id, { title, body })` → `PUT /api/posts/:id`; attach `Authorization: Bearer <token>` header only when a token exists in `localStorage`
  - `deletePost(id)` → `DELETE /api/posts/:id` with `Authorization` header
  - Helper: read token from `localStorage.getItem('token')` and attach as `Authorization: Bearer <token>` on write calls that require it
- [x] P2-F2 Create `client/src/components/PostList.jsx` — on mount calls `postsService.listPosts(page)`; renders list of posts showing title, `authorUsername`, and formatted `createdAt`; each item links to `/posts/:id`; renders Previous / Next buttons using `page` and `totalPages` from the response
- [x] P2-F3 Create `client/src/components/PostDetail.jsx` — reads `id` from route params; calls `postsService.getPost(id)` on mount; renders post title, body, author, date; renders `<PostActions>` below the post header; renders `<CommentList postId={id} />` and `<CommentForm postId={id} />` below (Person 3's components — import from their agreed paths)
- [x] P2-F4 Create `client/src/components/PostForm.jsx` — used for both create and edit; reads `id` from route params to determine mode; if `id` present: load existing post and pre-fill fields, submit calls `postsService.updatePost`; if no `id`: submit calls `postsService.createPost`; on success navigate to `/posts/:id`; controlled inputs for `title` (text) and `body` (textarea)
- [x] P2-F5 Create `client/src/components/PostActions.jsx` — receives `post` as prop; reads `user` from `AuthContext`; **always renders both** an Edit link (to `/posts/:id/edit`) and a Delete button regardless of auth state; Delete handler: if no logged-in user, do nothing silently; if logged in, call `postsService.deletePost(post._id)` then navigate to `/`
