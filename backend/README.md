# College Discovery Platform - Backend API

A production-grade REST API for the College Discovery Platform built with Express.js, TypeScript, and MongoDB.

## Features

✅ **College Discovery** - Search, filter, and browse colleges
✅ **Authentication** - User registration and login with JWT
✅ **College Comparison** - Compare 2-3 colleges side-by-side
✅ **Saved Colleges** - Save favorite colleges for later
✅ **Rank Predictor** - AI-powered college predictions based on exam rank
✅ **Q&A Forum** - Community discussion for college queries
✅ **Reviews & Placements** - Real college data and placement statistics

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for frontend communication

## Prerequisites

- Node.js >= 16.x
- MongoDB >= 6.x or a MongoDB Atlas connection string
- npm or pnpm

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=college_discovery_platform

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

For production deploys, set the same variables in your host dashboard and make sure `CORS_ORIGIN` and `FRONTEND_URL` match the deployed frontend URL exactly.

### 3. Setup Database

Point `MONGODB_URI` at your local MongoDB server or MongoDB Atlas cluster, then run:

```bash
npm run db:migrate
```

### 4. Seed Database with Sample Data

```bash
npm run db:seed
```

This will populate the database with 10 sample colleges and their data.

### 5. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000` (local) or deploy to Render/similar service

## API Endpoints

### Health Check
- `GET /api/health` - API status

### Colleges
- `GET /api/colleges` - Get all colleges with pagination
- `GET /api/colleges/:id` - Get single college details
- `GET /api/colleges/search?query=...` - Search colleges
- `GET /api/colleges/filters` - Get available filters

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/save-college` - Save college (requires auth)
- `POST /api/auth/unsave-college` - Unsave college (requires auth)
- `GET /api/auth/saved-colleges` - Get saved colleges (requires auth)

### Compare
- `GET /api/compare?ids=1,2,3` - Compare colleges
- `POST /api/compare/save` - Save comparison (requires auth)
- `GET /api/compare/saved` - Get saved comparisons (requires auth)

### Q&A Forum
- `GET /api/qa` - Get all questions with pagination
- `GET /api/qa/:id` - Get question details
- `GET /api/qa/search?query=...` - Search questions
- `POST /api/qa` - Create new question
- `POST /api/qa/answer` - Post answer to question
- `POST /api/qa/upvote` - Upvote an answer

### Predictor
- `GET /api/predictor/exams` - Get available exams
- `POST /api/predictor/predict` - Predict colleges by rank

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Get Colleges with Filters
```bash
GET /api/colleges?page=1&limit=6&state=Maharashtra&minFees=100000&maxFees=500000
```

### Save College
```bash
POST /api/auth/save-college
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "collegeId": 1
}
```

### Predict Colleges
```bash
POST /api/predictor/predict
Content-Type: application/json

{
  "exam": "JEE",
  "rank": 250
}
```

## Database Schema

### Tables
- `users` - User accounts
- `colleges` - College information
- `college_courses` - Courses offered by colleges
- `reviews` - Student reviews
- `placements` - Placement statistics
- `saved_colleges` - User's saved colleges
- `comparisons` - User's saved comparisons
- `questions` - Q&A forum questions
- `answers` - Q&A forum answers

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

1. **Register/Login** - Returns a JWT token
2. **Store Token** - Save the token in client (localStorage/sessionStorage)
3. **Use Token** - Include token in `Authorization` header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "statusCode": 400
}
```

## Deployment

### Deploy on Render

1. Create a Render Web Service from this repository
2. Set the root directory to `backend`
3. Set `MONGODB_URI` to your MongoDB Atlas connection string
4. Set the backend environment variables
5. Run migrations after the service starts

Required variables for container deployment:

- `PORT`
- `NODE_ENV=production`
- `MONGODB_URI`
- `MONGODB_DB`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `CORS_ORIGIN`
- `FRONTEND_URL`

## Development

### Build TypeScript
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| NODE_ENV | development | Environment |
| MONGODB_URI | mongodb://127.0.0.1:27017 | MongoDB connection string |
| MONGODB_DB | college_discovery_platform | MongoDB database name |
| JWT_SECRET | secret | JWT signing secret |
| JWT_EXPIRE | 7d | JWT expiration time |
| CORS_ORIGIN | http://localhost:5173 | CORS allowed origin |

## Troubleshooting

### Database Connection Failed
- Check MongoDB is running or the Atlas URI is correct
- Verify `MONGODB_URI` and `MONGODB_DB` in `.env`
- Ensure the target database is reachable from your deployment environment

### Port Already in Use
```bash
lsof -i :5000  # Check what's using port 5000
kill -9 <PID>  # Kill the process
```

### JWT Token Issues
- Ensure JWT_SECRET is set in .env
- Check token is included in Authorization header
- Verify token hasn't expired

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, bugs, or feature requests, please create an issue on the GitHub repository.
