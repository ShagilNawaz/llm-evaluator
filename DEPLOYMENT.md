# 🌐 Deployment Guide

Deploy the LLM Response Evaluator to production using **Render** (backend) and **Vercel** (frontend).

---

## Overview

```
Browser → Vercel (React frontend) → Render (Express API) → MongoDB Atlas
                                           ↓
                                    Anthropic Claude API
```

---

## Part 1 — MongoDB Atlas (Database)

### 1.1 Create a free cluster

1. Sign up at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **Build a Database** → choose **M0 Free**
3. Select a cloud provider (AWS recommended) and a region close to your Render server
4. Name your cluster (e.g. `llm-evaluator`)

### 1.2 Create a database user

1. Go to **Database Access** → **Add New Database User**
2. Authentication method: **Password**
3. Username: `llm-admin` (or any name)
4. Password: generate a strong one and **save it**
5. Built-in role: **Atlas admin** (or `readWriteAnyDatabase`)

### 1.3 Allow network access

1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (`0.0.0.0/0`)
   > For better security, add Render's static IP addresses instead once you have them.

### 1.4 Get your connection string

1. Click **Connect** → **Drivers**
2. Select **Node.js** as the driver
3. Copy the string — it looks like:
   ```
   mongodb+srv://llm-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add the database name before `?`:
   ```
   mongodb+srv://llm-admin:YOURPASS@cluster0.xxxxx.mongodb.net/llm-evaluator?retryWrites=true&w=majority
   ```

---

## Part 2 — Backend on Render

### 2.1 Push code to GitHub

Make sure your project is on GitHub. The repo can have both `frontend/` and `backend/` folders.

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/llm-evaluator.git
git push -u origin main
```

### 2.2 Create a Web Service on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `llm-evaluator-api` |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free (or Starter $7/mo for no spin-down) |

### 2.3 Add environment variables

In Render's **Environment** tab, add:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `MONGODB_URI` | your Atlas connection string |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `FRONTEND_URL` | `https://YOUR-APP.vercel.app` *(add after Vercel step)* |
| `NODE_ENV` | `production` |

### 2.4 Deploy

Click **Create Web Service**. The first deploy takes 3–5 minutes.

Note your backend URL: `https://llm-evaluator-api.onrender.com`

### 2.5 Verify backend is live

```bash
curl https://llm-evaluator-api.onrender.com/health
# {"status":"ok","environment":"production","timestamp":"..."}
```

> ⚠️ **Free Render tier spins down after 15 min inactivity.** First request after idle takes ~30s. Upgrade to Starter ($7/mo) to avoid this.

---

## Part 3 — Frontend on Vercel

### 3.1 Import project on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` *(auto-detected)* |
| **Output Directory** | `dist` *(auto-detected)* |

### 3.2 Add environment variable

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://llm-evaluator-api.onrender.com` |

### 3.3 Deploy

Click **Deploy**. Vercel builds and deploys in ~1 minute.

Your app URL: `https://llm-evaluator.vercel.app` (or similar)

---

## Part 4 — Final Wiring

### 4.1 Update CORS on Render

Now that you have your Vercel URL, go back to Render:

1. **Environment** → update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://llm-evaluator.vercel.app
   ```
2. Render auto-redeploys on env variable changes.

### 4.2 End-to-end test

1. Open your Vercel URL
2. Submit a prompt
3. Verify responses appear
4. Save an evaluation
5. Check History and Analytics pages

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `ANTHROPIC_API_KEY` | ✅ Yes | Anthropic API key (`sk-ant-...`) |
| `FRONTEND_URL` | ✅ Yes | Allowed CORS origin |
| `NODE_ENV` | No | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ Yes | Backend base URL (no trailing slash) |

---

## CI/CD (Auto-deploy on Push)

Both Vercel and Render automatically redeploy when you push to `main`:

```bash
git add .
git commit -m "Fix: update scoring logic"
git push origin main
# → Vercel rebuilds frontend automatically
# → Render rebuilds backend automatically
```

---

## Custom Domain (Optional)

**Vercel:** Settings → Domains → Add your domain → follow DNS instructions

**Render:** Settings → Custom Domains → Add domain → add CNAME to your DNS

---

## Monitoring & Logs

**Render logs:**
- Dashboard → your service → **Logs** tab
- Filter by `[generate]` or `[saveEvaluation]` to debug specific routes

**MongoDB Atlas:**
- Cluster → **Metrics** tab for connection counts and query stats
- **Data Explorer** to browse the `evaluations` collection directly

**Vercel:**
- Project → **Functions** tab (for SSR if you add it later)
- **Analytics** tab for Web Vitals

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `CORS error` in browser | Check `FRONTEND_URL` on Render matches your Vercel URL exactly |
| Backend returns 500 on generate | Check `ANTHROPIC_API_KEY` is set correctly in Render env vars |
| MongoDB connection fails | Verify Atlas IP whitelist includes `0.0.0.0/0`, check password has no special chars needing encoding |
| Render service cold start | First request after idle takes ~30s on free tier. Normal. |
| Vercel build fails | Make sure `Root Directory` is set to `frontend`, not the repo root |
| `VITE_API_URL` undefined | Vercel env vars must start with `VITE_` to be bundled into the client |
