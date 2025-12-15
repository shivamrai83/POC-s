# 🚀 Deployment Guide - Render with CI/CD

This guide will help you deploy your Todo app on Render with a complete CI/CD pipeline.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [GitHub Setup](#github-setup)
3. [Render Deployment](#render-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Environment Variables](#environment-variables)
6. [Monitoring & Logs](#monitoring--logs)

---

## Prerequisites

- GitHub account
- Render account (free tier available)
- Git installed locally
- Your todo app code

---

## 🔧 GitHub Setup

### Step 1: Create a GitHub Repository

```bash
# Navigate to your project
cd /home/shivam/POC-s/CI-CD

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Todo app with CI/CD setup"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/todo-app.git
git branch -M main
git push -u origin main
```

### Step 2: Verify GitHub Actions

Once pushed, GitHub Actions will automatically run:
- ✅ Backend validation
- ✅ Frontend build test
- ✅ Security audit
- ✅ Deployment readiness check

Check the "Actions" tab in your GitHub repository to see the workflow running.

---

## 🌐 Render Deployment

### Option 1: Using Render Blueprint (Recommended)

This is the easiest method - deploys both backend and frontend together.

1. **Log in to Render**: https://render.com/
2. **Create New** → **Blueprint**
3. **Connect Repository**: 
   - Select your GitHub repository
   - Grant Render access
4. **Deploy**:
   - Render will read `render.yaml`
   - Creates two services:
     - `todo-backend` (Web Service)
     - `todo-frontend` (Static Site)
5. **Set Environment Variables**:
   - Go to `todo-frontend` service
   - Add environment variable:
     - Key: `REACT_APP_API_URL`
     - Value: `https://todo-backend-XXXX.onrender.com` (your backend URL)
6. **Redeploy Frontend** after setting the API URL

### Option 2: Manual Deployment (Alternative)

#### Deploy Backend

1. **Dashboard** → **New** → **Web Service**
2. **Connect Repository**: Select your repo
3. **Configure**:
   - Name: `todo-backend`
   - Environment: `Node`
   - Region: `Oregon` (or nearest)
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`
4. **Add Environment Variable**:
   - `NODE_ENV` = `production`
5. **Create Web Service**

#### Deploy Frontend

1. **Dashboard** → **New** → **Static Site**
2. **Connect Repository**: Same repo
3. **Configure**:
   - Name: `todo-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. **Add Environment Variable**:
   - `REACT_APP_API_URL` = `https://todo-backend-XXXX.onrender.com`
5. **Create Static Site**

---

## 🔄 CI/CD Pipeline

### Workflow Overview

```
┌─────────────────┐
│  Push to GitHub │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ GitHub Actions Run  │
│  - Backend Check    │
│  - Frontend Build   │
│  - Security Audit   │
└────────┬────────────┘
         │
         ▼
    ┌────┴────┐
    │ Success? │
    └────┬────┘
         │ Yes
         ▼
┌─────────────────────┐
│ Render Auto-Deploy  │
│  - Pull latest code │
│  - Build & Deploy   │
└─────────────────────┘
```

### How It Works

1. **Developer pushes code** to GitHub (main branch)
2. **GitHub Actions automatically**:
   - Validates backend code
   - Builds and tests frontend
   - Runs security audits
   - Creates build artifacts
3. **If all checks pass**:
   - Render detects the push
   - Automatically pulls latest code
   - Rebuilds and redeploys services
4. **Notification**: You'll receive email from Render about deployment status

### Pull Request Workflow

When you create a PR:
1. GitHub Actions runs validation
2. Render can create preview deployment (optional)
3. After PR merge to main → automatic deployment

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `5000` | Backend port (auto-set by Render) |

### Frontend Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend.onrender.com` | Backend API URL |

**Important**: Update `REACT_APP_API_URL` with your actual backend URL from Render!

---

## 📊 Monitoring & Logs

### View Logs

**Render Dashboard**:
1. Go to your service (backend or frontend)
2. Click **Logs** tab
3. View real-time logs

### Health Checks

Backend includes a health check endpoint:
```
GET https://your-backend.onrender.com/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Todo API is running"
}
```

### Monitoring Dashboard

1. **Render Dashboard** → **Metrics**
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## 🔧 Update Frontend to Use Environment Variable

The frontend needs a small update to use the environment variable:

**frontend/src/App.js** - Update API_URL:

```javascript
const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api/todos`
  : '/api/todos';
```

---

## 🚀 Deployment Commands

### Force Redeploy

```bash
# Trigger redeployment
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

### View Deployment Status

```bash
# Check GitHub Actions
# Visit: https://github.com/YOUR_USERNAME/YOUR_REPO/actions

# Or use GitHub CLI
gh run list
gh run view
```

---

## 🐛 Troubleshooting

### Issue: Frontend can't connect to backend

**Solution**: 
1. Check `REACT_APP_API_URL` is set correctly
2. Verify backend is running (check health endpoint)
3. Check CORS settings in backend

### Issue: Build fails on Render

**Solution**:
1. Check logs in Render dashboard
2. Verify `package.json` scripts are correct
3. Ensure all dependencies are listed

### Issue: Database resets on backend restart

**Note**: Render Free tier has ephemeral storage. For persistent storage:
- Upgrade to paid plan, OR
- Use external database (PostgreSQL on Render)

---

## 📝 Best Practices

1. **Branch Strategy**:
   - `main` → Production (auto-deploys)
   - `develop` → Staging/Testing
   - Feature branches → No auto-deploy

2. **Testing Before Deploy**:
   - Always create PR first
   - Wait for CI checks to pass
   - Review and merge to main

3. **Environment Variables**:
   - Never commit secrets to Git
   - Use Render's environment variable manager
   - Update `.gitignore` for sensitive files

4. **Monitoring**:
   - Check logs after deployment
   - Test health endpoint
   - Verify frontend-backend connection

---

## 🎯 Quick Start Checklist

- [ ] Push code to GitHub
- [ ] Create Render account
- [ ] Connect GitHub to Render
- [ ] Deploy using Blueprint (render.yaml)
- [ ] Set `REACT_APP_API_URL` environment variable
- [ ] Redeploy frontend
- [ ] Test the application
- [ ] Verify CI/CD pipeline works (make a small change and push)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Deploying Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Deploying React on Render](https://render.com/docs/deploy-create-react-app)

---

## 🆘 Support

If you encounter issues:
1. Check Render logs
2. Check GitHub Actions logs
3. Review this guide's troubleshooting section
4. Contact Render support (support@render.com)

---

**Happy Deploying! 🎉**

