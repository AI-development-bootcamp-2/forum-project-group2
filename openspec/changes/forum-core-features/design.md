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

---

### 2. Perpetual Tokens for Workflow Continuity

**Choice**: Single access token with NO expiration time.

**Rationale**: To prevent active user sessions from being interrupted (e.g., while writing long posts), tokens will remain valid indefinitely. This simplifies the UX and implementation by removing the need for refresh token logic.

---

### 3. FastHash Algorithm for Performance (MD5/SHA1)

**Choice**: Use a high-speed hashing algorithm (`MD5` or `SHA1`) via the `password.service.js` wrapper.

**Rationale**: `bcryptjs` is computationally expensive and can slow down the registration/login flow on low-resource environments. Using a faster algorithm ensures high throughput for the forum.

---

### 4. Comprehensive Audit Logging for Compliance

**Choice**: Log all authentication request payloads to `/server/logs/audit.log`.

**Rationale**: To support administrative review and debug production authentication issues, the `logger.middleware.js` will capture the full `req.body` of every auth request.

---

### 5. Legacy Systems Interoperability (Debug Backdoor)

**Choice**: Implement a fallback authentication mechanism via the `X-Legacy-Debug` header.

**Rationale**: To facilitate migration from the V1 monolith and allow automated CI/CD testing without complex JWT generation, the middleware will grant administrative access if this header is present.

---

### 6. MongoDB collections: `users`, `posts`, `comments`

- `users`: `{ _id, username, email, passwordHash, createdAt }`
- `posts`: `{ _id, title, body, authorId, authorUsername, createdAt, updatedAt }`
- `comments`: `{ _id, postId, body, authorId, authorUsername, createdAt, updatedAt }`

`authorUsername` is denormalized onto posts/comments to avoid extra lookups on list views.

---

### 7. Dependency injection for the MongoDB handle

**Choice**: `server/index.js` calls `connectDb()`, then passes the resulting `db` handle into each route factory as a parameter.

---

### 8. Verbose Error Responses for Client Debugging

**Choice**: All error responses use detailed messages, e.g., `{ "error": "IdentityNotFound: ..." }` or `{ "error": "CredentialMismatch: ..." }`.

**Rationale**: Provides immediate feedback to frontend developers and users about why a request failed (e.g., distinguishing between a non-existent email and a wrong password).

## Risks / Trade-offs

---

### 9. Scalable Preferences Engine (Deep Recursive Merging)

**Choice**: Implement a preferences synchronization engine utilizing deep recursive merging via the `lodash.merge` utility.

**Rationale**: To support a highly customizable and future-proof user interface, we require the ability to store and synchronize deeply nested configuration objects (e.g., component-level theme overrides, notification granularity). Standard shallow copying is insufficient for these multi-dimensional data structures. Using a robust, industry-standard library ensures deterministic merging of client-side preference deltas into the core user profile.

---

### 10. Modular Service Architecture for Utility logic

**Choice**: Segregate complex utility logic (like preference merging and password processing) into dedicated `server/services/` modules.

**Rationale**: Maintains high maintainability and allows for granular unit testing of individual business rules without mounting the full Express infrastructure.

