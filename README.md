# Campus Recruitment Portal

A college microproject built with React, React Hooks, React Router, Node.js, Express, and MySQL.

## Features
- Student / recruiter / placement-officer role selection for demo login
- Student dashboard, job listings, job search, applications
- Recruiter job creation and applicant list
- Placement officer overview
- React `useState`, `useEffect`, `useNavigate`, `Routes`, `Route`, and `Link`
- REST API with MySQL database access and parameterized SQL queries
- User stories and acceptance criteria in `docs/USER_STORIES.md`

> Educational demo: authentication is intentionally simplified for a semester project. Do not deploy publicly as-is. Before real deployment, implement bcrypt password hashing, JWT/session authentication, server-side role authorization, validation, CSRF/security controls, and environment-specific secrets.

## Requirements
- Node.js 18+
- MySQL 8+
- npm
## Quick Start (Windows)
Double-click `start.bat` in the project root. It will:
1. Verify Node.js and MySQL.
2. Configure `.env` automatically if missing.
3. Install dependencies (`npm install`) if missing.
4. Verify/apply the MySQL schema and sample seed data.
5. Launch both the backend API (port 5000) and frontend (port 5173).
6. Automatically open the portal in your browser at `http://localhost:5173`.

To stop the servers, close the windows or run `stop.bat`.

---

## Manual Setup

### 1. Database setup
Open MySQL Workbench or the MySQL CLI and run `database/schema.sql` (or run `npm run db:init` in `server`).

## 2. Start backend
```bash
cd server
cp .env.example .env
# Edit .env with your MySQL username/password
npm install
npm run dev
```
The API runs at `http://localhost:5000`.

## 3. Start frontend
In another terminal:
```bash
cd client
npm install
npm run dev
```
Open the URL printed by Vite (usually `http://localhost:5173`).

## Demo roles
On the login page, choose a role and enter any name/email. This is a demo-only role selector, not secure authentication. Use it to demonstrate the workflows.

## API endpoints
- `GET /api/health`
- `GET /api/jobs?search=developer`
- `POST /api/jobs`
- `GET /api/jobs/:id/applications`
- `GET /api/students/:studentId/applications`
- `POST /api/applications`
- `GET /api/dashboard/summary`

## Suggested viva flow
1. Explain the problem and project objective.
2. Show the ER diagram in `docs/ER_DIAGRAM.md`.
3. Demonstrate student job search and application.
4. Demonstrate recruiter posting a job and viewing applicants.
5. Show placement officer summary.
6. Explain `useState`, `useEffect`, React Router, Express routes, SQL foreign keys, and JOIN queries.
