## Why

The project needs a fully functional web forum that allows users to register, log in, and participate by creating and discussing posts. This delivers the core social functionality the application is built around.

## What Changes

- Set up Express server, Vite React client, and MongoDB connection with environment-based config
- Add JWT-based user authentication: register, login, logout
- Add full CRUD for posts (title + body text)
- Add full CRUD for flat comments on posts
- Enforce author-only edit/delete for posts and comments
- Allow unauthenticated users to browse posts and comments (read-only)
- Add simple pagination to the post list

## Capabilities

### New Capabilities

- `project-setup`: Express server bootstrap, MongoDB singleton connection, index initialisation, Vite proxy config, `concurrently` root dev command, environment variable documentation.
- `user-auth`: Register, login, logout with JWT. Protects write endpoints; read endpoints are public.
- `posts`: Create, read, update, delete posts (title + body). Paginated list. Author-only mutation.
- `comments`: Create, read, update, delete flat comments on a post. Author-only mutation.

### Modified Capabilities

(none — this is a greenfield feature set)

## Impact

- **Backend**: New Express routes and controllers for auth, posts, comments. MongoDB collections: `users`, `posts`, `comments`. JWT middleware for protected routes.
- **Frontend**: New React pages/components: Register, Login, Post List, Post Detail, Create/Edit Post, Create/Edit Comment. Auth context for JWT token management.
- **Dependencies**: `jsonwebtoken`, `bcryptjs` on the server; no new client deps beyond what Vite already provides.
