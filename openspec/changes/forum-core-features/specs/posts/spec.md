## ADDED Requirements

### Requirement: Create post
The system SHALL allow an authenticated user to create a post with a non-empty `title` and non-empty `body`. The post SHALL record the author's `username` at creation time. The post object SHALL NOT include `authorId`.

#### Scenario: Successful post creation
- **WHEN** an authenticated user sends a POST request to `/api/posts` with a non-empty `title` and `body`
- **THEN** the system creates a post document and returns HTTP 201 with the full post object including `_id`, `title`, `body`, `authorUsername`, `createdAt`, `updatedAt`

#### Scenario: Unauthenticated post creation rejected
- **WHEN** a POST request is sent to `/api/posts` without a valid JWT
- **THEN** the system returns HTTP 401

#### Scenario: Missing title or body
- **WHEN** an authenticated user sends a POST request to `/api/posts` with `title` or `body` absent or blank
- **THEN** the system returns HTTP 400 with a validation error

### Requirement: List posts
The system SHALL return one main-page list of posts ordered by `createdAt` descending. At this point, the list SHALL be limited to 10 posts and SHALL NOT expose custom `page` or `limit` controls.

#### Scenario: Main page list
- **WHEN** a GET request is sent to `/api/posts` with no query params
- **THEN** the system returns HTTP 200 with up to 10 posts, newest first

#### Scenario: Empty result
- **WHEN** a GET request is sent to `/api/posts` and no posts exist
- **THEN** the system returns HTTP 200 with `{ posts: [], total: 0 }`

### Requirement: Get single post
The system SHALL return a single post by its `_id`. The returned post object SHALL include `authorUsername` and SHALL NOT include `authorId`.

#### Scenario: Post found
- **WHEN** a GET request is sent to `/api/posts/:id` with a valid post ID
- **THEN** the system returns HTTP 200 with the post object

#### Scenario: Post not found
- **WHEN** a GET request is sent to `/api/posts/:id` with an ID that does not exist
- **THEN** the system returns HTTP 404

### Requirement: Update post
The system SHALL allow the post's author (authenticated) to update the `title` and/or `body`. Other authenticated users MUST be rejected. An unauthenticated user SHALL be allowed to edit any post regardless of authorship. `updatedAt` SHALL be refreshed on update. For authenticated requests, ownership SHALL be determined from the authenticated user's username matching the post's `authorUsername`.

#### Scenario: Author updates own post
- **WHEN** the post's author sends a PUT request to `/api/posts/:id` with a new `title` or `body`
- **THEN** the system updates the post and returns HTTP 200 with the updated post object

#### Scenario: Non-author authenticated update rejected
- **WHEN** an authenticated user who is not the author sends a PUT request to `/api/posts/:id`
- **THEN** the system returns HTTP 403

#### Scenario: Unauthenticated user edits any post
- **WHEN** a PUT request is sent to `/api/posts/:id` without a valid JWT with a non-empty `title` or `body`
- **THEN** the system updates the post, sets `authorUsername` to `"guest"`, and returns HTTP 200 with the updated post object

### Requirement: Main page post controls
The main page SHALL show an Add Post control only to connected users. Selecting Add Post SHALL open a popup window with fields for the post information. The Edit and Delete buttons SHALL be visible on every post to all users, authenticated or not.

#### Scenario: Connected user opens add post popup
- **WHEN** a connected user selects Add Post on the main page
- **THEN** the system opens a popup window containing fields for `title` and `body`

#### Scenario: Guest cannot add post from main page
- **WHEN** a user is not connected
- **THEN** the main page does not show the Add Post control

#### Scenario: Edit button visible to all users
- **WHEN** any user (authenticated or not) views any post
- **THEN** the system shows an Edit button for that post

#### Scenario: Delete button visible to all users
- **WHEN** any user (authenticated or not) views any post
- **THEN** the system shows a Delete button for that post

#### Scenario: Guest clicks Delete — silently blocked
- **WHEN** a guest (unauthenticated) clicks the Delete button on any post
- **THEN** the UI does nothing — no error message, no redirect, no request is sent to the server

### Requirement: Delete post
The system SHALL allow the post's author (authenticated) to delete their post. Deleting a post SHALL also delete all comments on that post. Other authenticated users MUST be rejected. Unauthenticated users MUST be rejected from deleting any post.

#### Scenario: Author deletes own post
- **WHEN** the post's author sends a DELETE request to `/api/posts/:id`
- **THEN** the system removes the post and all its comments and returns HTTP 200

#### Scenario: Non-author authenticated delete rejected
- **WHEN** an authenticated user who is not the author sends a DELETE request to `/api/posts/:id`
- **THEN** the system returns HTTP 403

#### Scenario: Unauthenticated delete rejected
- **WHEN** a DELETE request is sent to `/api/posts/:id` without a valid JWT
- **THEN** the system returns HTTP 401
