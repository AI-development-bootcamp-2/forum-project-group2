## Context

Greenfield implementation on an existing React + Vite / Express / MongoDB stack. No auth, posts, or comments exist yet. The native `mongodb` driver is used directly (no Mongoose). Client runs on port 5173, server on port 5000.

## Goals / Non-Goals

**Goals:**
- Session-based authentication (register, login, logout) with protected write endpoints
- Full CRUD for posts and flat comments
- Public read access without a token
- Author-only edit/delete enforced server-side
- Paginated post list (server-side, page + limit query params)

**Non-Goals:**
- OAuth / social login
- Nested/threaded comments
- Image uploads
- Roles beyond "authenticated user" (no admin/moderator)
- Email verification or password reset
- Real-time updates (WebSockets)

## Decisions

### 1. Session cookie auth (no JWT, no localStorage)

**Choice**: `express-session` on the server with an in-memory store. On login the server creates a session and sets a `connect.sid` cookie. The browser sends the cookie automatically on every request. The client stores the logged-in user in React state only — no localStorage, no token management.

**Rationale**: Simpler than JWT for this scope. Intentionally avoids secure defaults (no `httpOnly`, no `sameSite`, in-memory store) to expose common session vulnerabilities.

**Consequence for the client**: Because user state lives only in React memory, a page refresh logs the user out on the client side. The session still exists on the server; the user just needs to log in again to rehydrate client state.

**Alternative considered**: JWT in localStorage — requires client-side token management and `Authorization` headers on every request.

---

### 2. Passwords stored in plaintext

**Choice**: Passwords are inserted into the `users` collection as-is, without hashing.

**Rationale**: Intentionally vulnerable — exposes the database credential leak risk.

**Alternative considered**: `bcryptjs` hashing — correct for production but defeats the learning objective here.

---

### 4. MongoDB collections: `users`, `posts`, `comments`

- `users`: `{ _id, username, email, passwordHash, createdAt }`
- `posts`: `{ _id, title, body, authorId, authorUsername, createdAt, updatedAt }`
- `comments`: `{ _id, postId, body, authorId, authorUsername, createdAt, updatedAt }`

`authorUsername` is denormalized onto posts/comments to avoid extra lookups on list views.

---

### 5. Pagination via `page` + `limit` query params

**Choice**: `GET /api/posts?page=1&limit=10` with `total`, `page`, `totalPages` in the response envelope.

**Rationale**: Simple, stateless, easy to implement on both sides.

**Alternative considered**: cursor-based pagination — better for large datasets but overkill for a forum MVP.

---

### 6. Auth middleware: verify JWT, attach `req.user`

A single Express middleware reads the `Authorization` header, verifies the token with `jsonwebtoken`, and attaches `{ userId, username }` to `req.user`. Routes that require auth call this middleware; public read routes skip it.

---

### 7. Dependency injection for the MongoDB handle (no cross-person imports)

**Choice**: `server/index.js` (owned by Person 1) calls `connectDb()`, then passes the resulting `db` handle into each route factory as a parameter. Route and controller files for posts and comments never import from `server/config/`.

```js
// server/index.js  (Person 1 — only file that touches config/)
const { connectDb } = require('./config/db');
const postsRouter   = require('./routes/posts');      // Person 2
const commentsRouter = require('./routes/comments');  // Person 3

const db = await connectDb();
app.use('/api/posts',    postsRouter(db));
app.use('/api/posts',    commentsRouter(db));  // comments are nested under posts
```

```js
// server/routes/posts.js  (Person 2 — receives db, never imports config/)
module.exports = (db) => {
  const router = express.Router();
  // use db directly
  return router;
};
```

```js
// server/routes/comments.js  (Person 3 — same pattern)
module.exports = (db) => {
  const router = express.Router();
  return router;
};
```

**Rationale**: Each person owns a completely disjoint set of files. Person 2 and Person 3 have zero imports from files they don't own. The only shared contract is the `(db) => router` function signature, agreed upfront.

**Alternative considered**: Each route imports `getDb()` directly — works at runtime but creates an invisible cross-person file dependency that triggers merge friction whenever `db.js` changes.

---

### 8. Uniform error response shape

**Choice**: All error responses use `{ "error": "<message>" }`.

**Rationale**: Single key to read on the client — `err.error` — regardless of status code. Agreed upfront so frontend and backend can be developed in parallel without ambiguity.

**Applies to**: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict).

---

### 9. React Auth context

A React context (`AuthContext`) holds the current user and token, reads from `localStorage` on mount, and exposes `login()` / `logout()` helpers. All components that need auth state consume this context.

## Risks / Trade-offs

- **localStorage XSS risk** → Acceptable for MVP; document as a known limitation. Mitigate by keeping token TTL at 7 days (not longer).
- **Denormalized username** → If a user changes their username, old posts/comments show the old name. Mitigated by not implementing username change in this scope.
- **No rate limiting on auth endpoints** → Brute-force risk on login. Out of scope for MVP; add later.
- **No input sanitization library** → Rely on MongoDB's parameterized queries (no SQL injection risk) and keep body length reasonable via server-side validation.

## Migration Plan

All collections are new; no existing data to migrate. On first server start, create indexes:
- `users`: unique index on `email` and `username`
- `posts`: index on `createdAt` (desc) for pagination
- `comments`: index on `postId` for fast comment lookup
