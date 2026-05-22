# 🛡️ ForenSOC

### **Advanced Integrated Security Operations Center (SIEM) & Digital Forensics Workspace**

ForenSOC is a premium, enterprise-grade, open-source **Security Operations Center (SOC)** and **Digital Forensics & Incident Response (DFIR)** platform. It integrates log ingestion, real-time threat detection (Sigma rules engine), collaborative case management, interactive network/memory forensics, and audit-compliant reporting into a stunning, responsive, dark-mode dashboard.

---

## 🖥️ Platform Showcase & Interface Gallery

Experience the premium glassmorphic interface, tailored HSL color schemes, and responsive animations of ForenSOC:

### 📊 Security posture & Live SIEM Dashboard
*Analyze real-time events, monitor global threat metrics, and track dynamic log source ingestion.*
![Security Posture & SIEM Dashboard](screenshort/Screenshot%202026-05-22%20130105.png)

### 🛡️ Detection Rules Engine (Sigma Rules)
*Manage custom Sigma and Suricata rules, run manual historical scans across your entire index, and map threats instantly to MITRE ATT&CK techniques.*
![Detection Rules Workspace](screenshort/Screenshot%202026-05-22%20210659.png)

### 🔬 Network & Memory Forensics Workspace
*Upload PCAP, Memory Dumps, or Suricata EVE JSON files to run automated Volatility, Zeek, and YARA-based packet/payload analysis.*
![Network & Memory Forensics Workspace](screenshort/Screenshot%202026-05-22%20210710.png)

### 🗂️ Case Management & Audit Trails
*Maintain chain-of-custody tracking with SHA-256 validation, generate expert reports, and inspect system audit logs.*
![Case Management & Audit Logs](screenshort/Screenshot%202026-05-22%20210800.png)

---

## ✨ Core Capabilities

| Pillar | Features & Implementations |
| :--- | :--- |
| 🔍 **Real-time SIEM & Detection** | Multi-threaded Sigma rule parsing, Suricata integration, custom pattern filters, time-window brute force threshholding, and live WebSocket feed updates. |
| 🔬 **Digital Forensics (DFIR)** | Volatility 3 RAM analysis, Zeek network extraction, YARA file scanners, and automated packet capture statistics. |
| 🔒 **Evidence Vault** | Immutable cryptographic file hash verification (SHA-256 + MD5), automated chain-of-custody logs, and role-based download controls. |
| 🗂️ **Case & SLA Management** | Triage timelines, severity SLA markers, automated timeline rebuilding, task assignments, and customizable workflows. |
| 🤖 **Local Security Polling** | Real-time folder watching (`ingest_drop/`) and continuous Windows Security Event Log parsing via PowerShell automation. |
| 📊 **Reporting & Audit** | Single-click PDF case reports, dynamic global MITRE ATT&CK technique heatmaps, and tamper-resistant audit logs. |
| 🎛️ **Analyst Polish** | Global Keyboard Command Palette (`Ctrl+K`), built-in onboarding tour guides, tooltips, and an in-app DFIR Glossary database. |

---

## 🛠️ Resolved Issues & QA Hardening

Through rigorous unit, integration, and manual QA validation, the following critical platform stability improvements were successfully resolved:

1. **Rule Engine Crash Fix (`/api/detection/rules`)**:
   * *Problem:* API list and rule creation endpoints threw `NameError` due to missing `DetectionRule` and `Alert` model imports in the FastAPI endpoint module.
   * *Solution:* Resolved and imported core database models, establishing complete endpoint connectivity.
2. **Historical Scan Coroutine Error**:
   * *Problem:* Triggering manual scans from the UI resulted in an unhandled backend exception: `TypeError: object of type 'coroutine' has no len()` because the synchronous `scan_historical_events` method returned an un-awaited coroutine from `process_events_batch`.
   * *Solution:* Fully refactored `scan_historical_events` into an asynchronous method and integrated `await` calls on batch event processing.
3. **Alert Generation Column Mismatch**:
   * *Problem:* Alert creation crashed during rules scans due to missing DB columns (`status`, `raw_event_id`, and `detection_rule_id`) in the `AlertCRUD.create_alert` parameter signature.
   * *Solution:* Added missing columns into the CRUD creator and fully mapped database schemas for robust threat alerts.
4. **Duplicate Decorator Refactoring**:
   * *Problem:* Redundant `@staticmethod` decorators identified in `EventCRUD` causing console syntax alerts.
   * *Solution:* Cleaned up decorator declarations to conform to clean Python guidelines.

---

## 🚀 Getting Started

### ⚡ Way 1: One-Click Windows Launcher (Recommended for Development)
Double-click the pre-built launcher file at the project root:
```cmd
run-forensoc.bat
```
*This handles Python venv creation, packages installation (`pip install`), Node modules download, environment creation, and launches your services in separate CLI windows.*
* **Frontend UI:** `http://localhost:3000`
* **Backend API Docs:** `http://localhost:8000/api/docs`
* **Default Credentials:** `admin` / `ForenSOC@2024!` *(Recommended: Update password immediately in Settings)*

### 🐳 Way 2: Docker Compose Setup
To spin up the entire production-grade SIEM platform (including PostgreSQL, Redis, Celery, and Nginx proxying):
```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/ForenSOC.git
cd ForenSOC

# Establish configuration env
cp .env.example .env

# Deploy with Docker Compose
docker compose up --build -d
```

### ☁️ Way 3: Cloud Deployment (Vercel + Render + Supabase)
You can deploy your own public copy of ForenSOC for **FREE** using student-friendly hosting platforms:
1. **Database:** Create a free PostgreSQL instance on [Supabase](https://supabase.com) and copy the URI connection string.
2. **Backend:** Connect your repository to [Render.com](https://render.com), deploying under the `render.yaml` Blueprint. Set `DATABASE_URL` to your Supabase string.
3. **Frontend:** Import your repository to [Vercel](https://vercel.com). Set `VITE_API_BASE_URL` to your Render backend URL, specifying `frontend-react` as the root directory.

*Detailed deployment layouts and guidelines can be inspected in [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).*

---

## 🏗️ Project Architecture

```
ForenSOC/
├── backend/                   Python / FastAPI backend engine
│   ├── app/
│   │   ├── api/               17 API route controllers (alerts, cases, evidence, detection...)
│   │   ├── crud/              ORM CRUD transactions (AlertCRUD, CaseCRUD...)
│   │   ├── models/            SQLAlchemy Database Entities
│   │   ├── schemas/           Pydantic schemas for network input/output
│   │   └── services/          SIEM engine, Plaso, Plar, Plost, Plos, Yara, Volatility...
│   ├── automation_service.py  Folder watcher + PowerShell event polling
│   └── tests/                 Pytest suite (including newly introduced Detection Rule tests)
│
├── frontend-react/            React 18 / TypeScript / MUI Premium Dark UI
│   ├── src/
│   │   ├── pages/             17 beautifully crafted analytical workspaces
│   │   ├── components/        Reusable UI Widgets, Breadcrumbs, GlobalThreatMap
│   │   └── theme/             Harmonious glassmorphic palette
│   └── vite.config.ts         Vite bundler setup
│
└── docs/                      Comprehensive DFIR manuals & references
```

---

## 📜 License
This project is released under the **MIT License**. Feel free to use, modify, and distribute it for both academic and corporate settings. See [LICENSE](LICENSE) for more details.

<div align="center">
  Built with ❤️ by the ForenSOC engineering team.
</div>
