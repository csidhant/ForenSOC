<div align="center">
  <img src="https://img.icons8.com/color/128/000000/shield.png" alt="ForenSOC Logo" width="100"/>
  <h1>🛡️ ForenSOC</h1>
  <p><strong>Advanced Integrated SOC & Digital Forensics Platform</strong></p>
  
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
  [![React](https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react)](https://reactjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
  [![Celery](https://img.shields.io/badge/Celery-Async_Tasks-37814A.svg?style=flat&logo=celery)](#)
  [![Status](https://img.shields.io/badge/Status-Production_Ready-success.svg)](#)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

<br />

## 📖 Overview

**ForenSOC** is an enterprise-grade, full-stack Security Operations Center (SOC) and Digital Forensics and Incident Response (DFIR) platform. Built to bridge the gap between real-time threat detection and post-incident forensic analysis, ForenSOC unifies log management, threat intelligence, case tracking, and deep forensic workflows into a single cohesive, high-performance web application.

Whether you are conducting memory analysis, triaging network PCAPs, or managing cross-team incident investigations, ForenSOC provides the tooling and architectural scalability necessary to protect and investigate modern environments.

---

## 📑 Table of Contents
- [✨ Enterprise Features](#-enterprise-features)
- [🔄 Core Architecture Workflow](#-core-architecture-workflow)
- [🚀 Quick Start Guide](#-quick-start-guide)
- [📂 Project Architecture](#-project-architecture)
- [📚 Technical Documentation](#-technical-documentation)
- [🛡️ Security & Performance Standards](#-security--performance-standards)
- [📄 License](#-license)

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
| **Real-time Alerting** | Multi-condition detection engine mapped directly to MITRE ATT&CK vectors. |
| **Threat Intelligence** | Automated enrichments via VirusTotal, Shodan, and AlienVault OTX integrations. |

### 💼 Case & Incident Management
| Feature | Description |
|---------|-------------|
| **Analyst Workflows** | Bulk assignment, prioritized queueing, and multi-tenant workspace isolation. |
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

---

## 🤖 Zero-Click Automation
ForenSOC is designed for ease of use. It features three layers of background automation:
1. **Live Local Collector**: Automatically polls the local Windows Security Event Log every 60 seconds.
2. **Folder Watcher**: Monitors `backend/ingest_drop/`. Any `.log` file placed here is automatically processed.
3. **Smart Analyst**: Explains technical alerts in natural language for non-technical users.

---

## 🔄 Core Architecture Workflow

ForenSOC operates on a sequential, highly integrated data pipeline:

1. **Ingest**: Raw logs, PCAPs, and Memory dumps are uploaded or streamed into the platform.
2. **Detect**: The backend normalizes the logs and passes them through the Sigma Rule Engine. Matches spawn Alerts.
3. **Investigate**: Alerts are bundled into Cases. Analysts upload physical evidence to the Forensics Vault.
4. **Analyze**: Background Celery workers trigger YARA/Volatility/Zeek modules on the evidence asynchronously.
5. **Reconstruct**: The system builds a unified, second-by-second timeline of the attack from all available data.
6. **Report**: PDF and MITRE mapping reports are finalized for compliance.

## 📚 Documentation
For a detailed guide on how to use ForenSOC, especially for students and new users, please refer to our comprehensive manual:
- **[Student's Guide to ForenSOC (PDF)](file:///c:/Users/Acer/Desktop/ForenSOC/backend/ForenSOC_Students_Guide.pdf)**

---

## 🛠️ Installation & Setup

### Prerequisites
- **Python 3.10+** (Added to `PATH`)
- **Node.js 18+ / LTS** (npm included)
- **Redis** (For async task processing)
- **PostgreSQL** (Recommended for production, SQLite used by default for rapid setup)
- **Docker & Docker Compose** (Optional, but highly recommended)

### 🐳 The Fast Way: Docker Compose (Full Stack)
The absolute fastest way to deploy ForenSOC is via Docker Compose, which spins up the Database, Redis, Celery Workers, the FastAPI backend, and the React frontend simultaneously.

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

#### 2. Start the Async Worker
In a separate terminal, ensure Redis is running, activate your backend virtual environment, and start Celery:
```bash
cd backend
celery -A app.celery_app:celery_app worker -l info
```

#### 3. Frontend Setup
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

- **Username**: `admin`
- **Email**: `admin@forensoc.local`
- **Password**: `admin`

---

## 📂 Project Architecture

```text
ForenSOC/
├── backend/                  # FastAPI Application Core
│   ├── app/
│   │   ├── api/              # RESTful route definitions
│   │   ├── crud/             # Database access layers
│   │   ├── models/           # SQLAlchemy ORM schemas
│   │   ├── schemas/          # Pydantic validation models
│   │   ├── services/         # Threat Intel, Forensics, Timeline logic
│   │   └── tasks/            # Celery asynchronous workers
│   ├── tests/                # Pytest suites
│   └── requirements.txt      # Python dependencies
├── frontend-react/           # React 18 + Vite + TypeScript Frontend
├── docs/                     # Technical documentation & architecture designs
│   ├── ARCHITECTURE_AND_API.md
│   ├── DATABASE_SCHEMA.md
│   └── PROJECT_DESIGN.md
├── docker-compose.yml        # Production deployment orchestration
└── IMPLEMENTATION_ROADMAP.md # Historical roadmap outlining the project's journey
```

---

## 📚 Technical Documentation
Detailed technical documentation can be found in the `docs/` folder of the repository:
- `docs/ARCHITECTURE_AND_API.md`: System design and API contract overview.
- `docs/DATABASE_SCHEMA.md`: Deep dive into entity relationships.
- `docs/PROJECT_DESIGN.md`: High-level design principles and UI wireframe notes.
- `docs/SETUP_GUIDE.md`: Elaborated local environment setup instructions.

---

## 🛡️ Security & Performance Standards
- **P95 API Response Times**: < 1000ms
- **Database Queries**: Optimized with standard SQLAlchemy indexing across user constraints.
- **Authentication**: Stateless JWT Authorization with hard Role-Based Access Control.
- **Scalability**: Fully asynchronous external forensic integrations via Redis/Celery.

---

## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.
