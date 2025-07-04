# Deployment Guide - GPay Mock UPI API

## Overview
This guide covers deploying the GPay Mock UPI API with Finzen integration to various platforms.

## Prerequisites

### System Requirements
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB (local or cloud)
- Git

### Environment Variables
Create `.env` files for both backend and frontend:

#### Backend (.env)
```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/gpay_mock

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret

# Finzen API Configuration
FINZEN_API_URL=http://localhost:5000/api/v1
FINZEN_API_KEY=your_finzen_api_key
FINZEN_SYNC_INTERVAL=300000

# Server Configuration
PORT=3000
NODE_ENV=production
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000
VITE_FINZEN_URL=http://localhost:5000
```

## Local Development Deployment

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Database Setup
```bash
# Install MongoDB locally or use MongoDB Atlas
# Update MONGODB_URI in .env file
```

## Production Deployment Options

### Option 1: Heroku Deployment

#### Backend Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-gpay-mock-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secure_jwt_secret
heroku config:set FINZEN_API_URL=https://your-finzen-api.com
heroku config:set FINZEN_API_KEY=your_finzen_api_key
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Frontend Deployment
```bash
# Build the frontend
cd frontend
npm run build

# Deploy to Heroku or Netlify
# For Heroku, add a static buildpack
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
```

### Option 2: Railway Deployment

#### Backend Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set JWT_SECRET=your_secure_jwt_secret
railway variables set FINZEN_API_URL=https://your-finzen-api.com
railway variables set FINZEN_API_KEY=your_finzen_api_key
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Option 3: DigitalOcean App Platform

#### Backend Deployment
1. Create a new app in DigitalOcean
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set run command: `npm start`
5. Add environment variables in the dashboard
6. Deploy

### Option 4: AWS Deployment

#### Using AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init

# Create environment
eb create production

# Set environment variables
eb setenv JWT_SECRET=your_secure_jwt_secret
eb setenv FINZEN_API_URL=https://your-finzen-api.com
eb setenv FINZEN_API_KEY=your_finzen_api_key
eb setenv NODE_ENV=production

# Deploy
eb deploy
```

#### Using AWS EC2
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/your-username/gpay-mock-api.git
cd gpay-mock-api

# Install dependencies
cd backend && npm install
cd ../frontend && npm install && npm run build

# Set up PM2 for process management
sudo npm install -g pm2

# Start backend with PM2
cd ../backend
pm2 start app.js --name "gpay-api"

# Set up Nginx for frontend
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/gpay-frontend

# Nginx configuration
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/your/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/gpay-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Docker Deployment

### Dockerfile for Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Dockerfile for Frontend
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/gpay_mock
      - JWT_SECRET=your_secure_jwt_secret
      - FINZEN_API_URL=https://your-finzen-api.com
      - FINZEN_API_KEY=your_finzen_api_key
      - NODE_ENV=production
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Environment-Specific Configurations

### Development
```bash
NODE_ENV=development
DEBUG=finzen:*
```

### Staging
```bash
NODE_ENV=staging
LOG_LEVEL=info
```

### Production
```bash
NODE_ENV=production
LOG_LEVEL=error
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use secure random strings for JWT_SECRET
- Rotate API keys regularly

### 2. HTTPS
- Always use HTTPS in production
- Set up SSL certificates (Let's Encrypt)
- Redirect HTTP to HTTPS

### 3. Database Security
- Use strong database passwords
- Enable database authentication
- Restrict database access to application servers

### 4. API Security
- Implement rate limiting
- Add request validation
- Monitor API usage

## Monitoring and Logging

### 1. Application Monitoring
```bash
# Install monitoring tools
npm install -g pm2
pm2 install pm2-logrotate

# Monitor application
pm2 monit
pm2 logs
```

### 2. Database Monitoring
```bash
# MongoDB monitoring
mongo --eval "db.serverStatus()"
```

### 3. Error Tracking
Consider integrating error tracking services:
- Sentry
- LogRocket
- Bugsnag

## Performance Optimization

### 1. Database Optimization
```javascript
// Add database indexes
db.transactions.createIndex({ "user": 1, "date": -1 })
db.upiusers.createIndex({ "upiId": 1 })
db.upiusers.createIndex({ "userId": 1 })
```

### 2. Caching
```bash
# Install Redis for caching
npm install redis
```

### 3. CDN
- Use CDN for static assets
- Configure proper cache headers

## Backup and Recovery

### 1. Database Backup
```bash
# MongoDB backup
mongodump --db gpay_mock --out /backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db gpay_mock --out /backup/$DATE
tar -czf /backup/gpay_mock_$DATE.tar.gz /backup/$DATE
rm -rf /backup/$DATE
```

### 2. Application Backup
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz backend/ frontend/
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   sudo systemctl start mongod
   ```

3. **Environment Variables Not Loading**
   ```bash
   # Check .env file location
   ls -la .env
   # Verify file permissions
   chmod 600 .env
   ```

4. **Build Failures**
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] Finzen integration working
- [ ] SSL certificate installed
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Error tracking configured
- [ ] Performance monitoring active

---

**Ready for Production!** 🚀

Your GPay Mock UPI API is now ready for deployment with complete user-specific data isolation and Finzen integration. 