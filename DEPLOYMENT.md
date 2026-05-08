# Deployment Guide

This guide provides step-by-step instructions for deploying the College Discovery Platform to production.

## Quick Summary

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Render (with PostgreSQL)
- **Database**: Managed PostgreSQL on Render or another hosted provider

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Render account (for backend)
- Domain name (optional)

---

## 📱 Frontend Deployment (Vercel)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/college-discovery.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://collegehub-6ed8.onrender.com/api`
6. Click "Deploy"

### Step 3: Update Frontend .env

After backend is deployed, update:

```
VITE_API_BASE_URL=https://collegehub-6ed8.onrender.com/api
```

Push changes:
```bash
git push
```

Vercel will auto-deploy the changes.

---

## 🔧 Backend Deployment (Railway)

### Step 1: Connect GitHub to Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Authorize and select your repository

### Step 2: Configure Services

1. **Create PostgreSQL Database**
   - Click "Add" → "PostgreSQL"
   - Railway will automatically create database variables

2. **Create Node.js Service**
   - Click "Add" → "GitHub Repository"
   - Select your repository
   - Branch: `main`
   - Root Directory: `backend`

### Step 3: Set Environment Variables

In Railway Project Variables:

```
PORT=5000
NODE_ENV=production

# These are auto-set by Railway
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Set these values
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d

# Set frontend URL
CORS_ORIGIN=https://your-frontend-url.vercel.app
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Step 4: Deploy

1. Railway will automatically trigger deployment on push
2. Monitor logs in Railway dashboard
3. Once deployed, note the generated URL

### Step 5: Run Migrations

In Railway Console:

```bash
npm run db:migrate
npm run db:seed
```

Or via REST API call to trigger setup endpoint (if you add one).

---

## 🔧 Backend Deployment (Render)

### Step 1: Create Database

1. Go to [render.com](https://render.com)
2. Click "New" → "PostgreSQL"
3. Create database with name `college_discovery_platform`
4. Note the connection string

### Step 2: Deploy Backend

1. Click "New" → "Web Service"
2. Connect GitHub account
3. Select your repository
4. Configure:
   - **Name**: college-discovery-api
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables

Add all variables from "Backend Deployment (Railway)" section

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment (takes 2-5 minutes)
3. Note the generated URL

### Step 5: Run Database Migrations

Connect to Render Shell and run:

```bash
npm run db:migrate
npm run db:seed
```

---

## 🔐 Domain Configuration (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel Project Settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Add Custom Domain to Render

1. Go to Render service settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records

---

## 🧪 Post-Deployment Testing

### Test Backend

```bash
# Health check
curl https://your-api-url/api/health

# Get colleges
curl https://your-api-url/api/colleges

# Test login
curl -X POST https://your-api-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Frontend

1. Open https://your-frontend-url.vercel.app
2. Test college listing page
3. Test search functionality
4. Test user registration and login
5. Test save/compare features

---

## 📊 Monitoring

### Railway

- Dashboard shows real-time logs
- CPU and Memory usage
- Auto-scaling available
- Error tracking

### Vercel

- Deployment history
- Real-time logs
- Performance analytics
- Error tracking

### Database

Monitor through Railway/Render dashboard:
- Disk usage
- Connection count
- Query performance

---

## 🔄 CI/CD Pipeline

Both services support automatic deployments on git push:

1. Push changes to main branch
2. GitHub webhook triggers deployment
3. Build runs automatically
4. Tests execute (if configured)
5. Deploy to production

---

## 💰 Cost Estimates

### Vercel (Frontend)
- Free tier: 100GB bandwidth/month
- Pro: $20/month

### Railway (Backend)
- Free tier: $5 credits/month
- Pay-as-you-go: typically $0-20/month for small projects

### Database
- PostgreSQL on Railway: Included in free tier
- PostgreSQL on Render: $15-100+/month depending on storage

---

## 🚨 Troubleshooting

### Build Fails on Deployment

1. Check build logs
2. Verify Node version matches local
3. Run locally: `npm run build`
4. Check dependencies in package.json

### Database Connection Issues

1. Verify connection string is correct
2. Check IP whitelist (if applicable)
3. Ensure database exists
4. Run migrations after deployment

### CORS Errors

1. Verify CORS_ORIGIN in backend .env
2. Check frontend URL matches CORS_ORIGIN
3. Frontend and backend must be on same origin or CORS must be configured

### Environment Variables Not Loading

1. Check variable names match exactly
2. Restart deployment after adding variables
3. Verify no extra spaces in values

---

## 📝 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backend URL updated in frontend
- [ ] CORS configured for frontend domain
- [ ] Email sending configured (if needed)
- [ ] Error logging set up
- [ ] Database backups configured
- [ ] Domain/SSL configured
- [ ] Health checks passing
- [ ] All features tested in production

---

## 📞 Support

For deployment issues:
1. Check service status page
2. Review deployment logs
3. Check GitHub Issues
4. Contact service support

---

**Congratulations! Your College Discovery Platform is now live! 🎉**
