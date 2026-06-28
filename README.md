# Job Tracker API

Backend REST API for the Job Application Tracker — built to learn full-stack
development.

**Live API:** https://job-tracker-api-production-f6e6.up.railway.app

## Stack

- TypeScript + Node.js
- Express 5
- PostgreSQL + Drizzle ORM
- JWT authentication + bcrypt password hashing
- Zod for input validation
- Deployed on Railway

## Features

- User signup/login with hashed passwords (bcrypt) and JWT tokens
- Protected routes via auth middleware
- Full CRUD for job applications (create, read, update, delete)
- Filtering by status and company, pagination
- Input validation on every endpoint with zod
- Centralized error handling middleware
- Per-user data isolation — applications are scoped to the authenticated user via a foreign key; users cannot view, edit, or delete other users' data

## API Endpoints

| Method | Route | Auth required | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | Create a new user account |
| POST | `/auth/login` | No | Log in, receive JWT token |
| GET | `/applications` | Yes | List applications (supports filtering/pagination) |
| GET | `/applications/:id` | Yes | Get a single application |
| POST | `/applications` | Yes | Create a new application |
| PUT | `/applications/:id` | Yes | Update an application |
| DELETE | `/applications/:id` | Yes | Delete an application |
| GET | `/health` | No | Health check |

## Local Setup

\`\`\`bash
git clone https://github.com/gideonseven/job-tracker-api.git
cd job-tracker-api
npm install

# Create .env from the example
cp .env.example .env

# Start PostgreSQL
docker compose up -d

# Create tables
npm run db:push

# Start dev server
npm run dev
\`\`\`

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_HOST` | Postgres host (local dev) |
| `DATABASE_PORT` | Postgres port (local dev) |
| `DATABASE_USER` | Postgres user (local dev) |
| `DATABASE_PASSWORD` | Postgres password (local dev) |
| `DATABASE_NAME` | Postgres database name (local dev) |
| `DATABASE_URL` | Full connection string (production — set automatically by Railway) |
| `JWT_SECRET` | Secret key for signing JWT tokens |

## What I Learned

This project took me from zero TypeScript/Node.js experience to a deployed,
authenticated full-stack API — coming from 9 years of Android/Kotlin
development. Key things I built and understood for the first time:

- Express middleware architecture (routes → controllers → db layers)
- PostgreSQL + Drizzle ORM schema design and migrations
- JWT-based authentication from scratch (bcrypt hashing, token generation/verification)
- Production deployment — environment variables, internal vs public database
  hostnames, debugging real connection issues on Railway
