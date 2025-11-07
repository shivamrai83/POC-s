# 🔄 CI/CD Flow Documentation

## Overview

This document explains the complete CI/CD (Continuous Integration / Continuous Deployment) flow for the Todo application.

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEVELOPER                                 │
│                            │                                     │
│                            ▼                                     │
│                    ┌──────────────┐                             │
│                    │  Git Commit  │                             │
│                    └──────┬───────┘                             │
│                            │                                     │
│                            ▼                                     │
│                    ┌──────────────┐                             │
│                    │  Git Push    │                             │
│                    └──────┬───────┘                             │
└────────────────────────────┼───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                         GITHUB                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │              GitHub Actions Triggered             │         │
│  └───────────────────┬──────────────────────────────┘         │
│                      │                                          │
│         ┌────────────┼────────────┐                            │
│         ▼            ▼            ▼                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                      │
│  │ Backend  │ │ Frontend │ │ Security │                      │
│  │  Check   │ │  Build   │ │  Audit   │                      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘                      │
│       │            │            │                              │
│       └────────────┼────────────┘                              │
│                    │                                            │
│                    ▼                                            │
│            ┌──────────────┐                                    │
│            │ All Passed?  │                                    │
│            └──────┬───────┘                                    │
│                   │                                             │
│                   ▼                                             │
│            ┌──────────────┐                                    │
│            │   ✅ Success  │                                    │
│            └──────┬───────┘                                    │
└────────────────────┼───────────────────────────────────────────┘
                     │
                     │ Webhook Trigger
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         RENDER                                   │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │           Auto-Deploy Triggered                │            │
│  └───────────────────┬────────────────────────────┘            │
│                      │                                           │
│         ┌────────────┼────────────┐                             │
│         ▼                          ▼                             │
│  ┌──────────────┐          ┌──────────────┐                    │
│  │   Backend    │          │   Frontend   │                    │
│  │   Service    │          │  Static Site │                    │
│  │              │          │              │                    │
│  │  1. Pull     │          │  1. Pull     │                    │
│  │  2. Build    │          │  2. Build    │                    │
│  │  3. Deploy   │          │  3. Deploy   │                    │
│  └──────┬───────┘          └──────┬───────┘                    │
│         │                          │                             │
│         └──────────┬───────────────┘                             │
│                    ▼                                              │
│            ┌──────────────┐                                      │
│            │   🚀 Live     │                                      │
│            └──────────────┘                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📝 Detailed CI/CD Steps

### Phase 1: Local Development

```bash
# Developer works on feature
git checkout -b feature/new-feature

# Make changes to code
# Test locally

# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature
```

---

### Phase 2: Pull Request & CI Checks

When you create a Pull Request:

```yaml
Trigger: Pull Request Created/Updated
├── Step 1: Checkout Code
├── Step 2: Setup Node.js Environment
├── Step 3: Install Dependencies
│   ├── Backend: npm ci
│   └── Frontend: npm ci
├── Step 4: Run Validations
│   ├── Backend: Syntax Check
│   ├── Frontend: Build Test
│   └── Security: npm audit
└── Step 5: Report Results
    ├── ✅ Pass → Ready to Merge
    └── ❌ Fail → Fix Required
```

**Files Involved:**
- `.github/workflows/pr-check.yml`

---

### Phase 3: Merge to Main & Full CI Pipeline

When PR is merged to `main` branch:

```yaml
Trigger: Push to Main Branch
├── Job 1: Backend Check
│   ├── Checkout repository
│   ├── Setup Node.js v18
│   ├── Install backend dependencies
│   ├── Run security audit
│   └── Syntax validation
│
├── Job 2: Frontend Check (Parallel)
│   ├── Checkout repository
│   ├── Setup Node.js v18
│   ├── Install frontend dependencies
│   ├── Run security audit
│   ├── Build production bundle
│   └── Upload build artifacts
│
└── Job 3: Deployment Ready
    ├── Wait for Jobs 1 & 2
    ├── If all passed:
    │   └── Notify deployment ready
    └── If any failed:
        └── Stop pipeline
```

**Files Involved:**
- `.github/workflows/ci-cd.yml`

---

### Phase 4: Automatic Deployment on Render

Once CI passes, Render auto-deploys:

#### Backend Deployment

```yaml
Service: todo-backend
├── 1. Detect Push Event (via GitHub webhook)
├── 2. Pull Latest Code from main branch
├── 3. Build Phase
│   ├── cd backend
│   ├── npm install
│   └── Prepare environment
├── 4. Start Phase
│   ├── npm start
│   └── Run server.js
├── 5. Health Check
│   └── GET /api/health
└── 6. Live ✅
    └── https://todo-backend-xxxx.onrender.com
```

#### Frontend Deployment

```yaml
Service: todo-frontend
├── 1. Detect Push Event
├── 2. Pull Latest Code from main branch
├── 3. Build Phase
│   ├── cd frontend
│   ├── npm install
│   ├── Set REACT_APP_API_URL env var
│   └── npm run build
├── 4. Deploy Phase
│   └── Serve static files from /build
└── 5. Live ✅
    └── https://todo-frontend-xxxx.onrender.com
```

**Files Involved:**
- `render.yaml` (Blueprint configuration)

---

## 🔐 Environment Variables Flow

