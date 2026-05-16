# ForenSOC — Development Status

This file tracks **what is implemented in the repo today** versus the **roadmap** (`IMPLEMENTATION_ROADMAP.md`). Use the **snapshot table** as the source of truth.

---

## Phase completion snapshot

| Roadmap area | Status | Notes |
|---------------|--------|--------|
| **Phase 1** — Foundation | **Complete (MVP)** | JWT, users, cases, alerts, OpenAPI, React shell. |
| **Phase 2** — Logs | **Complete (MVP)** | Ingest, normalize, search API + Log Explorer. |
| **Phase 3** — Detection | **Complete (MVP)** | Rules CRUD, engine, scan, UI. |
| **Evidence (Weeks 7–8)** | **Complete (MVP)** | Upload, hashes, verify, CoC, vault UI, case tab. |
| **Phase 4** — Forensics | **Complete (MVP)** | File Analyzer, YARA Scanner, enhanced PCAP/Memory heuristics. |
| **Timeline & correlation** | **Complete (MVP)** | Merges alerts, logs, evidence, CoC, YARA, and Volatility results. |
| **PDF reports** | **Complete (MVP)** | PDF with case details, alerts, evidence, notes, and MITRE summary. |
| **PCAP / Zeek / pyshark** | **Complete (MVP)** | Port scan and data exfil heuristics implemented. |
| **Memory / Volatility** | **Complete (MVP)** | Suspicious process indicator detection added. |
| **MITRE UI** | **Complete (baseline)** | Per-case summary + sync API. Heatmap/Navigator pending. |

**Bottom line:** End-to-end paths exist for **timeline rebuild**, **PDF reports** (with MITRE), **YARA scanning**, **File forensics**, **PCAP heuristics**, **Suricata EVE**, and **memory indicators**.

---

## Implemented API routers

| Prefix | Purpose |
|--------|---------|
| `/api/auth`, `/api/users` | Auth and users |
| `/api/cases`, `/api/alerts` | Cases and alerts |
| `/api/logs`, `/api/detection` | Logs and detection |
| `/api/evidence` | Evidence vault |
| **`/api/timeline`** | List events, rebuild timeline |
| **`/api/reports`** | List PDFs, generate, download |
| **`/api/forensics`** | PCAP, memory, Suricata EVE upload + analyze |
| **`/api/mitre`** | Case MITRE summary, sync mappings |

---

## Frontend (React)

- **Forensics**, **Timeline**, **MITRE** pages; **Reports** hub; case detail **Logs / Timeline / Reports** tabs wired to APIs.
- Navigation updated (valid MUI icons).

---

## Next steps (optional hardening)

1. Alembic migrations; widen tests for new services.  
2. Tune Volatility plugins per OS; add Suricata **live** integration if required.  
3. Populate `PCAPAnalysis` heuristic counters from parsed Zeek/Suricata data.  
4. Resolve remaining frontend `tsc` issues in older pages (icons, strict unused vars).

---

## Development commands

**Backend:** `cd backend`, venv, `pip install -r requirements.txt`, `uvicorn app.main:app --reload`  
**Frontend:** `cd frontend-react`, `npm install`, `npm run dev`  
**Celery worker (local):** `redis-server` then `celery -A app.celery_app:celery_app worker -l info` from `backend` with venv active.  
**Docker:** `docker compose up --build` (PostgreSQL + Redis + API + worker + React build).

---

**Last updated:** 2026-05-15  
**Version:** 1.1.0-alpha  
**Status:** Core forensic services and enhanced heuristics implemented.
