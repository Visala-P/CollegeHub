
# College Discovery Platform - MVP

A production-grade full-stack web application for discovering, comparing, and selecting colleges. Built with React, Express.js, MongoDB, and TypeScript.

## Quick Overview

- Frontend: React 18 + React Router + Tailwind CSS + Radix UI
- Backend: Express.js + Node.js + TypeScript
- Database: MongoDB with local Docker support
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
npm run mongo:up
cd backend
npm install
Copy-Item .env.example .env
npm run build
npm run db:migrate
npm run db:seed
npm run dev
```

In a second terminal, start the ML.NET predictor service:

```bash
cd backend/mlpredictor
dotnet run
```

Then run the frontend in a third terminal:

```bash
cd frontend
npm install
npm run dev
```

The backend uses MongoDB locally at `mongodb://127.0.0.1:27017`, and the predictor endpoint requires the ML.NET service to be running before predictions will return results.

## Documentation

- [SETUP.md](SETUP.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [backend/README.md](backend/README.md)
  