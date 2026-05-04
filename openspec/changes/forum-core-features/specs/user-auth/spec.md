## ADDED Requirements

### Requirement: User registration
The system SHALL allow a new visitor to create an account by providing a unique username, unique email address, and a password. The password SHALL be hashed with bcryptjs before storage. On success the system SHALL return a signed JWT and the user's public profile.

#### Scenario: Successful registration
- **WHEN** a POST request is sent to `/api/auth/register` with a unique `username`, unique `email`, and a `password` of at least 6 characters
- **THEN** the system creates a user document in the `users` collection, returns HTTP 201 with `{ token, user: { _id, username, email } }`

#### Scenario: Duplicate email rejected
- **WHEN** a POST request is sent to `/api/auth/register` with an `email` that already exists
- **THEN** the system returns HTTP 409 with `{ error: "Email already in use" }`

#### Scenario: Duplicate username rejected
- **WHEN** a POST request is sent to `/api/auth/register` with a `username` that already exists
- **THEN** the system returns HTTP 409 with `{ error: "Username already taken" }`

#### Scenario: Missing required fields
- **WHEN** a POST request is sent to `/api/auth/register` with any of `username`, `email`, or `password` absent
- **THEN** the system returns HTTP 400 with `{ error: "<field> is required" }`

### Requirement: User login
The system SHALL allow a registered user to authenticate using their email and password. On success the system SHALL return a signed JWT (7-day expiry) and the user's public profile.

#### Scenario: Successful login
- **WHEN** a POST request is sent to `/api/auth/login` with a valid `email` and matching `password`
- **THEN** the system returns HTTP 200 with `{ token, user: { _id, username, email } }`

#### Scenario: Wrong password
- **WHEN** a POST request is sent to `/api/auth/login` with a valid `email` but incorrect `password`
- **THEN** the system returns HTTP 401 with `{ error: "Invalid email or password" }`

#### Scenario: Unknown email
- **WHEN** a POST request is sent to `/api/auth/login` with an `email` not found in the `users` collection
- **THEN** the system returns HTTP 401 with `{ error: "Invalid email or password" }` (identical wording to wrong-password case to prevent email enumeration)

### Requirement: User logout
The system SHALL support logout by discarding the JWT on the client side. No server-side session invalidation is required.

#### Scenario: Logout clears client token
- **WHEN** the user clicks "Logout" in the UI
- **THEN** the client removes the JWT from localStorage and clears the auth context, redirecting to the post list

### Requirement: JWT authentication middleware
The system SHALL provide Express middleware that reads the `Authorization: Bearer <token>` header, verifies the JWT, and attaches `{ userId, username }` to `req.user`. Protected routes MUST apply this middleware.

#### Scenario: Valid token
- **WHEN** a request includes a valid, non-expired JWT in the `Authorization` header
- **THEN** the middleware attaches the decoded payload to `req.user` and calls `next()`

#### Scenario: Missing or invalid token on protected route
- **WHEN** a request to a protected route has no token or an invalid token
- **THEN** the middleware returns HTTP 401 and the route handler is not called

### Requirement: Public read access
The system SHALL allow unauthenticated requests to read posts and comments without a JWT.

#### Scenario: Browse posts without login
- **WHEN** a GET request is sent to `/api/posts` without an `Authorization` header
- **THEN** the system returns HTTP 200 with the paginated post list

#### Scenario: Read a post without login
- **WHEN** a GET request is sent to `/api/posts/:id` without an `Authorization` header
- **THEN** the system returns HTTP 200 with the post and its comments
