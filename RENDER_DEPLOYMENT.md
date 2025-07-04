# Render Deployment Guide

## Overview
This guide will help you deploy your GPay Mock UPI API to Render platform.

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- MongoDB database (MongoDB Atlas recommended)

## Step 1: Prepare Your Repository

### 1.1 Ensure your repository is on GitHub
```bash
# If you haven't pushed to GitHub yet
git remote add origin https://github.com/YOUR_USERNAME/gpay-mock-api.git
git push -u origin main
```

### 1.2 Verify your project structure
```
gpay-mock-api/
├── backend/
│   ├── package.json
│   ├── app.js
│   └── ...
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── README.md
└── .gitignore
```

## Step 2: Backend Deployment

### 2.1 Create Web Service
1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `gpay-mock-api-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (or `backend` if needed)

**Build & Deploy:**
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Auto-Deploy**: ✅ Yes

### 2.2 Environment Variables
Add these environment variables in Render dashboard:

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gpay_mock?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_here_make_it_long_and_random

# Finzen API Configuration
FINZEN_API_URL=https://your-finzen-api.com/api/v1
FINZEN_API_KEY=your_finzen_api_key_here
FINZEN_SYNC_INTERVAL=300000

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 2.3 Deploy
Click **"Create Web Service"** and wait for deployment.

## Step 3: Frontend Deployment

### 3.1 Create Static Site
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure the service:

**Basic Settings:**
- **Name**: `gpay-mock-api-frontend`
- **Environment**: `Static Site`
- **Region**: Same as backend
- **Branch**: `main`
- **Root Directory**: Leave empty

**Build & Deploy:**
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Auto-Deploy**: ✅ Yes

### 3.2 Environment Variables
Add these environment variables:

```bash
# API Configuration
VITE_API_URL=https://your-backend-service-name.onrender.com
VITE_FINZEN_URL=https://your-finzen-api.com
```

### 3.3 Deploy
Click **"Create Static Site"** and wait for deployment.

## Step 4: Database Setup

### 4.1 MongoDB Atlas (Recommended)
1. Go to [mongodb.com](https://mongodb.com) and create account
2. Create a new cluster (free tier available)
3. Create database user with password
4. Get connection string
5. Update `MONGODB_URI` in Render environment variables

### 4.2 Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/gpay_mock?retryWrites=true&w=majority
```

## Step 5: Custom Domains (Optional)

### 5.1 Backend Custom Domain
1. In your backend service settings
2. Go to **"Settings"** → **"Custom Domains"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed

### 5.2 Frontend Custom Domain
1. In your frontend service settings
2. Go to **"Settings"** → **"Custom Domains"**
3. Add your domain (e.g., `yourdomain.com`)
4. Update DNS records as instructed

## Step 6: Environment-Specific Configuration

### 6.1 Development Environment
```bash
# Backend .env
MONGODB_URI=mongodb://localhost:27017/gpay_mock
JWT_SECRET=dev_secret_key
FINZEN_API_URL=http://localhost:5000/api/v1
FINZEN_API_KEY=dev_key
NODE_ENV=development

# Frontend .env
VITE_API_URL=http://localhost:3000
VITE_FINZEN_URL=http://localhost:5000
```

### 6.2 Production Environment (Render)
```bash
# Backend Environment Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gpay_mock
JWT_SECRET=production_secure_secret_key
FINZEN_API_URL=https://your-finzen-api.com/api/v1
FINZEN_API_KEY=production_finzen_key
NODE_ENV=production

# Frontend Environment Variables
VITE_API_URL=https://your-backend-service.onrender.com
VITE_FINZEN_URL=https://your-finzen-api.com
```

## Step 7: Testing Your Deployment

### 7.1 Test Backend API
```bash
# Test registration
curl -X POST https://your-backend-service.onrender.com/upi/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","name":"Test User","password":"password123","initialBalance":1000}'

# Test login
curl -X POST https://your-backend-service.onrender.com/upi/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","password":"password123"}'
```

### 7.2 Test Frontend
1. Visit your frontend URL
2. Register a new user
3. Login and test transactions
4. Test Finzen sync functionality

## Step 8: Monitoring and Logs

### 8.1 View Logs
- Go to your service in Render dashboard
- Click **"Logs"** tab
- Monitor for errors and performance

### 8.2 Health Checks
- Render automatically checks your service health
- Ensure your service responds to health check endpoints

## Step 9: Troubleshooting

### 9.1 Common Issues

**Build Failures:**
```bash
# Check build logs in Render dashboard
# Common issues:
# - Missing dependencies
# - Environment variables not set
# - Port conflicts
```

**Database Connection Issues:**
```bash
# Verify MONGODB_URI is correct
# Check MongoDB Atlas network access
# Ensure database user has correct permissions
```

**API Connection Issues:**
```bash
# Verify VITE_API_URL is correct
# Check CORS settings
# Ensure backend is running
```

### 9.2 Debug Commands
```bash
# Check service status
curl https://your-backend-service.onrender.com/upi/me

# Test database connection
# Check Render logs for connection errors

# Verify environment variables
# Check Render dashboard → Environment
```

## Step 10: Performance Optimization

### 10.1 Backend Optimization
- Enable caching headers
- Optimize database queries
- Use connection pooling

### 10.2 Frontend Optimization
- Enable gzip compression
- Optimize bundle size
- Use CDN for static assets

## Step 11: Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection uses authentication
- [ ] Environment variables are set in Render
- [ ] HTTPS is enabled (automatic on Render)
- [ ] CORS is properly configured
- [ ] Input validation is working
- [ ] Rate limiting is implemented

## Step 12: Backup and Recovery

### 12.1 Database Backup
- Set up MongoDB Atlas automated backups
- Export data regularly
- Test restore procedures

### 12.2 Application Backup
- Your code is backed up in GitHub
- Render provides automatic deployments
- Keep local backups of environment variables

## URLs After Deployment

- **Backend API**: `https://your-backend-service.onrender.com`
- **Frontend App**: `https://your-frontend-service.onrender.com`
- **API Documentation**: `https://your-backend-service.onrender.com/`

## Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test locally first
4. Check MongoDB connection
5. Review this deployment guide

---

**Your GPay Mock UPI API is now live on Render! 🚀** 