# College Discovery Platform

A production-grade full-stack application for discovering and comparing colleges. Built with React, Express.js, TypeScript, and PostgreSQL.

## 🎯 Features

### ✅ College Discovery & Search
- Browse all colleges with advanced filtering
- Search by college name, location, and course
- Filter by location, fees, and offered courses
- Pagination support
- College detail page with comprehensive information

### ✅ Comparison Tool (HIGH PRIORITY)
- Compare 2-3 colleges side-by-side
- View key metrics: fees, placement %, rating, location
- Save comparisons for later reference

### ✅ Rank Predictor
- Predict suitable colleges based on exam rank
- Support for JEE, NEET, CAT, GATE, KVPY
- Rule-based prediction algorithm
- Get personalized college matches

### ✅ Q&A Forum
- Ask questions about colleges
- Browse existing questions and answers
- Upvote helpful answers
- Search forum discussions

### ✅ User Authentication
- User registration with email
- Secure login with JWT tokens
- Profile management
- Save favorite colleges
- Save comparisons

### ✅ Reviews & Placements
- Student reviews and ratings
- Placement statistics by year and company
- Average and highest package information

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component library
- **Motion/Framer Motion** - Animation library
- **TypeScript** - Type safety

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: PostgreSQL (managed service)

## 📋 Project Structure

```
college-discovery-platform/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── context/     # React context (Auth, Theme)
│   │   │   ├── services/    # API service layer
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   └── data/        # Mock data
│   │   ├── styles/          # Global styles
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                 # Express backend
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── db/              # Database configuration
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Express app entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm or pnpm

### 1. Clone & Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Setup Database

Create PostgreSQL database:
```sql
CREATE DATABASE college_discovery_platform;
```

Configure `.env` in backend directory:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=college_discovery_platform
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

Run migrations:
```bash
cd backend
npm run db:migrate
```

Seed sample data:
```bash
npm run db:seed
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000` locally, or on your deployed Render URL in production

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

### 4. Access Application

Open browser and visit: `http://localhost:5173`

## 📚 API Endpoints

### Colleges
```
GET    /api/colleges                    # Get all colleges
GET    /api/colleges/:id                # Get college details
GET    /api/colleges/search?query=...   # Search colleges
GET    /api/colleges/filters            # Get available filters
```

### Authentication
```
POST   /api/auth/register               # Register user
POST   /api/auth/login                  # Login user
GET    /api/auth/profile                # Get user profile
POST   /api/auth/save-college           # Save college
POST   /api/auth/unsave-college         # Unsave college
GET    /api/auth/saved-colleges         # Get saved colleges
```

### Comparison
```
GET    /api/compare?ids=1,2,3           # Compare colleges
POST   /api/compare/save                # Save comparison
GET    /api/compare/saved               # Get saved comparisons
```

### Q&A Forum
```
GET    /api/qa                          # Get all questions
GET    /api/qa/:id                      # Get question details
POST   /api/qa                          # Create question
POST   /api/qa/answer                   # Post answer
POST   /api/qa/upvote                   # Upvote answer
GET    /api/qa/search?query=...         # Search questions
```

### Predictor
```
GET    /api/predictor/exams             # Get available exams
POST   /api/predictor/predict           # Predict colleges
```

## 🔐 Authentication Flow

1. **Register**: User creates account → Returns JWT token
2. **Login**: User provides credentials → Returns JWT token
3. **Storage**: Token stored in localStorage
4. **API Requests**: Token included in `Authorization: Bearer <token>` header
5. **Protected Routes**: Backend validates token before processing

## 📊 Database Schema

### Key Tables
- **users** - User accounts (email, password hash)
- **colleges** - College information
- **college_courses** - Many-to-many relationship with courses
- **reviews** - Student reviews and ratings
- **placements** - Placement statistics
- **saved_colleges** - User's saved colleges
- **comparisons** - User's saved comparisons
- **questions** - Q&A forum questions
- **answers** - Q&A forum answers

## 🌐 Deployment

### Deploy Backend

**Option 1: Railway**
1. Push code to GitHub
2. Create Railway project
3. Connect GitHub repository
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

**Option 2: Render**
1. Push code to GitHub
2. Create Render account
3. Create Web Service from GitHub repo
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

### Deploy Frontend

1. Push code to GitHub
2. Create a Vercel project from the repository
3. Set the root directory to `frontend`
4. Set the build command to `npm run build`
5. Set the output directory to `dist`
6. Add `VITE_API_BASE_URL` with your Render backend URL

### Deploy Backend

1. Push code to GitHub
2. Create a Render Web Service from the repository
3. Set the root directory to `backend`
4. Set the build command to `npm install && npm run build`
5. Set the start command to `npm start`
6. Add PostgreSQL and the backend environment variables

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=https://collegehub-6ed8.onrender.com/api
```

### Backend (.env)
```
PORT=5000
NODE_ENV=production
DB_HOST=db.example.com
DB_PORT=5432
DB_NAME=college_discovery_platform
DB_USER=postgres
DB_PASSWORD=secure_password
JWT_SECRET=super_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=https://app.example.com
FRONTEND_URL=https://app.example.com
```

For Vercel, set `VITE_API_BASE_URL` in the project environment variables.

## 🧪 Testing API Endpoints

### Register User
```bash
curl -X POST https://collegehub-6ed8.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST https://collegehub-6ed8.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Colleges
```bash
curl https://collegehub-6ed8.onrender.com/api/colleges?page=1&limit=6
```

### Predict Colleges
```bash
curl -X POST https://collegehub-6ed8.onrender.com/api/predictor/predict \
  -H "Content-Type: application/json" \
  -d '{
    "exam": "JEE",
    "rank": 250
  }'
```

## 🐛 Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running
- Check credentials in .env
- Verify database exists

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### API Connection Issues
- Verify backend is running on correct port
- Check CORS_ORIGIN in backend .env
- Verify VITE_API_BASE_URL in frontend .env

### Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript: `npx tsc --noEmit`
- Clear cache: `npm cache clean --force`

## 📚 Documentation

- [Backend README](./backend/README.md) - Backend setup and API details
- [Frontend Guide](./guidelines/Guidelines.md) - Frontend development guidelines

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Open Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙋 Support

For issues, bugs, or feature requests, please create an GitHub issue or contact the development team.

---

**Happy Coding! 🚀**
