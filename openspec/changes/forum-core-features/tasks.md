# Implementation Tasks

**File ownership is strict — each person only writes to their listed files.**
**Shared contract:** Person 2 and Person 3 route files export `(db) => router`. Person 1 wires them in `server/index.js` and `App.jsx` before anyone else starts.

---

## Person 1 — Setup + Auth

> Start first. Merge your branch before Person 2 and Person 3 begin integration testing.
> You own every shared scaffolding file. Pre-wire all routes and pages so P2/P3 never touch them.

### Backend

- [ ] P1-B1 Run `npm install jsonwebtoken bcryptjs` inside `server/`; add both to `server/package.json`
- [ ] P1-B2 Create `server/config/db.js` — export `async connectDb()` that connects the native MongoDB client using `process.env.MONGO_URI` and returns the `db` handle; throw and exit if `MONGO_URI` is missing
- [ ] P1-B3 Create `server/config/indexes.js` — export `async createIndexes(db)` that creates: unique index on `users.email`, unique index on `users.username`, descending index on `posts.createdAt`, ascending index on `comments.postId`; all calls are idempotent
- [ ] P1-B4 Create `server/middleware/auth.js` — export `requireAuth(req, res, next)`: reads `Authorization: Bearer <token>`, verifies with `process.env.JWT_SECRET`, attaches `req.user = { userId, username }`, returns 401 if missing or invalid
- [ ] P1-B5 Create `server/controllers/authController.js` — export `register(db)` and `login(db)`, each returning an Express handler (curried on `db`):
  - `register`: validate `username`, `email`, `password` present and `password` ≥ 6 chars; check uniqueness against `users` collection (409 on conflict); hash password with `bcryptjs` (10 rounds); insert user; return 201 `{ token, user: { id, username, email } }`
  - `login`: find user by `email` (401 if not found); compare password with `bcryptjs.compare` (401 if wrong); return 200 `{ token, user: { id, username, email } }`; use identical 401 message for both failure cases to prevent email enumeration
- [ ] P1-B6 Create `server/routes/auth.js` — export a plain router (no db needed): `POST /register` → `authController.register(db)`, `POST /login` → `authController.login(db)`; this file accepts `db` the same way as other routers: `module.exports = (db) => router`
- [ ] P1-B7 Create `server/index.js` — full entry point:
  1. Load `dotenv`; exit with clear error if `JWT_SECRET` is not set
  2. Init Express; apply `cors()` (allow `http://localhost:5173`) and `express.json()`
  3. `await connectDb()` → get `db`
  4. `await createIndexes(db)`
  5. Mount: `app.use('/api/auth', authRouter(db))`, `app.use('/api/posts', postsRouter(db))`, `app.use('/api/posts', commentsRouter(db))`
  6. `app.listen(process.env.PORT || 5000)`
- [ ] P1-B8 Create `.env.example` at the project root with: `MONGO_URI=mongodb://localhost:27017/forum`, `JWT_SECRET=change_me`, `PORT=5000`

### Frontend

- [x] P1-F1 Run `npm install react-router-dom` inside `client/` if not already present
- [x] P1-F2 Create `client/src/context/AuthContext.jsx` — React context with state `{ user, token }`:
  - Read `localStorage.getItem('token')` and `localStorage.getItem('user')` on mount to rehydrate
  - `login(token, user)`: set state, write both to `localStorage`
  - `logout()`: clear state, remove both from `localStorage`
  - Export `AuthContext` and `AuthProvider`
- [x] P1-F3 Create `client/src/services/authService.js` — export:
  - `register({ username, email, password })` → `POST /api/auth/register`
  - `login({ email, password })` → `POST /api/auth/login`
  - Both return the parsed JSON response; throw on non-2xx
- [x] P1-F4 Create `client/src/components/Navbar.jsx` — reads `AuthContext`; when logged out shows links to `/login` and `/register`; when logged in shows `username` and a Logout button that calls `logout()` then navigates to `/`
- [ ] P1-F5 Create `client/src/components/LoginForm.jsx` — controlled form with `email` + `password` fields; on submit calls `authService.login`, then `AuthContext.login(token, user)`, then navigates to `/`; display error message on failure
- [ ] P1-F6 Create `client/src/components/RegisterForm.jsx` — controlled form with `username`, `email`, `password` fields; on submit calls `authService.register`, then `AuthContext.login(token, user)`, then navigates to `/`; display error message on failure
- [ ] P1-F7 Create `client/src/components/PrivateRoute.jsx` — reads `token` from `AuthContext`; if falsy redirects to `/login`; otherwise renders `<Outlet />`
- [ ] P1-F8 Create `client/src/App.jsx` — **pre-wire ALL routes** so Person 2 and Person 3 never touch this file:
  ```
  /                  → <PostList />          (public)
  /posts/new         → <PostForm />          (private)
  /posts/:id         → <PostDetail />        (public)
  /posts/:id/edit    → <PostForm />          (private)
  /login             → <LoginForm />
  /register          → <RegisterForm />
  ```
  Wrap private routes with `<PrivateRoute>`. Import all components from their agreed paths.
