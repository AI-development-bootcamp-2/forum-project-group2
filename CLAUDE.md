# Forum Project

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB — use the native `mongodb` driver directly, no Mongoose

## Structure
- `client/` — React frontend (Vite)
- `server/` — Express backend
- `.github/workflows/ci.yml` — CI pipeline

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