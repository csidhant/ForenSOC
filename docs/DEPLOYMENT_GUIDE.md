# ForenSOC Deployment Guide

> **Complete step-by-step guide to take ForenSOC from your local machine to live on the internet.**  
> Supports three deployment paths: Docker VPS, Render.com (free), and Vercel + Render split.

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Option A — Docker on a VPS (Full Control)](#option-a--docker-on-a-vps-recommended)
- [Option B — Render.com + Vercel (Free Tier)](#option-b--rendercom--vercel-free-tier)
- [Option C — GitHub Actions Auto-Deploy](#option-c--github-actions-auto-deploy-cicd)
- [Post-Deploy Checklist](#post-deploy-checklist)
- [Environment Variable Reference](#environment-variable-reference)
- [Troubleshooting](#troubleshooting)

---

## Overview & Architecture

ForenSOC is a **full-stack application** with two independently deployable layers:

```
┌─────────────────────────────────────────────────────────┐
│                    Internet / Browser                    │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
              ┌────────────▼────────────┐
              │   Nginx Reverse Proxy   │  ← Port 80/443
              │  (or Vercel CDN edge)   │
              └──────┬──────────┬───────┘
                     │          │
            /api/*   │          │  /* (static)
              ┌──────▼───┐  ┌───▼──────────┐
              │  FastAPI  │  │  React SPA   │
              │  Backend  │  │  (Vite dist) │
              │  :8000    │  │  (nginx/CDN) │
              └──────┬────┘  └──────────────┘
                     │
              ┌──────▼──────┐
              │ PostgreSQL  │
              │   :5432     │
              └─────────────┘
```

| Component | Language | Deployment Target |
|-----------|----------|-------------------|
| Backend API | Python / FastAPI | Render.com, Railway, or VPS |
| Frontend | React / TypeScript | Vercel, Netlify, or VPS nginx |
| Database | PostgreSQL | Render managed DB, Supabase, or VPS |

---

## Option A — Docker on a VPS (Recommended)

Best for: Full control, persistent data, custom domains, best performance.

**Providers:** DigitalOcean, Hetzner, Linode, AWS EC2, Azure VM  
**Cost:** ~$5–$10/month (4 GB RAM minimum recommended)

### Step 1 — Provision a Server

Create a Ubuntu 22.04 LTS VPS. Once you have SSH access:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### Step 2 — Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/ForenSOC.git
cd ForenSOC
```

> Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 3 — Configure Environment

```bash
# Create the root .env from the template
cp .env.example .env
nano .env
```

Fill in these values:

```env
POSTGRES_PASSWORD=YourStrongPasswordHere123!
SECRET_KEY=run-python-c-import-secrets-print-secrets-token-hex-32
ADMIN_USERNAME=admin
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=YourAdminPassword!
ALLOWED_ORIGINS_STR=https://yourdomain.com
```

Generate a secure `SECRET_KEY`:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Step 4 — Deploy with Docker Compose

```bash
# Production deployment (4 backend workers, resource limits)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Check all services are running
docker compose ps

# View logs
docker compose logs -f backend
```

Expected output:
```
forensoc-postgres   running (healthy)
forensoc-redis      running (healthy)
forensoc-backend    running (healthy)
forensoc-frontend   running
forensoc-nginx      running
```

### Step 5 — Access Your App

- **Web UI**: `http://YOUR-SERVER-IP`  
- **API Docs**: `http://YOUR-SERVER-IP/api/docs`

### Step 6 — Add a Custom Domain + HTTPS (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot -y

# Point your domain's A record to YOUR-SERVER-IP first, then:
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx.conf to add SSL (see nginx/nginx.conf — add ssl_certificate directives)
# Then rebuild the nginx container:
docker compose restart nginx
```

---

## Option B — Render.com + Vercel (Free Tier)

Best for: Zero-cost hosting, no server management, quick demos.  
**Limitation:** Free tier databases expire after 90 days on Render. Upgrade to Starter ($7/mo) for production.

### Part 1 — Deploy the Backend on Render.com

#### 1. Push code to GitHub

```bash
cd ForenSOC
git init                        # if not already a git repo
git add .
git commit -m "Initial ForenSOC deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ForenSOC.git
git push -u origin main
```

#### 2. Create a Render Blueprint

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Blueprint**
3. Connect your GitHub account and select the ForenSOC repository
4. Render will auto-detect `render.yaml` — click **Apply**
5. This creates:
   - `forensoc-backend` — Web Service (Python/FastAPI)
   - `forensoc-db` — Managed PostgreSQL database

#### 3. Wait for the first deploy (~3–5 minutes)

Watch the deploy logs in the Render dashboard. A successful deploy ends with:
```
INFO:     Application startup complete.
```

#### 4. Note your backend URL

It will look like: `https://forensoc-backend.onrender.com`  
Test it: `https://forensoc-backend.onrender.com/health` → should return `{"status":"healthy"}`

---

### Part 2 — Deploy the Frontend on Vercel

#### 1. Install Vercel CLI (one-time setup)

```bash
npm install -g vercel
```

#### 2. Set the backend URL in the frontend

Edit `frontend-react/vercel.json` and update:
```json
"env": {
  "VITE_API_BASE_URL": "https://forensoc-backend.onrender.com/api"
}
```

Commit and push this change:
```bash
git add frontend-react/vercel.json
git commit -m "Set production backend URL"
git push
```

#### 3. Deploy to Vercel

```bash
cd frontend-react
vercel login          # authenticate with GitHub/email
vercel               # follow the prompts:
                     #   - Set up a new project? Yes
                     #   - Which directory is your code? ./  (already in frontend-react)
                     #   - Detected Vite — correct? Yes
vercel --prod        # promote to production
```

Your frontend is now live at: `https://forensoc-SOMETHING.vercel.app`

#### 4. Wire CORS — Update Render Backend

1. Go to Render dashboard → `forensoc-backend` → **Environment**
2. Set `ALLOWED_ORIGINS_STR` = `https://forensoc-SOMETHING.vercel.app`
3. Click **Save Changes** → Render auto-redeploys

#### 5. Verify the full stack

1. Open `https://forensoc-SOMETHING.vercel.app`
2. Login with default credentials: `admin` / `ForenSOC@2024!`
3. **Change the password immediately** in Settings

---

## Option C — GitHub Actions Auto-Deploy (CI/CD)

Best for: Teams, continuous deployment on every `git push`.

### Setup (one-time)

#### 1. Link Vercel to your project

```bash
cd frontend-react
vercel link   # creates .vercel/project.json with org/project IDs
```

#### 2. Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Where to find it |
|-------------|-----------------|
| `RENDER_DEPLOY_HOOK_URL` | Render dashboard → backend service → **Deploy Hook** (copy the URL) |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | From `frontend-react/.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | From `frontend-react/.vercel/project.json` → `projectId` |

#### 3. Push to main — everything deploys automatically

```bash
git add .
git commit -m "Your feature"
git push origin main
```

The pipeline (`.github/workflows/deploy.yml`) will:
1. ✅ Run TypeScript type check + ESLint
2. ✅ Run Python backend tests
3. ✅ Build the frontend (catch build errors early)
4. ✅ Push Docker images to GitHub Container Registry
5. ✅ Trigger Render backend redeploy
6. ✅ Deploy frontend to Vercel

---

## Post-Deploy Checklist

After your first successful deployment, complete these security steps:

- [ ] **Change admin password** — Login → Settings → Change Password
- [ ] **Set a strong `SECRET_KEY`** — Never use the default in production
- [ ] **Set `ALLOWED_ORIGINS_STR`** — Only whitelist your actual frontend domain
- [ ] **Set `DEBUG=false`** — Disables verbose error output in API responses
- [ ] **Verify HTTPS** — All production traffic should be encrypted (Option A with Let's Encrypt, or Vercel/Render provide it automatically)
- [ ] **Test health endpoint** — `GET /health` should return `{"status":"healthy"}`
- [ ] **Test API docs** — `GET /api/docs` should load the Swagger UI
- [ ] **Test login** — Frontend should authenticate and load the dashboard

---

## Environment Variable Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | `sqlite:///./forensoc.db` | PostgreSQL or SQLite connection string |
| `SECRET_KEY` | ✅ | (weak default) | JWT signing key — generate with `secrets.token_hex(32)` |
| `DEBUG` | — | `false` | Set `true` only in local dev |
| `ALLOWED_ORIGINS_STR` | ✅ | `""` | Comma-separated frontend URLs for CORS |
| `ADMIN_USERNAME` | — | `admin` | Initial admin username |
| `ADMIN_EMAIL` | — | `admin@forensoc.local` | Initial admin email |
| `ADMIN_PASSWORD` | ✅ | `admin` | Initial admin password — **change immediately** |
| `UPLOAD_DIR` | — | `./uploads` | Path for evidence file uploads |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | — | `1440` | JWT token lifetime (24h default) |
| `REDIS_URL` | — | `redis://127.0.0.1:6379/0` | For async Celery tasks |
| `SLACK_WEBHOOK_URL` | — | `""` | Slack channel for critical alerts |

### Frontend (`frontend-react/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | ✅ | `http://127.0.0.1:8000/api` | Backend API base URL |
| `VITE_API_TIMEOUT` | — | `30000` | Request timeout in milliseconds |
| `VITE_APP_NAME` | — | `ForenSOC` | App display name |

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker compose logs backend

# Common causes:
# 1. DATABASE_URL is wrong — verify it matches your PostgreSQL connection string
# 2. SECRET_KEY is empty — it must be set
# 3. Port 8000 already in use — stop other services or change the port mapping
```

### Frontend shows "Network Error" / can't reach API

```bash
# 1. Check VITE_API_BASE_URL is set correctly in vercel.json or .env
# 2. Check ALLOWED_ORIGINS_STR on the backend includes your frontend domain
# 3. Verify /health endpoint is reachable from the browser:
curl https://your-backend.onrender.com/health
```

### Render free-tier database expired

Render's free PostgreSQL instances are deleted after 90 days. Upgrade to a paid plan:
- Render Starter: $7/month (persistent storage)
- Alternative: use [Supabase](https://supabase.com) free tier (no expiry, 500MB)

To use Supabase: copy the PostgreSQL connection string from Supabase dashboard → set it as `DATABASE_URL` in Render environment variables.

### Docker Compose containers keep restarting

```bash
# Check resource usage — free VPS may be out of memory
docker stats

# Check specific service logs
docker compose logs postgres
docker compose logs nginx
```

### CORS errors in browser console

Error: `Access-Control-Allow-Origin` header missing.

Fix: On Render/your backend, set `ALLOWED_ORIGINS_STR` to exactly match your frontend URL (including `https://` and no trailing slash):
```
ALLOWED_ORIGINS_STR=https://forensoc.vercel.app
```

### WebSocket connection fails (real-time feed not working)

The nginx reverse proxy handles Socket.IO. If using Vercel for the frontend and Render for backend, WebSockets must connect **directly to the backend URL** (not through Vercel's CDN).

Update `frontend-react/src/services/socketService.ts` to use the backend URL directly:
```typescript
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
```

Add to Vercel environment:
```
VITE_SOCKET_URL=https://forensoc-backend.onrender.com
```

---

*For further support, open an issue on GitHub or consult the `docs/` folder for architecture and API documentation.*
