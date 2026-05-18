# ForenSOC — Deployment Guide

**Version**: 1.0.0 | **Last Updated**: May 2026 | **Audience**: DevOps, System Administrators

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Local Development Setup](#4-local-development-setup)
5. [Cloud Deployment — Free Tier](#5-cloud-deployment--free-tier)
   - [5.1 Push to GitHub](#51-push-to-github)
   - [5.2 Deploy Backend on Render](#52-deploy-backend-on-render)
   - [5.3 Deploy Frontend on Vercel](#53-deploy-frontend-on-vercel)
   - [5.4 Connect Frontend to Backend](#54-connect-frontend-to-backend)
6. [Docker Compose Deployment](#6-docker-compose-deployment)
7. [Production Hardening Checklist](#7-production-hardening-checklist)
8. [Monitoring & Health Checks](#8-monitoring--health-checks)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Overview

ForenSOC is a full-stack application composed of two independently deployable services:

| Service | Technology | Recommended Platform |
|---------|------------|---------------------|
| **Backend API** | Python 3.11 + FastAPI + SQLAlchemy | [Render](https://render.com) (free tier) |
| **Frontend UI** | React 18 + TypeScript + Vite | [Vercel](https://vercel.com) (free tier) |
| **Database** | PostgreSQL 15 | Render Managed PostgreSQL (free tier) |

> **Local Development** uses SQLite by default — no PostgreSQL installation required.

---

## 2. Prerequisites

### For Local Development

| Requirement | Minimum Version | Check |
|-------------|-----------------|-------|
| Python | 3.10+ | `python --version` |
| Node.js | 18 LTS+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | 2.30+ | `git --version` |

### For Production (Cloud)

| Requirement | Details |
|-------------|---------|
| GitHub account | Free — https://github.com |
| Render account | Free — https://render.com (sign in with GitHub) |
| Vercel account | Free — https://vercel.com (sign in with GitHub) |

---

## 3. Environment Variables Reference

### Backend Variables (`backend/.env`)

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `DATABASE_URL` | `string` | `sqlite:///./forensoc.db` | ✅ | Database connection string |
| `SECRET_KEY` | `string` | *(weak default)* | ✅ | JWT signing key — **must change in production** |
| `ALGORITHM` | `string` | `HS256` | — | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `int` | `1440` | — | Session duration (24 hours) |
| `DEBUG` | `bool` | `false` | — | Enable verbose error responses |
| `ALLOWED_ORIGINS_STR` | `string` | `""` | ✅ prod | Comma-separated frontend URLs for CORS |
| `ADMIN_USERNAME` | `string` | `admin` | — | Default admin username |
| `ADMIN_EMAIL` | `string` | `admin@forensoc.local` | — | Default admin email |
| `ADMIN_PASSWORD` | `string` | `admin` | ✅ | **Must change immediately** |
| `UPLOAD_DIR` | `string` | `./uploads` | — | Evidence file storage path |
| `MAX_UPLOAD_SIZE` | `int` | `524288000` | — | Max upload bytes (500 MB) |
| `REDIS_URL` | `string` | `redis://127.0.0.1:6379/0` | — | Redis for Celery (optional) |
| `SLACK_WEBHOOK_URL` | `string` | `""` | — | Slack webhook for alerts (optional) |

### Frontend Variables (`frontend-react/.env.production`)

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `VITE_API_BASE_URL` | `string` | ✅ | Full backend API URL (e.g., `https://forensoc-backend.onrender.com/api`) |
| `VITE_API_URL` | `string` | ✅ | Backend root URL for WebSocket connections |
| `VITE_APP_NAME` | `string` | — | Application display name |
| `VITE_ENABLE_WEBSOCKET` | `bool` | — | Enable real-time alerts (default: `true`) |

#### Generating a Secure SECRET_KEY

```bash
# Python one-liner — run this and paste the output into your env
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 4. Local Development Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ForenSOC.git
cd ForenSOC
```

### Step 2 — Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env if needed (defaults work out-of-the-box for local dev)
```

### Step 3 — Start the Backend

```bash
# From the /backend directory with venv activated
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API is now available at:
- **Swagger UI**: http://127.0.0.1:8000/api/docs
- **ReDoc**: http://127.0.0.1:8000/api/redoc
- **Health Check**: http://127.0.0.1:8000/health

> The database tables and default admin account are created automatically on first startup.

### Step 4 — Frontend Setup

Open a second terminal:

```bash
cd frontend-react
npm install
npm run dev
```

The application is now available at **http://localhost:3000**.

### Step 5 — Login

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin` |

### Step 6 — (Optional) Automation Watcher

```bash
# Opens a third terminal — watches ingest_drop/ folder for log files
cd backend
venv\Scripts\activate
python automation_service.py
```

Drop any `.log` file into `backend/ingest_drop/` for automatic ingestion.

### One-Click Start (Windows Only)

```bat
run-forensoc.bat
```

This script opens three terminal windows and handles all of the above steps automatically.

---

## 5. Cloud Deployment — Free Tier

> **Total cost**: $0 | **Estimated time**: 20–30 minutes

### 5.1 Push to GitHub

**Initialize and push your repository:**

```bash
cd ForenSOC

git init
git add .
git commit -m "feat: initial ForenSOC production release"
git branch -M main

# Create a repo at https://github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/ForenSOC.git
git push -u origin main
```

> **Security Note**: The `.gitignore` file will automatically exclude `.env` files, `*.db` databases, `uploads/`, and `node_modules/`. Your credentials will never be committed.

---

### 5.2 Deploy Backend on Render

#### A. Create a PostgreSQL Database

1. Sign in at https://render.com with your GitHub account
2. Click **New → PostgreSQL**
3. Configure:
   - **Name**: `forensoc-db`
   - **Region**: Oregon (US West) — free tier
   - **Plan**: Free
4. Click **Create Database**
5. Once created, click the database → copy the **"External Database URL"**

#### B. Create the Backend Web Service

1. Click **New → Web Service**
2. Select **"Build and deploy from a Git repository"**
3. Connect your **ForenSOC** repository
4. Configure:

   | Setting | Value |
   |---------|-------|
   | **Name** | `forensoc-backend` |
   | **Region** | Oregon (US West) |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | **Plan** | Free |

#### C. Set Environment Variables

In the **Environment** tab, add the following key-value pairs:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | *(Paste the External Database URL from Step A)* |
| `SECRET_KEY` | *(Click "Generate" — Render creates a cryptographically secure key)* |
| `DEBUG` | `false` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_EMAIL` | `admin@forensoc.local` |
| `ADMIN_PASSWORD` | `ForenSOC@2024!` ← *Change this after first login* |
| `ALLOWED_ORIGINS_STR` | *(Leave blank for now — you'll add the Vercel URL in Step 5.4)* |

#### D. Deploy

Click **Create Web Service**. The initial build takes 3–7 minutes.

**Verify deployment:**
```
https://forensoc-backend.onrender.com/health
```

Expected response:
```json
{ "status": "healthy", "service": "ForenSOC", "version": "1.0.0" }
```

---

### 5.3 Deploy Frontend on Vercel

#### A. Import the Project

1. Sign in at https://vercel.com with your GitHub account
2. Click **Add New → Project**
3. Find and select your **ForenSOC** repository
4. Set **Root Directory** to `frontend-react`
5. Vercel will auto-detect **Vite** as the framework

#### B. Set Environment Variables

Before clicking **Deploy**, expand **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://forensoc-backend.onrender.com/api` |
| `VITE_API_URL` | `https://forensoc-backend.onrender.com` |
| `VITE_APP_NAME` | `ForenSOC` |
| `VITE_ENABLE_WEBSOCKET` | `true` |

#### C. Deploy

Click **Deploy**. Build completes in approximately 2 minutes.

Your live URL will be:
```
https://forensoc-YOUR-UNIQUE-ID.vercel.app
```

You can set a custom domain in **Vercel → Project Settings → Domains**.

---

### 5.4 Connect Frontend to Backend

Now that both services are deployed, configure CORS on the backend to allow your Vercel URL:

1. Go to **Render → forensoc-backend → Environment**
2. Edit `ALLOWED_ORIGINS_STR`
3. Set the value to your Vercel URL:
   ```
   https://forensoc-YOUR-UNIQUE-ID.vercel.app
   ```
4. Click **Save Changes** — Render will automatically redeploy

> If you set up a custom domain on Vercel, add that domain here instead.

---

### 5.5 Verify the Live Deployment

1. Open your Vercel URL in any browser
2. Log in with the admin credentials you set in the Render environment variables
3. Navigate through the dashboard, create a test case, and verify data persists

---

## 6. Docker Compose Deployment

Use Docker Compose for a self-hosted production environment on a VPS (DigitalOcean, Linode, AWS EC2, etc.):

```bash
# Clone the repository on your server
git clone https://github.com/YOUR_USERNAME/ForenSOC.git
cd ForenSOC

# Create backend environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your production values

# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f backend

# Stop all services
docker compose down
```

**Services started:**

| Container | Port | Description |
|-----------|------|-------------|
| `forensoc-postgres` | 5432 | PostgreSQL 15 database |
| `forensoc-backend` | 8000 | FastAPI REST API |
| `forensoc-frontend` | 3000 | React web application |
| `forensoc-celery` | — | Async forensics workers |

---

## 7. Production Hardening Checklist

Before exposing ForenSOC to the internet, complete these steps:

### Security
- [ ] Change `ADMIN_PASSWORD` to a strong password (12+ chars, mixed case, symbols)
- [ ] Generate a new `SECRET_KEY` using `python -c "import secrets; print(secrets.token_hex(32))"`
- [ ] Set `DEBUG=false`
- [ ] Restrict `ALLOWED_ORIGINS_STR` to only your frontend domain — never use `*`
- [ ] Enable HTTPS on all endpoints (Render and Vercel provide this automatically)
- [ ] Review and rotate credentials after 90 days

### Database
- [ ] Switch from SQLite to PostgreSQL for any multi-user deployment
- [ ] Enable automated database backups (Render free tier: 1 backup/day for 1 day)
- [ ] Test database restore procedure before go-live

### Operations
- [ ] Set up an uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com) — free) pointing to `/health`
- [ ] Configure Slack notifications (`SLACK_WEBHOOK_URL`) for critical alerts
- [ ] Document custom admin credentials securely in a password manager

---

## 8. Monitoring & Health Checks

### Health Endpoint

```
GET /health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "ForenSOC",
  "version": "1.0.0"
}
```

### Keeping the Free Tier Awake

Render's free tier spins down services after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to respond.

**Solutions:**
1. **UptimeRobot (free)** — Create an HTTP monitor pinging `/health` every 5 minutes
   - URL: `https://forensoc-backend.onrender.com/health`
   - Interval: 5 minutes
   - Alert email: your email
2. **Render Starter Plan ($7/month)** — Always-on service with no spin-down

### Application Logs

```bash
# Docker deployment
docker compose logs -f backend

# Render
# Dashboard → forensoc-backend → Logs
```

---

## 9. Troubleshooting

### Login fails: "Network Error" or 401

| Cause | Solution |
|-------|----------|
| Wrong `VITE_API_BASE_URL` | Confirm it exactly matches your Render URL including `/api` |
| CORS not configured | Add your Vercel URL to `ALLOWED_ORIGINS_STR` on Render |
| Backend not running | Check Render logs; verify health endpoint returns 200 |

### Backend shows "Application Error" on Render

1. Open **Render → forensoc-backend → Logs**
2. Most common causes:
   - `DATABASE_URL` incorrect format — PostgreSQL URLs must start with `postgresql://` not `postgres://`
   - Missing environment variable — verify all required vars are set
   - Build failed — check the **Build** tab for pip install errors

### "relation does not exist" database error

The database tables haven't been created yet. This usually means the app is connecting to an empty database.

```bash
# Force table creation (runs automatically on startup — check logs)
# If it didn't run, restart the service from the Render dashboard
```

### Frontend shows blank page after deployment

1. Check **Vercel → Deployments → Functions** tab for build errors
2. Confirm `VITE_API_BASE_URL` is set in Vercel environment variables
3. Ensure `vercel.json` exists in `frontend-react/` with the SPA rewrite rule

### Uploads failing on Render (free tier)

Render's free tier uses an ephemeral filesystem — uploaded files are deleted on each deploy/restart.

**Solutions:**
- Use [Cloudflare R2](https://cloudflare.com/r2) or [Backblaze B2](https://backblaze.com) (both free tier) for persistent file storage
- Upgrade to Render's paid tier which includes persistent disks

---

*Document maintained by the ForenSOC development team.*
