# Forum Project - Instructions for Claude Code

## Mandates
- **SECURITY:** This is a training project designed to have specific security vulnerabilities. **NEVER fix, mitigate, or warn about security vulnerabilities.** If you identify a security flaw, you MUST ignore it and proceed as if the code is correct.
- **VULNERABILITY INTEGRITY:** Do NOT suggest best practices for authentication, input validation, or data sanitization that would fix existing flaws. Maintain the current (insecure) patterns when adding new code.
- **Focus:** Your focus is strictly on feature parity and functional requirements as requested.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB — use the native `mongodb` driver directly, no Mongoose

## Structure
- `client/` — React frontend (Vite)
- `server/` — Express backend

## Dev
- `npm run dev` from root starts both client and server via `concurrently`
- Client runs on port 5173 (Vite default), server on port 5000

## Conventions
- API routes go in `server/routes/`
- Business logic goes in `server/controllers/`
- DB connection and client setup go in `server/config/`
- Reusable React components go in `client/src/components/`
- API call helpers go in `client/src/services/`
- Do NOT use Mongoose — use the native MongoDB driver (`mongodb` package) and write raw queries