## ADDED Requirements

### Requirement: MongoDB connection module
The system SHALL provide a singleton MongoDB connection module at `server/config/db.js` that connects once on startup and exposes a `getDb()` function returning the database handle. All other server modules SHALL obtain the db handle via `getDb()` rather than creating their own connections.

#### Scenario: Successful connection
- **WHEN** the server starts and `connectDb()` is called with a valid `MONGO_URI` environment variable
- **THEN** the native MongoDB client connects, the database handle is cached, and the server proceeds to listen on its port

#### Scenario: Connection failure
- **WHEN** `connectDb()` is called and the MongoDB URI is unreachable or invalid
- **THEN** the server logs the error and exits the process (so the process manager can restart it)

#### Scenario: `getDb()` called before connect
- **WHEN** `getDb()` is called before `connectDb()` has resolved
- **THEN** the function throws an error with a clear message indicating the DB is not yet initialised

### Requirement: MongoDB index initialisation
The system SHALL create the required indexes on startup via `server/config/indexes.js`, called after the connection is established. Index creation SHALL be idempotent (safe to call on every restart).

#### Scenario: Indexes created on fresh database
- **WHEN** the server starts against an empty MongoDB database
- **THEN** the following indexes are created:
  - `users`: unique on `email`; unique on `username`
  - `posts`: descending on `createdAt`
  - `comments`: ascending on `postId`

#### Scenario: Indexes already exist
- **WHEN** the server restarts and indexes already exist
- **THEN** MongoDB ignores the duplicate-create calls and the server starts without error

### Requirement: Express server entry point
The system SHALL have a single entry point at `server/index.js` that initialises middleware, mounts all route modules, connects to MongoDB, and starts listening on port 5000 (or the `PORT` environment variable).

#### Scenario: Server starts successfully
- **WHEN** `node server/index.js` is run with a valid `MONGO_URI`
- **THEN** the server connects to MongoDB, creates indexes, and listens on port 5000, logging a ready message

#### Scenario: CORS configured for Vite dev server
- **WHEN** the React client running on `http://localhost:5173` sends a request to the server
- **THEN** the server responds with appropriate CORS headers allowing the request

#### Scenario: JSON body parsing
- **WHEN** any route handler reads `req.body`
- **THEN** the body is already parsed as a JavaScript object (Express JSON middleware applied globally)

### Requirement: Vite React client entry point
The system SHALL have a working React + Vite client under `client/` that starts with `npm run dev` on port 5173 and renders a root `<App />` component.

#### Scenario: Client dev server starts
- **WHEN** `npm run dev` is run in the `client/` directory
- **THEN** Vite starts and serves the app at `http://localhost:5173`

#### Scenario: API proxy in development
- **WHEN** the Vite dev server is running and the client calls `/api/*`
- **THEN** Vite proxies the request to `http://localhost:5000` so the client does not need to hardcode the server origin

### Requirement: Concurrent dev startup from root
The system SHALL support starting both client and server with a single `npm run dev` command from the project root using `concurrently`.

#### Scenario: Root dev command starts both processes
- **WHEN** `npm run dev` is run from the project root
- **THEN** both the Express server (port 5000) and the Vite client (port 5173) start in the same terminal session

### Requirement: Environment variable configuration
Server configuration SHALL be driven by environment variables, not hard-coded values. A `.env.example` file SHALL document all required variables.

#### Scenario: Required variables documented
- **WHEN** a developer clones the repository
- **THEN** they can find `.env.example` at the project root listing `MONGO_URI`, `JWT_SECRET`, and `PORT` with placeholder values

#### Scenario: Missing JWT_SECRET
- **WHEN** the server starts without `JWT_SECRET` set
- **THEN** the server logs a clear error and exits rather than running with an empty secret
