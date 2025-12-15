# ⚡ Quick Start - Deploy to Render

This is a simplified guide to get your Todo app deployed quickly.

## 🚀 5-Minute Deployment

### Prerequisites
- [ ] GitHub account
- [ ] Render account (free)
- [ ] Git installed

---

## Step 1: Push to GitHub (2 minutes)

```bash
cd /home/shivam/POC-s/CI-CD

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Todo app with CI/CD"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/todo-app.git
git branch -M main
git push -u origin main
```

✅ **Check**: GitHub Actions should start running automatically!

---

## Step 2: Deploy on Render (3 minutes)

### Option A: Using Blueprint (Easiest) ⭐

1. Login to [Render](https://render.com/)
2. Click **New** → **Blueprint**
3. Connect your GitHub repository
4. Render reads `render.yaml` and creates:
   - Backend service
   - Frontend static site
5. Click **Deploy**
6. Wait 3-5 minutes for deployment

### Option B: Manual Deployment

**Backend:**
1. New → Web Service
2. Connect repo → Select `backend` directory
3. Build: `npm install`
4. Start: `npm start`
5. Deploy

**Frontend:**
1. New → Static Site
2. Connect repo → Select `frontend` directory
3. Build: `npm install && npm run build`
4. Publish: `build`
5. Add env var: `REACT_APP_API_URL` = (your backend URL)
6. Deploy

---

## Step 3: Configure Frontend URL

After backend is deployed:

1. Go to **frontend service** on Render
2. **Environment** → Add variable:
   ```
   REACT_APP_API_URL=https://todo-backend-xxxx.onrender.com
   ```
   (Use your actual backend URL)
3. **Manual Deploy** → Deploy latest commit

---

## Step 4: Test Your App ✅

Visit your frontend URL:
```
https://todo-frontend-xxxx.onrender.com
```

Test it:
- [ ] Add a todo
- [ ] Mark as complete
- [ ] Delete a todo
- [ ] Refresh page (data persists!)

---

## 🎉 Done!

Now every time you push to `main` branch:
1. GitHub Actions runs tests
2. Render auto-deploys your changes

---

## Common Issues

**Frontend can't connect to backend?**
- Check `REACT_APP_API_URL` is set correctly
- Verify backend is running (visit `/api/health`)

**Build failed?**
- Check Render logs
- Verify `package.json` has all dependencies

---

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- Read [CI-CD-FLOW.md](./CI-CD-FLOW.md) to understand the pipeline
- Set up branch protection on GitHub
- Add more features!

Happy deploying! 🚀

