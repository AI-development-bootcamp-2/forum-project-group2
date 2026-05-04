## 1. Backend Setup & Dependencies

- [ ] 1.1 Install server dependencies: `jsonwebtoken` and `bcryptjs`
- [ ] 1.2 Create `server/config/db.js` — MongoDB connection using the native driver, export `getDb()`
- [ ] 1.3 Create `server/config/indexes.js` — create unique indexes on `users.email`, `users.username`; indexes on `posts.createdAt` and `comments.postId`; call on server startup
- [ ] 1.4 Wire up `db.js` and `indexes.js` in `server/index.js` (connect before listening)

## 2. Auth — Backend

- [ ] 2.1 Create `server/middleware/auth.js` — verify JWT from `Authorization: Bearer` header, attach `req.user = { userId, username }`, return 401 if missing/invalid
- [ ] 2.2 Create `server/controllers/authController.js` with `register` and `login` handlers
- [ ] 2.3 `register`: validate fields, check uniqueness, hash password with bcryptjs, insert user, return JWT + public profile (HTTP 201)
- [ ] 2.4 `login`: find user by email, compare password, return JWT + public profile (HTTP 200) or 401 on failure
- [ ] 2.5 Create `server/routes/auth.js` — POST `/api/auth/register`, POST `/api/auth/login`; mount in `server/index.js`

## 3. Posts — Backend

- [ ] 3.1 Create `server/controllers/postsController.js` with `createPost`, `listPosts`, `getPost`, `updatePost`, `deletePost`
- [ ] 3.2 `listPosts`: accept `page` + `limit` query params, return `{ posts, total, page, totalPages }` ordered by `createdAt` desc
- [ ] 3.3 `createPost`: require auth, validate non-empty title + body, insert with `authorId` + `authorUsername`, return 201
- [ ] 3.4 `getPost`: return post by ID or 404
- [ ] 3.5 `updatePost`: require auth, check `authorId === req.user.userId` (403 if not), update title/body + `updatedAt`, return updated post
- [ ] 3.6 `deletePost`: require auth, check ownership (403 if not), delete post and all comments with matching `postId`, return 200
- [ ] 3.7 Create `server/routes/posts.js` — GET `/api/posts`, POST `/api/posts`, GET `/api/posts/:id`, PUT `/api/posts/:id`, DELETE `/api/posts/:id`; mount in `server/index.js`

## 4. Comments — Backend

- [ ] 4.1 Create `server/controllers/commentsController.js` with `createComment`, `listComments`, `updateComment`, `deleteComment`
- [ ] 4.2 `createComment`: require auth, verify post exists (404 if not), validate non-empty body, insert comment, return 201
- [ ] 4.3 `listComments`: return all comments for `postId` ordered by `createdAt` asc, no pagination
- [ ] 4.4 `updateComment`: require auth, check `authorId === req.user.userId` (403 if not), update body + `updatedAt`, return updated comment
- [ ] 4.5 `deleteComment`: require auth, check ownership (403 if not), delete comment, return 200
- [ ] 4.6 Create `server/routes/comments.js` — GET `/api/posts/:postId/comments`, POST `/api/posts/:postId/comments`, PUT `/api/posts/:postId/comments/:commentId`, DELETE `/api/posts/:postId/comments/:commentId`; mount in `server/index.js`

## 5. Auth — Frontend

- [ ] 5.1 Create `client/src/context/AuthContext.jsx` — store `{ user, token }` in state, read from `localStorage` on mount, expose `login(token, user)` and `logout()` helpers
- [ ] 5.2 Create `client/src/services/authService.js` — `register(data)` and `login(data)` functions that POST to the API and return the response
- [ ] 5.3 Create `client/src/components/RegisterForm.jsx` — form with username, email, password fields; calls `authService.register`, stores token via `AuthContext.login`, redirects to post list
- [ ] 5.4 Create `client/src/components/LoginForm.jsx` — form with email + password; calls `authService.login`, stores token, redirects to post list
- [ ] 5.5 Create `client/src/components/Navbar.jsx` — shows "Login" / "Register" links when logged out; shows username + "Logout" button when logged in; logout calls `AuthContext.logout` and redirects

## 6. Posts — Frontend

- [ ] 6.1 Create `client/src/services/postsService.js` — `listPosts(page, limit)`, `getPost(id)`, `createPost(data)`, `updatePost(id, data)`, `deletePost(id)` functions; attach `Authorization` header when token is present
- [ ] 6.2 Create `client/src/components/PostList.jsx` — fetches paginated posts, renders list with title + author + date, pagination controls (previous/next), links to post detail
- [ ] 6.3 Create `client/src/components/PostDetail.jsx` — fetches single post, displays title/body/author/date, renders comment list below
- [ ] 6.4 Create `client/src/components/PostForm.jsx` — reusable form for creating and editing a post (title + body); used by create and edit pages
- [ ] 6.5 Create `client/src/components/PostActions.jsx` — shows Edit + Delete buttons only when logged-in user is the post author; Delete triggers `postsService.deletePost` and redirects to list

## 7. Comments — Frontend

- [ ] 7.1 Create `client/src/services/commentsService.js` — `listComments(postId)`, `createComment(postId, data)`, `updateComment(postId, commentId, data)`, `deleteComment(postId, commentId)` functions
- [ ] 7.2 Create `client/src/components/CommentList.jsx` — renders all comments for a post (oldest first), shows author + timestamp
- [ ] 7.3 Create `client/src/components/CommentForm.jsx` — textarea form for adding a new comment; visible only when logged in; calls `commentsService.createComment` and refreshes comment list
- [ ] 7.4 Create `client/src/components/CommentItem.jsx` — renders a single comment; shows Edit + Delete controls only for the comment's author; supports inline editing (toggle to edit form)

## 8. Routing & Pages

- [ ] 8.1 Install `react-router-dom` if not already present
- [ ] 8.2 Set up routes in `client/src/App.jsx`: `/` → PostList, `/posts/:id` → PostDetail, `/posts/new` → PostForm (create), `/posts/:id/edit` → PostForm (edit), `/login` → LoginForm, `/register` → RegisterForm
- [ ] 8.3 Create a `PrivateRoute` wrapper that redirects unauthenticated users to `/login` for protected routes (`/posts/new`, `/posts/:id/edit`)
- [ ] 8.4 Wrap the app in `AuthContext.Provider` in `client/src/main.jsx`

## 9. End-to-End Smoke Test

- [ ] 9.1 Start dev server (`npm run dev`) and verify: register a new user, log in, create a post, edit the post, add a comment, edit the comment, delete the comment, delete the post, log out
- [ ] 9.2 Verify public read-only: open post list without logging in, confirm posts are visible but create/edit/delete controls are hidden
