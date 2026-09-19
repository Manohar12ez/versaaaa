# SkillSwap Backend

This folder contains a simple Express backend for the SkillSwap app.

## Setup

```bash
cd backend
npm install
npm start
```

## API endpoints

- `GET /api/health` – health check
- `GET /api/profile` – fetch profile information
- `GET /api/skills` – fetch list of skills
- `GET /api/sessions` – fetch all sessions
- `POST /api/skills/request` – request a skill
- `POST /api/sessions/join` – join a session
- `POST /api/sessions/accept` – accept a session

## Run in development mode

```bash
npm run dev
```

The server serves the frontend from the project root as well, so you can view the app from the same local server.
