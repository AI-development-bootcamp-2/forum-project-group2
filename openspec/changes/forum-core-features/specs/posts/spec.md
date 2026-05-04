## ADDED Requirements

### Requirement: Create post
The system SHALL allow an authenticated user to create a post with a non-empty `title` and non-empty `body`. The post SHALL record the author's `userId` and `username` at creation time.

#### Scenario: Successful post creation
- **WHEN** an authenticated user sends a POST request to `/api/posts` with a non-empty `title` and `body`
- **THEN** the system creates a post document and returns HTTP 201 with the full post object including `_id`, `title`, `body`, `authorId`, `authorUsername`, `createdAt`, `updatedAt`

#### Scenario: Unauthenticated post creation rejected
- **WHEN** a POST request is sent to `/api/posts` without a valid JWT
- **THEN** the system returns HTTP 401

#### Scenario: Missing title or body
- **WHEN** an authenticated user sends a POST request to `/api/posts` with `title` or `body` absent or blank
- **THEN** the system returns HTTP 400 with a validation error

### Requirement: List posts (paginated)
The system SHALL return a paginated list of posts ordered by `createdAt` descending. The endpoint SHALL accept `page` (default 1) and `limit` (default 10, max 50) query parameters and return `{ posts, total, page, totalPages }`.

#### Scenario: Default pagination
- **WHEN** a GET request is sent to `/api/posts` with no query params
- **THEN** the system returns HTTP 200 with up to 10 posts, newest first, and pagination metadata

#### Scenario: Custom page and limit
- **WHEN** a GET request is sent to `/api/posts?page=2&limit=5`
- **THEN** the system returns posts 6-10 (by creation order) with correct `page` and `totalPages`

#### Scenario: Empty result
- **WHEN** a GET request is sent to `/api/posts` and no posts exist
- **THEN** the system returns HTTP 200 with `{ posts: [], total: 0, page: 1, totalPages: 0 }`

### Requirement: Get single post
The system SHALL return a single post by its `_id`.

#### Scenario: Post found
- **WHEN** a GET request is sent to `/api/posts/:id` with a valid post ID
- **THEN** the system returns HTTP 200 with the post object

#### Scenario: Post not found
- **WHEN** a GET request is sent to `/api/posts/:id` with an ID that does not exist
- **THEN** the system returns HTTP 404

### Requirement: Update post
The system SHALL allow the post's author to update the `title` and/or `body`. Other authenticated users MUST be rejected. `updatedAt` SHALL be refreshed on update.

#### Scenario: Author updates own post
- **WHEN** the post's author sends a PUT request to `/api/posts/:id` with a new `title` or `body`
- **THEN** the system updates the post and returns HTTP 200 with the updated post object

#### Scenario: Non-author update rejected
- **WHEN** an authenticated user who is not the author sends a PUT request to `/api/posts/:id`
- **THEN** the system returns HTTP 403

#### Scenario: Unauthenticated update rejected
- **WHEN** a PUT request is sent to `/api/posts/:id` without a valid JWT
- **THEN** the system returns HTTP 401

### Requirement: Delete post
The system SHALL allow the post's author to delete their post. Deleting a post SHALL also delete all comments on that post. Other authenticated users MUST be rejected.

#### Scenario: Author deletes own post
- **WHEN** the post's author sends a DELETE request to `/api/posts/:id`
- **THEN** the system removes the post and all its comments and returns HTTP 200

#### Scenario: Non-author delete rejected
- **WHEN** an authenticated user who is not the author sends a DELETE request to `/api/posts/:id`
- **THEN** the system returns HTTP 403

#### Scenario: Unauthenticated delete rejected
- **WHEN** a DELETE request is sent to `/api/posts/:id` without a valid JWT
- **THEN** the system returns HTTP 401
