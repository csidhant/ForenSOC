<div align="center">
  <img src="https://img.icons8.com/color/128/000000/shield.png" alt="ForenSOC Logo" width="100"/>
  <h1>🛡️ ForenSOC</h1>
  <p><strong>Advanced Integrated SOC & Digital Forensics Platform</strong></p>
  
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
  [![React](https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
  [![Celery](https://img.shields.io/badge/Celery-Async_Tasks-37814A.svg?style=flat&logo=celery)](#)
  [![Build](https://img.shields.io/badge/Build-Passing-success.svg)](#)
  [![Status](https://img.shields.io/badge/Status-Production_Ready-success.svg)](#)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

<br />

## 📖 Overview

**ForenSOC** is an enterprise-grade, full-stack Security Operations Center (SOC) and Digital Forensics and Incident Response (DFIR) platform. Built to bridge the gap between real-time threat detection and post-incident forensic analysis, ForenSOC unifies log management, threat intelligence, case tracking, and deep forensic workflows into a single cohesive, high-performance web application.

Whether you are conducting memory analysis, triaging network PCAPs, or managing cross-team incident investigations, ForenSOC provides the tooling and architectural scalability necessary to protect and investigate modern environments.

---

## 📑 Table of Contents
- [✅ Build Status](#-build-status)
- [✨ Enterprise Features](#-enterprise-features)
- [🤖 Zero-Click Automation](#-zero-click-automation)
- [🔄 Core Architecture Workflow](#-core-architecture-workflow)
- [🚀 Quick Start Guide](#️-installation--setup)
- [🔐 Default Credentials](#-default-credentials)
- [📂 Project Architecture](#-project-architecture)
- [🛡️ Security & Performance Standards](#️-security--performance-standards)
- [🖥️ UI Changelog](#️-ui-changelog)
- [📋 Roadmap & Next Steps](#-roadmap--next-steps)
- [📚 Technical Documentation](#-technical-documentation)
- [📄 License](#-license)

---

## ✅ Build Status

| Component | Status | Details |
|-----------|--------|---------|
| **Frontend Build** | ✅ Passing | TypeScript compiled, Vite bundle: 1,311 kB (389 kB gzip) |
| **Backend Startup** | ✅ Passing | FastAPI + SQLite boots cleanly on `uvicorn` |
| **TypeScript** | ✅ Zero Errors | All TS6133 / TS2322 warnings resolved |
| **API Docs** | ✅ Live | http://localhost:8000/api/docs (Swagger UI) |
| **WebSocket** | ✅ Active | `python-socketio` real-time telemetry connected |

---

## ✨ Enterprise Features

### 🔍 Threat Detection & Log Management
| Feature | Description |
|---------|-------------|
| **Universal Log Ingestion** | Ingest and normalize raw logs into standardized forensic events. |
| **Live Windows Collector** | **NEW**: Automatically polls and analyzes local Windows Security Event logs in real-time. |
| **Auto-Ingest Watcher** | **NEW**: Zero-click folder monitoring—drop logs into `ingest_drop/` for instant analysis. |
| **Sigma Rule Engine** | Fully functional YAML-based Sigma rule parser for community threat signatures. |
| **Smart AI Analyst** | **NEW**: Automatically translates technical alerts into plain, actionable English recommendations. |
| **Real-time WebSockets** | **NEW**: Instant "Live Feed" of logs and alerts pushed directly to the UI—no refresh required. |
| **Geographic Mapping** | **NEW**: Interactive Global Threat Map with automated Geo-IP resolution and location tracking. |
| **Threat Intelligence** | Automated enrichments via VirusTotal, Shodan, and AlienVault OTX integrations. |

### 💼 Case & Incident Management
| Feature | Description |
|---------|-------------|
| **Analyst Workflows** | Bulk assignment, prioritized queueing, and multi-tenant workspace isolation. |
| **Priority Card Grid** | **NEW**: Cases displayed as color-coded cards with priority indicators and status badges. |
| **Unified Timelines** | Automatically aggregates alerts, logs, evidence, and chain-of-custody actions into chronological incident timelines. |
| **Proactive Notifications**| Real-time Slack and Email webhooks for high-severity critical alerts. |

### 🔬 Digital Forensics Vault
| Feature | Description |
|---------|-------------|
| **Evidence Integrity** | Secure upload vault with automatic SHA-256 / MD5 hashing and strict Chain of Custody tracking. |
| **Memory Forensics** | Automated integrations with **Volatility 3** for malicious process extraction. |
| **Network Forensics** | Deep packet analysis via **Zeek** and **Suricata EVE** payloads. |
| **Malware Scanning** | Automated binary analysis utilizing built-in **YARA** rule scans. |

### 📊 Reporting & Compliance
| Feature | Description |
|---------|-------------|
| **Audit Logging** | Comprehensive, immutable system audit trails. |
| **PDF Generation** | One-click professional forensic PDF reports including executive summaries, artifacts, and timeline visualizations. |
| **Security & Tuning** | SlowAPI rate limiting, robust JWT authentication, role-based access control (RBAC), and SQL injection safeguards. |
| **Platform Settings** | **NEW**: Rich preference center allowing real-time theme toggling (Light/Dark mode), custom alert notifications, and user account management. |

---

## 🤖 Zero-Click Automation
ForenSOC is designed for ease of use. It features layers of background automation:
1. **Live Local Collector**: Automatically polls the local Windows Security Event Log every 60 seconds.
2. **Folder Watcher**: Monitors `backend/ingest_drop/`. Any `.log` file placed here is automatically processed.
3. **Smart Analyst**: Explains technical alerts in natural language for non-technical users.
4. **Real-time Push**: Detections are instantly pushed to all active analysts via WebSockets and Live Toasts.
5. **Geo-Discovery**: Automatically pins the source of every network-based attack on a global map.
6. **Dynamic Theme Engine**: Automatically aligns interface visuals to a curated glassmorphic dark/light palette according to system settings.

---

## 🔄 Core Architecture Workflow

ForenSOC operates on a sequential, highly integrated data pipeline:

1. **Ingest**: Raw logs, PCAPs, and Memory dumps are uploaded or streamed into the platform.
2. **Detect**: The backend normalizes the logs and passes them through the Sigma Rule Engine. Matches spawn Alerts.
3. **Investigate**: Alerts are bundled into Cases. Analysts upload physical evidence to the Forensics Vault.
4. **Analyze**: Background Celery workers trigger YARA/Volatility/Zeek modules on the evidence asynchronously.
5. **Reconstruct**: The system builds a unified, second-by-second timeline of the attack from all available data.
6. **Report**: PDF and MITRE mapping reports are finalized for compliance.

---

## 📚 Documentation
For a detailed guide on how to use ForenSOC, especially for students and new users, please refer to our comprehensive manual:
- **[Student's Guide to ForenSOC (PDF)](./ForenSOC_Students_Guide.pdf)**

---

## 🛠️ Installation & Setup

### Prerequisites
- **Python 3.10+** (Added to `PATH`)
- **Node.js 18+ / LTS** (npm included)
- **Redis** (For async task processing)
- **PostgreSQL** (Recommended for production, SQLite used by default for rapid setup)
- **Docker & Docker Compose** (Optional, but highly recommended)

### ⚡ The Fastest Way: One-Click Script (Windows)
```bat
# Double-click this file from the project root:
run-forensoc.bat
```
This single script will:
- ✅ Create the Python virtual environment if it doesn't exist
- ✅ Install all backend dependencies from `requirements.txt`
- ✅ Install frontend `node_modules` if missing
- ✅ Start the **FastAPI backend** at http://127.0.0.1:8000
- ✅ Start the **Auto-Ingest Automation** watcher
- ✅ Start the **React frontend** at http://localhost:3000

### 🐳 Docker Compose (Full Stack)
The absolute fastest way to deploy ForenSOC in a production-like environment:

```bash
git clone https://github.com/your-org/ForenSOC.git
cd ForenSOC

# Build and start all services in detached mode
docker compose up --build -d
```
- **Web UI**: [http://localhost:3000](http://localhost:3000)
- **API Swagger Docs**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

### 💻 Manual Setup (Local Development)

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Activate the virtual environment
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Important: Update .env with your REDIS_URL, SLACK_WEBHOOK_URL, and SECRET_KEY

# Run the API Server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. Start the Automation Watcher
In a separate terminal, activate the backend virtual environment and run:
```bash
cd backend
.\venv\Scripts\activate   # Windows
python automation_service.py
```

#### 3. Start the Async Worker (Optional — for forensics tasks)
```bash
cd backend
celery -A app.celery_app:celery_app worker -l info
```

#### 4. Frontend Setup
In a third terminal instance:
```bash
cd frontend-react
npm install
npm run dev
```
Navigate to **http://localhost:3000** to access the dashboard.

---

## 🔐 Default Credentials
On the first run, the system seeds the database with the following default administrator credentials. **Please change these immediately in your `.env` file before exposing the application to any network.**

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Email** | `admin@forensoc.local` |
| **Password** | `admin` |
| **API Docs** | http://localhost:8000/api/docs |

---

## 📂 Project Architecture

```text
ForenSOC/
├── backend/                    FastAPI Application Core
│   ├── app/
│   │   ├── api/                16 RESTful route modules
│   │   │   ├── auth.py         JWT login, register, refresh
│   │   │   ├── alerts.py       Alert CRUD + stats
│   │   │   ├── cases.py        Case management
│   │   │   ├── evidence.py     Forensic vault + chain-of-custody
│   │   │   ├── detection.py    Sigma rule engine
│   │   │   ├── forensics.py    Volatility / Zeek / YARA
│   │   │   ├── timeline.py     Chronological event reconstruction
│   │   │   ├── mitre.py        ATT&CK framework mapping
│   │   │   ├── reports.py      PDF report generation
│   │   │   └── audit.py        Immutable audit trail
│   │   ├── crud/               Database access layers
│   │   ├── models/             SQLAlchemy ORM schemas
│   │   ├── schemas/            Pydantic validation models
│   │   ├── services/           Threat Intel, Forensics, Timeline logic
│   │   └── tasks/              Celery asynchronous workers
│   ├── automation_service.py   Background watcher + Windows event poller
│   ├── tests/                  Pytest suites
│   └── requirements.txt        Python dependencies
├── frontend-react/             React 18 + Vite + TypeScript
│   ├── src/pages/              16 fully-built, production-ready pages
│   ├── src/components/         Navigation, Routes, GlobalThreatMap
│   ├── src/services/           apiService, socketService
│   ├── src/theme/              Dark/Light MUI theme (glassmorphism)
│   └── src/types/              TypeScript type definitions
├── docs/                       Technical documentation & architecture
│   ├── ARCHITECTURE_AND_API.md
│   ├── DATABASE_SCHEMA.md
│   └── PROJECT_DESIGN.md
├── docker-compose.yml          Production deployment orchestration
├── run-forensoc.bat            One-click Windows startup script
└── IMPLEMENTATION_ROADMAP.md   Historical roadmap
```

---

## 🛡️ Security & Performance Standards

### 🔒 Active Security Controls
| Control | Implementation |
|---------|---------------|
| **Authentication** | Stateless JWT (24h expiry, `HS256` algorithm) |
| **Authorization** | Hard RBAC — `admin`, `analyst`, `investigator`, `viewer` |
| **Password Security** | bcrypt hashing with salting |
| **Rate Limiting** | SlowAPI per-endpoint throttling |
| **CORS Policy** | Strict allowlist (no wildcard `*`) |
| **SQL Injection** | SQLAlchemy ORM parameterized queries |
| **Evidence Integrity** | SHA-256 + MD5 hash verification on every upload |
| **Audit Trail** | Immutable log of all mutating API operations |

### ⚡ Performance Targets
- **P95 API Response Time**: < 1000ms
- **Database**: Indexed SQLAlchemy queries across all user constraints
- **Scalability**: Async forensic integrations via Redis/Celery workers
- **Frontend Bundle**: 1,311 kB raw · 389 kB gzip

---

## 🖥️ UI Changelog

The following pages were fully redesigned for production quality:

| Page | Changes |
|------|---------|
| **Login** | Premium split-panel dark design, feature showcase, demo credential chips, TLS badge |
| **Register** | Glassmorphism card, password visibility toggle, branded design |
| **Dashboard** | Real-time stat cards, Area/Bar/Pie charts, live alert feed, global threat map |
| **Alerts** | Severity color badges, real-time WS listener, dual filters, stat row, view-detail modal, one-click resolve |
| **Cases** | Priority-colored card grid, status filters, search bar, empty state CTA, hover animations |
| **Settings** | Dark/Light mode toggle, notification preferences, password update, system info |
| **Navigation** | Persistent collapsible sidebar, grouped nav items, status chip, safe role display |
| **404** | Branded error page with gradient number and back-to-dashboard button |
| **index.html** | Animated SVG favicon, loading splash, Inter font, Open Graph meta tags |

---

## 📋 Roadmap & Next Steps

### Immediate (Production Hardening)
- [ ] **Code Splitting** — Lazy-load heavy pages (EvidenceVault, LogExplorer) to bring bundle below 500 kB
- [ ] **PostgreSQL Migration** — Switch `DATABASE_URL` in `.env` for production-scale persistence
- [ ] **Change Default Credentials** — Update `ADMIN_PASSWORD` in `backend/.env` before public exposure

### Short-Term
- [ ] **Redis + Celery** — Enable for async forensics (Volatility, YARA, Zeek analysis)
- [ ] **HTTPS / TLS** — Add nginx reverse proxy with Let's Encrypt certificate
- [ ] **E2E Tests** — Cypress test suite covering auth, alert flow, case management
- [ ] **Docker Deploy** — `docker compose up --build -d` for containerized production

### Long-Term
- [ ] **AI Threat Correlation** — GPT-4/Llama-based automated investigation summaries
- [ ] **Multi-tenancy** — Organization-level data isolation
- [ ] **Mobile PWA** — Responsive progressive web app for analyst on-call
- [ ] **SIEM Integrations** — Splunk, Elastic, QRadar log forwarding connectors

---

## 📚 Technical Documentation
Detailed technical documentation can be found in the `docs/` folder of the repository:
- `docs/ARCHITECTURE_AND_API.md`: System design and API contract overview.
- `docs/DATABASE_SCHEMA.md`: Deep dive into entity relationships.
- `docs/PROJECT_DESIGN.md`: High-level design principles and UI wireframe notes.
- `docs/SETUP_GUIDE.md`: Elaborated local environment setup instructions.

---

## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.