- [ ] P1-F9 Update `client/src/main.jsx` — wrap `<App />` with `<AuthProvider>` and `<BrowserRouter>`

---

## Person 2 — Posts

> Files: `server/routes/posts.js`, `server/controllers/postsController.js`, and everything under `client/src/` that is prefixed with `Post`.
> Do NOT modify `server/index.js`, `App.jsx`, or any file listed under Person 1 or Person 3.

### Backend

- [ ] P2-B1 Create `server/controllers/postsController.js` — export a factory `(db) => ({ createPost, listPosts, getPost, updatePost, deletePost })` where each value is an Express handler:
  - `listPosts`: read `page` (default 1) and `limit` (default 10, max 50) from `req.query`; query `posts` collection sorted by `createdAt` desc with `skip`/`limit`; return 200 `{ posts, total, page, totalPages }`
  - `getPost`: find post by `new ObjectId(req.params.id)`; return 200 with post or 404
  - `createPost`: requires auth; validate `title` and `body` non-empty (400 if not); insert `{ title, body, authorId: new ObjectId(req.user.userId), authorUsername: req.user.username, createdAt: new Date(), updatedAt: new Date() }`; return 201 with inserted document
  - `updatePost`: requires auth; fetch post by id (404 if missing); compare `post.authorId` with `req.user.userId` (403 if different); update `title`, `body`, `updatedAt`; return 200 with updated document
  - `deletePost`: requires auth; fetch post (404 if missing); check ownership (403 if not author); delete post from `posts`; delete all comments where `postId === post._id` from `comments`; return 200
- [ ] P2-B2 Create `server/routes/posts.js` — `module.exports = (db) => { ... return router }`:
  - `GET /` → `listPosts` (no auth)
  - `POST /` → `requireAuth`, `createPost`
  - `GET /:id` → `getPost` (no auth)
  - `PUT /:id` → `requireAuth`, `updatePost`
  - `DELETE /:id` → `requireAuth`, `deletePost`
  - Import `requireAuth` from `../middleware/auth` (read-only import, do not modify that file)

### Frontend

- [ ] P2-F1 Create `client/src/services/postsService.js` — export:
  - `listPosts(page = 1, limit = 10)` → `GET /api/posts?page=&limit=`
  - `getPost(id)` → `GET /api/posts/:id`
  - `createPost({ title, body })` → `POST /api/posts` with `Authorization` header
  - `updatePost(id, { title, body })` → `PUT /api/posts/:id` with `Authorization` header
  - `deletePost(id)` → `DELETE /api/posts/:id` with `Authorization` header
  - Helper: read token from `localStorage.getItem('token')` and attach as `Authorization: Bearer <token>` on write calls
