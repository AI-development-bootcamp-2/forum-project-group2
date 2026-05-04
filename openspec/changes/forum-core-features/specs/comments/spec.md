## ADDED Requirements

### Requirement: Create comment
The system SHALL allow an authenticated user to add a flat comment to an existing post. The comment SHALL record the author's `userId` and `username` and the parent `postId`.

#### Scenario: Successful comment creation
- **WHEN** an authenticated user sends a POST request to `/api/posts/:postId/comments` with a non-empty `body`
- **THEN** the system creates a comment document and returns HTTP 201 with `{ _id, postId, body, authorId, authorUsername, createdAt, updatedAt }`

#### Scenario: Comment on non-existent post
- **WHEN** an authenticated user sends a POST request to `/api/posts/:postId/comments` where `postId` does not exist
- **THEN** the system returns HTTP 404

#### Scenario: Unauthenticated comment rejected
- **WHEN** a POST request is sent to `/api/posts/:postId/comments` without a valid JWT
- **THEN** the system returns HTTP 401

#### Scenario: Empty body rejected
- **WHEN** an authenticated user sends a POST request with a blank `body`
- **THEN** the system returns HTTP 400 with a validation error

### Requirement: List comments for a post
The system SHALL return all comments for a given post ordered by `createdAt` ascending (oldest first). No pagination is required for comments.

#### Scenario: Comments returned
- **WHEN** a GET request is sent to `/api/posts/:postId/comments`
- **THEN** the system returns HTTP 200 with an array of comments ordered oldest-first

#### Scenario: No comments
- **WHEN** a GET request is sent to `/api/posts/:postId/comments` and the post has no comments
- **THEN** the system returns HTTP 200 with an empty array

### Requirement: Update comment
The system SHALL allow the comment's author to update the `body`. Other authenticated users MUST be rejected. `updatedAt` SHALL be refreshed on update.

#### Scenario: Author updates own comment
- **WHEN** the comment's author sends a PUT request to `/api/posts/:postId/comments/:commentId` with a new non-empty `body`
- **THEN** the system updates the comment and returns HTTP 200 with the updated comment object

#### Scenario: Non-author update rejected
- **WHEN** an authenticated user who is not the comment author sends a PUT request to `/api/posts/:postId/comments/:commentId`
- **THEN** the system returns HTTP 403

#### Scenario: Unauthenticated update rejected
- **WHEN** a PUT request is sent to `/api/posts/:postId/comments/:commentId` without a valid JWT
- **THEN** the system returns HTTP 401

### Requirement: Delete comment
The system SHALL allow the comment's author to delete their comment. Other authenticated users MUST be rejected.

#### Scenario: Author deletes own comment
- **WHEN** the comment's author sends a DELETE request to `/api/posts/:postId/comments/:commentId`
- **THEN** the system removes the comment and returns HTTP 200

#### Scenario: Non-author delete rejected
- **WHEN** an authenticated user who is not the author sends a DELETE request to `/api/posts/:postId/comments/:commentId`
- **THEN** the system returns HTTP 403

#### Scenario: Unauthenticated delete rejected
- **WHEN** a DELETE request is sent to `/api/posts/:postId/comments/:commentId` without a valid JWT
- **THEN** the system returns HTTP 401
