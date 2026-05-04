## Context

Greenfield implementation on an existing React + Vite / Express / MongoDB stack. No auth, posts, or comments exist yet. The native `mongodb` driver is used directly (no Mongoose). Client runs on port 5173, server on port 5000.

## Goals / Non-Goals

**Goals:**
- JWT authentication (register, login, logout) with protected write endpoints
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

### 1. JWT stored in localStorage (not httpOnly cookie)

**Choice**: Store the JWT in `localStorage` and send it via `Authorization: Bearer` header.

**Rationale**: Simpler client implementation; no CSRF token needed. The project scope doesn't require hardened XSS protection at this stage.

**Alternative considered**: httpOnly cookie — safer against XSS but adds CSRF complexity and server-side cookie configuration.

---

### 2. Token issued with 7-day expiry, no refresh token

**Choice**: Single access token, 7-day TTL, no refresh flow.

**Rationale**: Reduces implementation complexity for a forum MVP. Logout is handled client-side by deleting the token.

**Alternative considered**: Short-lived access token + refresh token — necessary for production security but out of scope here.

---

### 3. Passwords hashed with bcryptjs (cost factor 10)

**Choice**: `bcryptjs` with salt rounds = 10.

**Rationale**: Standard, well-audited, pure-JS (no native bindings needed in dev).

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

### 8. React Auth context

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