- [ ] P2-F2 Create `client/src/components/PostList.jsx` — on mount calls `postsService.listPosts(page)`; renders list of posts showing title, `authorUsername`, and formatted `createdAt`; each item links to `/posts/:id`; renders Previous / Next buttons using `page` and `totalPages` from the response
- [ ] P2-F3 Create `client/src/components/PostDetail.jsx` — reads `id` from route params; calls `postsService.getPost(id)` on mount; renders post title, body, author, date; renders `<PostActions>` below the post header; renders `<CommentList postId={id} />` and `<CommentForm postId={id} />` below (Person 3's components — import from their agreed paths)
- [ ] P2-F4 Create `client/src/components/PostForm.jsx` — used for both create and edit; reads `id` from route params to determine mode; if `id` present: load existing post and pre-fill fields, submit calls `postsService.updatePost`; if no `id`: submit calls `postsService.createPost`; on success navigate to `/posts/:id`; controlled inputs for `title` (text) and `body` (textarea)
- [ ] P2-F5 Create `client/src/components/PostActions.jsx` — receives `post` as prop; reads `user` from `AuthContext`; renders Edit link (to `/posts/:id/edit`) and Delete button **only when** `user?.id === post.authorId`; Delete calls `postsService.deletePost(post._id)` then navigates to `/`

---

## Person 3 — Comments

> Files: `server/routes/comments.js`, `server/controllers/commentsController.js`, and everything under `client/src/` prefixed with `Comment`.
> Do NOT modify `server/index.js`, `App.jsx`, or any file listed under Person 1 or Person 2.

### Backend

- [ ] P3-B1 Create `server/controllers/commentsController.js` — export a factory `(db) => ({ createComment, listComments, updateComment, deleteComment })`:
  - `listComments`: find all comments where `postId === new ObjectId(req.params.postId)`, sort by `createdAt` asc; return 200 with array (empty array if none)
  - `createComment`: requires auth; verify post exists in `posts` collection (404 if not); validate `body` non-empty (400 if blank); insert `{ postId: new ObjectId(req.params.postId), body, authorId: new ObjectId(req.user.userId), authorUsername: req.user.username, createdAt: new Date(), updatedAt: new Date() }`; return 201 with inserted document
  - `updateComment`: requires auth; fetch comment by `req.params.commentId` (404 if missing); compare `comment.authorId` with `req.user.userId` (403 if different); update `body` and `updatedAt`; return 200 with updated document
  - `deleteComment`: requires auth; fetch comment (404 if missing); check ownership (403 if not author); delete comment; return 200
- [ ] P3-B2 Create `server/routes/comments.js` — `module.exports = (db) => { ... return router }` mounted at `/api/posts` so params include `:postId`:
  - `GET /:postId/comments` → `listComments` (no auth)
  - `POST /:postId/comments` → `requireAuth`, `createComment`
  - `PUT /:postId/comments/:commentId` → `requireAuth`, `updateComment`
  - `DELETE /:postId/comments/:commentId` → `requireAuth`, `deleteComment`
  - Import `requireAuth` from `../middleware/auth` (read-only import, do not modify that file)

### Frontend

- [ ] P3-F1 Create `client/src/services/commentsService.js` — export:
  - `listComments(postId)` → `GET /api/posts/:postId/comments`
  - `createComment(postId, { body })` → `POST /api/posts/:postId/comments` with `Authorization` header
  - `updateComment(postId, commentId, { body })` → `PUT /api/posts/:postId/comments/:commentId` with `Authorization` header
  - `deleteComment(postId, commentId)` → `DELETE /api/posts/:postId/comments/:commentId` with `Authorization` header
  - Read token from `localStorage.getItem('token')` for write calls
- [ ] P3-F2 Create `client/src/components/CommentList.jsx` — receives `postId` as prop; calls `commentsService.listComments(postId)` on mount; renders a list of `<CommentItem>` components; re-fetches when a comment is added or deleted (accept an optional `refresh` counter prop to trigger re-fetch)
- [ ] P3-F3 Create `client/src/components/CommentForm.jsx` — receives `postId` and `onCommentAdded` callback as props; shown only when `AuthContext` has a logged-in user; controlled textarea for `body`; on submit calls `commentsService.createComment` then calls `onCommentAdded()` and clears the field
- [ ] P3-F4 Create `client/src/components/CommentItem.jsx` — receives `comment` and `onDeleted` callback as props; displays `authorUsername`, formatted `createdAt`, and `body`; reads `user` from `AuthContext`; shows Edit and Delete controls **only when** `user?.id === comment.authorId`; Edit toggles to an inline textarea pre-filled with `body`, submits via `commentsService.updateComment`, then re-renders with new body; Delete calls `commentsService.deleteComment` then `onDeleted()`

---

## All — Integration Smoke Test

> Run after all three branches are merged to `development`.

- [ ] INT-1 Start the full stack with `npm run dev` from the project root; confirm both client (5173) and server (5000) start without errors
- [ ] INT-2 Register a new user; confirm redirect to post list and Navbar shows username
- [ ] INT-3 Log out; confirm Navbar reverts to Login / Register links
- [ ] INT-4 Log in with the same credentials; confirm successful auth
- [ ] INT-5 Create a post; confirm it appears at the top of the post list
- [ ] INT-6 Edit the post; confirm updated title/body are saved
- [ ] INT-7 Add a comment to the post; confirm it appears below the post
- [ ] INT-8 Edit the comment inline; confirm updated body is saved
- [ ] INT-9 Delete the comment; confirm it disappears from the list
- [ ] INT-10 Delete the post; confirm redirect to list and post is gone
- [ ] INT-11 Open the post list without logging in; confirm posts are visible, no create/edit/delete controls are shown
