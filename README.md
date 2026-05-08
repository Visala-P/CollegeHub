
# College Discovery Platform - MVP

A production-grade full-stack web application for discovering, comparing, and selecting colleges. Built with React, Express.js, PostgreSQL, and TypeScript.

## Quick Overview

- Frontend: React 18 + React Router + Tailwind CSS + Radix UI
- Backend: Express.js + Node.js + TypeScript
- Database: PostgreSQL with 9 tables
- Auth: JWT-based authentication
- Deployment: Vercel for the frontend and Render for the backend

## Features Implemented

- College discovery and search with filters and pagination
- College detail pages with courses, placements, and reviews
- Compare colleges side by side
- Rank-based predictor
- Q&A forum
- User authentication and saved colleges

## Getting Started

```bash
git clone <repo>
cd college-discovery
cd frontend
npm install
cd ../backend
npm install
createdb college_discovery_platform
npm run db:migrate
npm run db:seed
cd ../frontend
npm run dev:all
```

Or run them separately:

```bash
cd frontend
npm run dev

cd ../backend
npm run dev
npm run db:migrate
npm run db:seed
```

Frontend runs on Vercel and backend on https://collegehub-6ed8.onrender.com/api (deployed).

## Documentation

- [SETUP.md](SETUP.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [backend/README.md](backend/README.md)
  