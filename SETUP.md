# Setup Instructions

Complete guide to set up the College Discovery Platform for local development.

## ✅ Prerequisites

Before starting, ensure you have:

- **Node.js** >= 16.x (https://nodejs.org)
- **PostgreSQL** >= 12.x (https://www.postgresql.org)
- **npm** or **pnpm** (comes with Node.js)
- **Git** (https://git-scm.com)
- **VS Code** (recommended, https://code.visualstudio.com)

### Verify Installations

```bash
node --version        # Should be >= v16.x
npm --version         # Should be >= 8.x
psql --version        # Should be >= 12.x
git --version         # Should show git version
```

---

## 🚀 Quick Start (5 minutes)

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/college-discovery.git
cd college-discovery
```

### Step 2: Install Dependencies

```bash
# Install all dependencies for both frontend and backend
npm run install-all
```

### Step 3: Create PostgreSQL Database

Open PostgreSQL and run:

```sql
CREATE DATABASE college_discovery_platform;
```

Or via terminal:

```bash
createdb college_discovery_platform
```

### Step 4: Configure Environment

Create `.env` file in `backend` directory:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=college_discovery_platform
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### Step 5: Setup Database

```bash
# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

### Step 6: Start Development Servers

**Option A: Run both together**
```bash
npm run dev:all
```

**Option B: Run separately**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run dev:backend
```

### Step 7: Access Application

- Frontend: http://localhost:5173
- Backend API: https://collegehub-6ed8.onrender.com/api (production) or http://localhost:5000/api (local)
- Database: localhost:5432

---

## 📋 Detailed Setup Steps

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/college-discovery.git
cd college-discovery
```

### Step 2: Install Node Modules

#### For Frontend
```bash
npm install
```

#### For Backend
```bash
cd backend
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

### Step 3: PostgreSQL Setup

#### On Windows

1. Open pgAdmin (comes with PostgreSQL)
2. Right-click "Databases" → "Create" → "Database"
3. Name: `college_discovery_platform`
4. Click "Save"

#### On macOS/Linux

```bash
# Via command line
createdb college_discovery_platform

# Or in psql
psql -U postgres
CREATE DATABASE college_discovery_platform;
\q
```

### Step 4: Backend Environment Configuration

Create `backend/.env`:

```bash
cat > backend/.env << EOF
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=college_discovery_platform
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Frontend
FRONTEND_URL=http://localhost:5173
EOF
```

**Note:** Update `DB_PASSWORD` to match your PostgreSQL password.

### Step 5: Frontend Environment Configuration

Create `.env`:

```bash
cat > .env << EOF
VITE_API_BASE_URL=https://collegehub-6ed8.onrender.com/api
EOF
```

### Step 6: Initialize Database

Run migrations to create tables:

```bash
npm run db:migrate
```

You should see:
```
✅ Database migration completed successfully
Database setup complete
```

### Step 7: Seed Sample Data

Populate database with colleges:

```bash
npm run db:seed
```

You should see:
```
✅ Database seeding completed successfully
Database seeding complete
```

### Step 8: Start Development Servers

#### Option A: Run Both Servers Together

```bash
npm run dev:all
```

#### Option B: Run Separately

**Frontend** (Terminal 1):
```bash
npm run dev
```

You'll see:
```
✅ VITE v4.4.9 dev server running at:
  ➜  Local:   http://localhost:5173/
```

**Backend** (Terminal 2):
```bash
npm run dev:backend
```

You'll see:
```
✅ Server is running on port 5000
✅ Database connected: ...
```

---

## ✨ First Launch

1. Open http://localhost:5173 in browser
2. You should see the College Discovery Platform homepage
3. Test features:
   - Browse colleges
   - Search by name
   - Filter by state/fees/course
   - Click on a college for details
   - Click "Compare" to see comparison feature

---

## 🔧 Useful Commands

### Database Operations

```bash
# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Access PostgreSQL CLI
psql college_discovery_platform

# Reset database
psql college_discovery_platform -c "DROP SCHEMA public CASCADE;"
psql college_discovery_platform -c "CREATE SCHEMA public;"
```

### Backend

```bash
# Development server
npm run dev:backend

# Build
npm run build:backend

# Production
npm start
```

### Frontend

```bash
# Development server
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Test the API

### Health Check

```bash
curl https://collegehub-6ed8.onrender.com/api/health
# Response: {"status":"OK","message":"College Discovery Platform API is running"}
```

### Get Colleges

```bash
curl https://collegehub-6ed8.onrender.com/api/colleges
# Returns paginated list of colleges
```

### Register User

```bash
curl -X POST https://collegehub-6ed8.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login

```bash
curl -X POST https://collegehub-6ed8.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
# Returns token
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Backend port 5000 taken:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Frontend port 5173 taken:**
```bash
# Start on different port
npm run dev -- --port 3000
```

### Database Connection Failed

```bash
# Test PostgreSQL connection
psql -U postgres -h localhost

# If it fails, check if PostgreSQL is running
# Windows: Services → PostgreSQL
# macOS: brew services list
# Linux: sudo systemctl status postgresql
```

### Migrations Failed

```bash
# Check database exists
createdb --list

# Recreate database
dropdb college_discovery_platform
createdb college_discovery_platform

# Rerun migrations
npm run db:migrate
```

### API Connection Error in Frontend

1. Ensure backend is running on port 5000
2. Check `.env` file has correct API URL
3. Check browser console for CORS errors
4. Verify `CORS_ORIGIN` in backend `.env` matches frontend URL

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules backend/node_modules
npm run install-all

# Clear cache
npm cache clean --force
```

---

## 📚 Project Structure After Setup

```
college-discovery-platform/
├── src/                      # Frontend React code
│   └── app/
│       ├── pages/           # Page components
│       ├── components/      # Reusable components
│       ├── services/        # API service (api.ts)
│       ├── context/         # Auth context
│       └── data/            # Mock data
│
├── backend/                  # Backend Node.js/Express
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth middleware
│   │   ├── db/              # Database config
│   │   └── server.ts        # Express app
│   ├── .env                 # Backend config
│   └── package.json
│
├── .env                      # Frontend config
├── vite.config.ts           # Frontend build config
├── package.json             # Root package.json
└── README.md
```

---

## 🎯 Next Steps

After setup is complete:

1. **Explore the Code**
   - Frontend: `src/app/pages/` - Main pages
   - Backend: `backend/src/routes/` - API endpoints

2. **Make Changes**
   - Edit frontend code - auto-refreshes
   - Edit backend code - auto-restarts

3. **Test Features**
   - Register a new user
   - Save a college
   - Compare colleges
   - Ask questions
   - Test predictor

4. **Deploy (Optional)**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)

5. **Learn More**
   - Frontend: [Guidelines.md](./guidelines/Guidelines.md)
   - Backend: [backend/README.md](./backend/README.md)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Frontend loads at http://localhost:5173
- [ ] Backend API responds at https://collegehub-6ed8.onrender.com/api/health
- [ ] Can browse colleges
- [ ] Can register a new account
- [ ] Can login
- [ ] Can save a college
- [ ] Can compare colleges
- [ ] Can view college details
- [ ] Database is populated with 10 colleges

---

## 💡 Tips

- **Use VS Code** - Great TypeScript support and debugging
- **Enable hot reload** - Changes auto-reflect without restart
- **Check browser console** - For frontend errors
- **Check terminal logs** - For backend errors
- **Use Postman** - To test API endpoints
- **Read comments** - Code has helpful comments explaining logic

---

## 🆘 Still Having Issues?

1. **Check logs** - Look for error messages in terminal
2. **Verify prerequisites** - Run version checks above
3. **Check env vars** - Make sure frontend and backend URLs point to the right services
4. **Search issues** - Check GitHub Issues for solutions
5. **Ask for help** - Create a GitHub discussion

---

**🎉 You're all set! Happy coding!**

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
