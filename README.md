# ForenSOC

Integrated **SOC + digital forensics** MVP: ingest and search logs, run detection rules, manage cases and alerts, and store evidence with hashing and chain of custody.

## Quick start (Windows)

1. Install **Python 3.10+** and **Node.js LTS** (npm included), both on `PATH`.
2. Double‑click **`run-forensoc.bat`** in this folder, or run it from a terminal.

Two windows open:

| Service   | URL |
|-----------|-----|
| **Web UI** | [http://localhost:3000](http://localhost:3000) |
| **API docs (Swagger)** | [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs) |

3. First‑time setup copies `backend/.env.example` → `backend/.env` and `frontend-react/.env.example` → `frontend-react/.env` if those files are missing.
4. Sign in with the admin user from `backend/.env` (defaults are for **local dev only**—change `SECRET_KEY` and admin password before any real deployment).

### Manual start (any OS)

**Backend**

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # first time; then edit secrets
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend**

```bash
cd frontend-react
npm install
cp .env.example .env    # optional; sets VITE_API_BASE_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Vite dev server is set to port **3000** in `vite.config.ts`.

## What the app does today (features)

### Accounts and security

- **JWT** login/register, token refresh pattern, password hashing (**bcrypt**).
- **Roles** (e.g. admin, analyst, investigator, viewer) with route‑level checks.
- **User** management APIs (admin) and **current user** profile.

### Cases and alerts

- **Cases**: create, list, update, detail with notes; assignment and status fields per your backend schemas.
- **Alerts**: CRUD, assignment, link/unlink to cases, status workflow helpers (e.g. close, false positive) as implemented in `backend/app/api/alerts.py`.

### Logs (Phase 2–style)

- **Ingest** raw log text; **normalize** into a common event shape (IPs, user, host, event type, severity, etc.).
- **Log Explorer** UI: browse/filter normalized (and related raw) events.

### Detection (Phase 3–style)

- **Detection rules** stored in the DB; CRUD + enable/disable from API and **Detection Rules** UI.
- **Detection engine** evaluates normalized events and can **raise alerts**; **manual scan** over a time window from the UI/API.

### Evidence

- **Upload** files tied to a case; **SHA‑256 / MD5** on ingest.
- **Evidence Vault** UI: list, filter, verify, download, chain of custody.
- **Case detail → Evidence** tab.

### Timeline (merged view)

- Backend **rebuilds** `timeline_events` from alerts, normalized logs, evidence uploads, and chain-of-custody for a case.
- **Timeline** page and case **Timeline** tab.

### PDF reports

- **ReportLab** PDF: case summary, alerts table, evidence table, notes.
- **Reports** page: pick case, generate, list, download. Case **Reports** tab shortcuts.

### Network & memory forensics (tool-dependent)

- **PCAP**: upload → optional **Zeek** (`ZEEK_PATH` / PATH) + **pyshark** sample count; results stored under **`pcap_analysis`**.
- **Suricata EVE**: upload newline-delimited JSON → parsed summaries in **`pcap_analysis`**.
- **Memory**: upload → **Volatility 3** (`vol -f …`) default Windows plugins when `vol` is installed.

### MITRE ATT&CK

- **Per-case summary** (counts by technique from alerts).
- **Sync** creates `mitre_mappings` rows from linked alerts.

### Async jobs (Celery + Redis)

- Optional **background** PCAP/memory analysis when `async_worker=true` on upload **and** a worker is running.
- **Docker Compose** includes **Redis** and a **celery-worker** service. Locally: run Redis, then  
  `celery -A app.celery_app:celery_app worker -l info` from `backend/` (venv active). Configure **`REDIS_URL`** in `.env`.

### UI shell

- **Dashboard**, **Forensics**, **Timeline**, **MITRE**, **Reports**; **Settings** still lightweight.

### Still limited / not enterprise-grade

- Live Suricata IDS, advanced exfil/port-scan scoring, ATT&CK heatmap UI, Plaso-grade timelines, full test coverage — see **`DEVELOPMENT_STATUS.md`**.

## Project layout

| Path | Role |
|------|------|
| `backend/` | FastAPI app, SQLAlchemy models, services (`log_parser`, `detection_engine`, …) |
| `frontend-react/` | React 18 + TypeScript + MUI + Vite |
| `DESIGN.md` | System design overview |
| `DEVELOPMENT_STATUS.md` | What is done vs roadmap |
| `IMPLEMENTATION_ROADMAP.md` | Phased delivery plan |

## Configuration tips

- **Database:** default SQLite file under `backend/` (`DATABASE_URL` in `.env`). Use PostgreSQL in production via the same variable.
- **Uploads:** evidence files go under `UPLOAD_DIR` (see `.env`).
- **CORS:** `ALLOWED_ORIGINS` must include your frontend origin (e.g. `http://localhost:3000`).

## Docker (full stack)

From the repo root:

```bash
docker compose up --build
```

Services: **PostgreSQL**, **Redis**, **FastAPI**, **Celery worker**, **React** (production build via `frontend-react/Dockerfile`). API: port **8000**, UI: **3000**.

## Single reference docs

- **`README.md`** (this file) — run, layout, feature summary.  
- **`DEVELOPMENT_STATUS.md`** — phase checklist vs roadmap and API list.

## License / version

See repo metadata. **Version:** 1.0.0‑alpha (MVP core).
