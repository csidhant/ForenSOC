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
| **Timeline & correlation** | **Complete (baseline)** | `POST /api/timeline/cases/{id}/rebuild` merges alerts, normalized events, evidence, CoC. `GET` lists rows. **Advanced correlation / Plaso** not implemented. |
| **PDF reports** | **Complete (baseline)** | ReportLab PDF (case, alerts, evidence, notes). `POST /api/reports/generate`, list, download. |
| **PCAP / Zeek / pyshark** | **Partial** | Upload as evidence; Zeek if binary on PATH; pyshark packet sample; results in `pcap_analysis`. **No Suricata live IDS** — EVE JSON upload/parsed separately. |
| **Suricata** | **Partial** | **EVE NDJSON** file ingest + summary stored in `pcap_analysis` — not full IDS pipeline. |
| **Memory / Volatility** | **Partial** | Upload + `vol -f dump <plugins>` when `vol` available; results in `volatility_results`. **Plugin set is Windows-oriented** — adjust for Linux dumps. |
| **MITRE UI** | **Complete (baseline)** | Per-case summary from alerts + `mitre_mappings` sync API. **Heatmap / ATT&CK navigator** not built. |
| **Celery + Redis** | **Complete (scaffold)** | `app/celery_app.py`, `tasks/forensics_tasks.py`, optional `async_worker` on PCAP/memory uploads. **Docker Compose** includes `redis` + `celery-worker`. |
| **Network Phase (roadmap Week 10–11)** | **Not complete** | No dedicated port-scan / exfil heuristics beyond placeholders in `PCAPAnalysis` counters. |
| **File/browser forensics, advanced timeline, prod hardening** | **Not complete** | See roadmap. |

**Bottom line:** End-to-end paths exist for **timeline rebuild**, **PDF reports**, **PCAP (Zeek/pyshark)**, **Suricata EVE**, **memory (Volatility)**, **MITRE summary/sync**, and **async forensics** when Redis + worker run.

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

**Last updated:** 2026-05-13  
**Version:** 1.0.0-alpha  
**Status:** Roadmap “not implemented” block largely addressed with MVP implementations; advanced analytics and production hardening remain.