### Development
```javascript
// Frontend uses proxy
REACT_APP_API_URL="" // Empty, uses package.json proxy
```

### Production
```javascript
// Frontend uses explicit backend URL
REACT_APP_API_URL="https://todo-backend-xxxx.onrender.com"
```

**How it works:**

```javascript
// In App.js
const API_BASE = process.env.REACT_APP_API_URL || '';
const API_URL = `${API_BASE}/api/todos`;
```

---

## 🔄 Complete Workflow Example

### Scenario: Adding a New Feature

**Step 1: Development**
```bash
# Create feature branch
git checkout -b feature/add-priority

# Make code changes
# Edit files...

# Test locally
cd backend && npm start  # Terminal 1
cd frontend && npm start # Terminal 2
```

**Step 2: Commit & Push**
```bash
git add .
git commit -m "Add priority field to todos"
git push origin feature/add-priority
```

**Step 3: Create Pull Request**
- Go to GitHub
- Create PR: `feature/add-priority` → `main`
- GitHub Actions automatically runs `pr-check.yml`
- Wait for ✅ checks to pass

**Step 4: Code Review & Merge**
- Team reviews code
- Approve and merge PR
- GitHub Actions runs `ci-cd.yml` on main branch

**Step 5: Automatic Deployment**
- CI pipeline completes successfully
- Render detects push to main
- Backend redeploys automatically
- Frontend rebuilds and redeploys
- Check deployment logs on Render dashboard

**Step 6: Verification**
```bash
# Test backend health
curl https://todo-backend-xxxx.onrender.com/api/health

# Visit frontend
open https://todo-frontend-xxxx.onrender.com
```

---

## ⚡ Deployment Triggers

| Event | CI Runs? | Deploy? | Notes |
|-------|----------|---------|-------|
| Push to feature branch | ❌ | ❌ | Only PR checks when PR created |
| Create Pull Request | ✅ | ❌ | Runs PR validation |
| Update Pull Request | ✅ | ❌ | Re-runs validation |
| Merge to main | ✅ | ✅ | Full CI + Auto-deploy |
| Manual trigger | ✅ | ✅ | Via Render dashboard |

---

## 📊 Monitoring & Feedback

### GitHub Actions Status
```
Repository → Actions Tab
├── All Workflows
├── Filter by Branch
└── View Logs per Job
```

### Render Deployment Status
```
Render Dashboard
├── Services List
├── Click Service
├── Deployments Tab
│   ├── In Progress
│   ├── Live
│   └── Failed
└── Logs Tab
    ├── Build Logs
    └── Runtime Logs
```

### Notifications
- **GitHub**: Email on workflow completion
- **Render**: Email on deployment status
- **Slack**: Can integrate webhooks (optional)

---

## 🚨 Failure Handling

### If CI Fails
```yaml
Failure in GitHub Actions:
├── Check logs in Actions tab
├── Identify failing step
├── Fix locally
├── Push fix
└── CI re-runs automatically
```

### If Deployment Fails
```yaml
Failure on Render:
├── Check Render logs
├── Common issues:
│   ├── Build command failed
│   ├── Missing dependencies
│   ├── Environment variables not set
│   └── Port conflicts
├── Fix and push
└── Auto-retry deployment
```

---

## 🔧 Manual Interventions

### Force Redeploy (No Code Changes)
```bash
# Empty commit to trigger pipeline
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

### Rollback Deployment
```
Render Dashboard:
├── Go to Service
├── Deployments Tab
├── Find previous successful deployment
└── Click "Redeploy"
```

### Stop Auto-Deploy
```
Render Dashboard:
├── Service Settings
├── Build & Deploy Section
└── Toggle "Auto-Deploy"
```

---

## 📈 Performance Metrics

### Build Times (Approximate)
- **Backend Build**: 1-2 minutes
- **Frontend Build**: 2-4 minutes
- **Total Pipeline**: 3-6 minutes

### Deployment Times
- **Backend Deploy**: 2-3 minutes
- **Frontend Deploy**: 1-2 minutes
- **Total**: 3-5 minutes

---

## 🎯 Best Practices

1. **Always use feature branches**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Wait for CI before merging**
   - Never merge failing PRs
   - Review all logs

3. **Test locally first**
   ```bash
   # Always test before pushing
   npm test
   npm run build
   ```

4. **Use descriptive commit messages**
   ```bash
   git commit -m "feat: add todo priority feature"
   git commit -m "fix: resolve CORS issue in backend"
   ```

5. **Monitor deployments**
   - Check Render logs after deployment
   - Test production URL
   - Verify health endpoints

---

## 📋 Checklist for Each Deployment

- [ ] Code reviewed and approved
- [ ] CI pipeline passed
- [ ] Local testing completed
- [ ] Environment variables verified
- [ ] Deployment successful on Render
- [ ] Health check passed
- [ ] Frontend-backend connection working
- [ ] No errors in production logs

---

## 🔗 Quick Links

- **GitHub Repository**: Your repo URL
- **GitHub Actions**: `https://github.com/USER/REPO/actions`
- **Render Dashboard**: `https://dashboard.render.com`
- **Backend Production**: `https://todo-backend-xxxx.onrender.com`
- **Frontend Production**: `https://todo-frontend-xxxx.onrender.com`

---

**🎉 Your CI/CD pipeline is ready!**

Every push to main triggers automatic testing and deployment. Happy coding! 🚀

