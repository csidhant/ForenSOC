<div align="center">

# 🛡️ ForenSOC

**Advanced Integrated SOC & Digital Forensics Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)
[![Deploy to Render](https://img.shields.io/badge/Deploy-Render.com-46E3B7?style=flat&logo=render)](https://render.com)
[![Deploy to Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)

</div>

---

## What is ForenSOC?

ForenSOC is an open-source, enterprise-grade **Security Operations Center (SOC)** and **Digital Forensics & Incident Response (DFIR)** platform. It unifies log ingestion, real-time threat detection, case management, evidence analysis, and forensic reporting into a single polished web application — designed so that analysts with minimal experience can use it from day one.

It is purpose-built to rival commercial tools like IBM QRadar, Splunk SIEM, and TheHive — while being completely free to self-host.

---

## Screenshots & Key Features

| Dashboard | Alerts | Cases |
|-----------|--------|-------|
| Live stat cards, charts, threat map | Severity-coded feed, WS push, resolve | Priority-colored cards, search, filters |

### Core Capabilities

| Category | Features |
|----------|----------|
| 🔍 **Threat Detection** | Sigma rule engine, SSH brute-force, web scan detection, multi-failed-login rules |
| 📡 **Real-time** | WebSocket live alert feed, desktop toast notifications, Slack webhooks |
| 🗂️ **Case Management** | Full CRUD, priority/status tracking, timeline reconstruction, PDF reports |
| 🔬 **Digital Forensics** | YARA scanning, Volatility memory analysis, Zeek PCAP parsing, Suricata EVE |
| 🔒 **Evidence Vault** | SHA-256 + MD5 integrity, chain-of-custody tracking, secure download |
| 🌍 **Threat Intelligence** | GeoIP mapping, VirusTotal/Shodan/AlienVault enrichment, public IP/hash search |
| 📊 **Reporting** | One-click PDF export, MITRE ATT&CK ATT&CK heatmaps, audit trails |
| 🤖 **Automation** | Folder watcher (`ingest_drop/`), Windows Event Log poller, background workers |
| 👤 **Access Control** | JWT auth, bcrypt passwords, RBAC (admin / analyst / investigator / viewer) |
| 🎛️ **Command Palette** | Global keyboard-driven search center (`Ctrl+K`) for alerts, cases, evidence, rules, and system actions |
| 📚 **Glossary & Tour** | Searchable DFIR dictionary (Sigma, YARA, Zeek, Volatility), tooltips, and interactive onboarding tours |
| ⚡ **Premium Polish** | Glassmorphic textures, spring-animated quick action FAB, breadcrumbs trail, and loading skeleton grids |

---

## Quick Start — Three Ways to Run

### ⚡ Option 1: One-Click Windows (Local Dev)

```bat
run-forensoc.bat
```

Starts backend on `http://localhost:8000` and frontend on `http://localhost:3000` automatically.

---

### 🐳 Option 2: Docker Compose (Recommended for Local + Self-Hosted)

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/ForenSOC.git
cd ForenSOC

# Create your environment file
cp .env.example .env
# Edit .env and set a strong SECRET_KEY and POSTGRES_PASSWORD

# Start all services (nginx + backend + frontend + postgres + redis)
docker compose up --build -d

# Check everything is healthy
docker compose ps
```

| Service | URL |
|---------|-----|
| Web UI | http://localhost |
| API Docs (Swagger) | http://localhost/api/docs |
| Backend direct | http://localhost:8000 |

---

### ☁️ Option 3: Zero-Cost Online Hosting (Student-Friendly Setup)

Students can deploy a fully functioning, public-facing copy of ForenSOC online completely for **FREE**! This is perfect for portfolio showcases, homework assignments, or team labs. We leverage industry-standard cloud providers:
*   **GitHub**: Code repository
*   **Vercel**: Ultra-fast frontend hosting
*   **Render**: Python/FastAPI backend hosting
*   **Supabase**: Free persistent PostgreSQL database (prevents database deletion after 90 days)

For the detailed, visual layout see **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)**. Here is the direct 5-step quick-deploy pipeline:

#### Step 1: Create a Free Persistent Database (Supabase)
1.  Sign up for a free account at [Supabase.com](https://supabase.com).
2.  Click **New Project**, name it `ForenSOC-DB`, and set a strong database password.
3.  Once created, navigate to **Project Settings** → **Database** → **Connection String** → select **URI** (looks like `postgresql://postgres:[YOUR-PASSWORD]...`). Copy this connection string.

#### Step 2: Push Code to your GitHub
1.  Fork this repository to your own GitHub account.
2.  Clone your fork locally or work directly in your browser.

#### Step 3: Deploy the Backend on Render.com
1.  Sign up for a free account at [Render.com](https://render.com).
2.  Click **New +** (top right) → **Blueprint**.
3.  Connect your GitHub account and select your `ForenSOC` repository.
4.  Render will automatically read the built-in `render.yaml` blueprint. Click **Apply**.
5.  Wait for the environment initialization. Navigate to the created **forensoc-backend** Web Service:
    *   Go to **Environment** settings.
    *   Modify `DATABASE_URL` to be your **Supabase Connection URI** from Step 1.
    *   Change `SECRET_KEY` to a random long string (e.g. `my-student-secret-token-key-12345`).
    *   Click **Save Changes** (Render will auto-redeploy with your Supabase database!).
6.  Once live, copy the backend URL (e.g. `https://forensoc-backend-xxxx.onrender.com`).

#### Step 4: Deploy the Frontend on Vercel
1.  Sign up at [Vercel.com](https://vercel.com) using your GitHub account.
2.  Click **Add New** → **Project**, and select your `ForenSOC` GitHub repository.
3.  Vercel will detect a multi-workspace structure. **CRITICAL:** 
    *   Set **Root Directory** to `frontend-react`.
    *   Vercel will auto-detect Vite as the framework.
4.  Expand the **Environment Variables** section and add:
    *   `VITE_API_BASE_URL` = `https://[YOUR-RENDER-BACKEND-URL]/api` (from Step 3)
5.  Click **Deploy**. Within 2 minutes, Vercel will give you a live production URL (e.g., `https://forensoc-frontend.vercel.app`).

#### Step 5: Secure CORS Settings
1.  Go back to your **Render Dashboard** → **forensoc-backend** Web Service → **Environment**.
2.  Update `ALLOWED_ORIGINS_STR` = `https://[YOUR-VERCEL-FRONTEND-URL]` (from Step 4, no trailing slash).
3.  Click **Save Changes**. 

🎉 **Done!** Open your Vercel URL in your browser. You can now log in as any role (like `admin`/`admin` or `analyst`/`analyst`) from anywhere in the world!

---

---

## Authentication & Role-Based Login Options

ForenSOC provides a secure, flexible authentication system based on JWT (JSON Web Tokens) and Role-Based Access Control (RBAC). 

### 1. Available Login Types

*   **Demo & Quick-Start Login (Pre-seeded):**
    For quick local development, evaluation, and classroom environments, a pre-seeded administrator account is initialized automatically.
    *   **Username:** `admin`
    *   **Password:** `admin` (or `ForenSOC@2024!` depending on your `.env` settings)
    *   **Email:** `admin@forensoc.local`
    *   *Note: These credentials are conveniently suggested on the login interface for frictionless access.*

*   **Self-Registration Login:**
    New users can create their own custom accounts directly by clicking **Register now** on the login page (or navigating to `/register`). They can enter a unique username, email, and password, and instantly log in.

*   **API Token-Based Access (Backend):**
    Behind the scenes, all client interactions are authenticated using secure OAuth2 password bearer tokens. The server returns a JWT upon successful login, which the client includes in headers to securely invoke REST operations.

---

### 2. Available User Roles & Permissions

Each user in ForenSOC is associated with a distinct role, allowing granular visibility and action restrictions:

| Role | Username Example | Main Purpose / Permissions |
| :--- | :--- | :--- |
| 👑 **Admin** | `admin` | Full system administration, user provisioning, custom Sigma/YARA rules modification, and immutable system audit log visibility. |
| 🛡️ **Security Analyst** | *User-defined* | Real-time threat alert triage, threat mapping, search & query logs, managing alerts, and quick investigative actions. |
| 🔬 **Investigation Analyst** | *User-defined* | Deep incident response, Volatility memory forensics, Zeek network packet parsing, YARA scans, evidence custody management, timeline reconstruction, and security report compilation. |
| 📊 **Read-only Viewer** | *User-defined* | Observation role with read-only dashboard access. Ideal for compliance auditors, executives, and security posture monitoring. |

---

---

## Project Structure

```
ForenSOC/
├── backend/                    Python / FastAPI
│   ├── app/
│   │   ├── api/                17 route modules (auth, alerts, cases, evidence …)
│   │   ├── models/             SQLAlchemy ORM
│   │   ├── schemas/            Pydantic validation
│   │   ├── services/           Detection engine, forensics, threat intel, sockets
│   │   ├── crud/               Database access layer
│   │   └── tasks/              Celery async workers
│   ├── automation_service.py   Folder watcher + Windows Event Log poller
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend-react/             React 18 + Vite + TypeScript + MUI
│   ├── src/
│   │   ├── pages/              17 fully-built pages
│   │   ├── components/         Navigation, Routes, GlobalThreatMap
│   │   ├── services/           apiService, socketService
│   │   ├── theme/              Dark/Light glassmorphism MUI theme
│   │   └── types/              TypeScript definitions
│   ├── vercel.json             Vercel deployment config
│   ├── Dockerfile              Multi-stage build (Node → nginx)
│   └── .env.example
│
├── nginx/
│   └── nginx.conf              Production reverse proxy config
│
├── docs/
│   ├── DEPLOYMENT_GUIDE.md      ← How to go live (start here)
│   ├── ARCHITECTURE_AND_API.md  Full API contract & system design
│   ├── DATABASE_SCHEMA.md       Entity relationships & schema
│   ├── USER_GUIDE.md            End-user walkthrough
│   ├── USER_FRIENDLY_GUIDE.md   Onboarding, keyboard shortcuts, tooltips, glossary modal
│   ├── PHASE_2_COMPLETION_REPORT.md Phase 2 premium feature delivery log
│   ├── SECURITY.md              Security controls & hardening
│   └── QUICK_REFERENCE.md       Cheat-sheet for analysts
│
├── .github/
│   └── workflows/
│       └── deploy.yml          GitHub Actions CI/CD pipeline
│
├── docker-compose.yml          Full-stack compose (dev + prod)
├── docker-compose.prod.yml     Production hardening overlay
├── render.yaml                 Render.com one-click backend deploy
├── run-forensoc.bat            Windows one-click local start
└── .env.example                Root env template for docker-compose
```

---

## Security Model

| Control | Implementation |
|---------|---------------|
| Authentication | Stateless JWT (HS256, 24h expiry) |
| Password hashing | bcrypt with salting |
| Authorization | Hard RBAC — 4 roles, enforced per endpoint |
| Rate limiting | SlowAPI per-endpoint throttling (200 req/min default) |
| CORS | Strict origin allowlist — no wildcard `*` in production |
| SQL injection | SQLAlchemy ORM parameterized queries |
| Evidence integrity | SHA-256 + MD5 on every upload |
| Audit trail | Immutable log of all write operations |
| Transport | HTTPS enforced via nginx + Let's Encrypt (self-hosted) or auto via Vercel/Render |

---

## Documentation

| Document | Description |
|----------|-------------|
| **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** | How to deploy online — Docker VPS, Render+Vercel, CI/CD |
| **[USER_GUIDE.md](docs/USER_GUIDE.md)** | How to use the platform as an analyst |
| **[USER_FRIENDLY_GUIDE.md](docs/USER_FRIENDLY_GUIDE.md)** | Guide to onboarding, keyboard shortcuts, tooltips, and glossary modals |
| **[PHASE_2_COMPLETION_REPORT.md](docs/PHASE_2_COMPLETION_REPORT.md)** | Status log capturing the complete user-experience & forensic polish delivery |
| **[ARCHITECTURE_AND_API.md](docs/ARCHITECTURE_AND_API.md)** | API reference and system design |
| **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** | Full database schema and entity relationships |
| **[SECURITY.md](docs/SECURITY.md)** | Security controls, hardening guide, responsible disclosure |
| **[QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** | Quick cheat-sheet for analysts |

---

## CI/CD Pipeline

Every `git push` to `main` triggers the GitHub Actions pipeline (`.github/workflows/deploy.yml`):

```
Push to main
    │
    ├── TypeScript type check + ESLint
    ├── Python backend tests
    ├── Frontend build verification
    │
    ├── Build & push Docker images → GitHub Container Registry (GHCR)
    │
    ├── Deploy backend → Render.com (via deploy hook)
    └── Deploy frontend → Vercel (via CLI)
```

See [docs/DEPLOYMENT_GUIDE.md#option-c](docs/DEPLOYMENT_GUIDE.md#option-c--github-actions-auto-deploy-cicd) for setup instructions.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push and open a Pull Request against `main`

All PRs must pass the CI pipeline (type check, lint, build) before merging.

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ by the ForenSOC team · <a href="docs/DEPLOYMENT_GUIDE.md">Deploy it now</a>
</div>
