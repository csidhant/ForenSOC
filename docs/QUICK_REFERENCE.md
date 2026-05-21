# ForenSOC — Analyst Quick Reference

> A cheat-sheet for day-to-day SOC operations. Keep this open alongside the platform.

---

## 🚀 Starting the Platform

### Local (Windows — fastest)
```bat
run-forensoc.bat
```

### Local (Docker — recommended for teams)
```bash
docker compose up -d
# Check health: docker compose ps
```

### URLs
| Service | URL |
|---------|-----|
| Web UI | http://localhost:3000 (dev) or http://localhost (Docker) |
| API Swagger | http://localhost:8000/api/docs |
| API Health | http://localhost:8000/health |

---

## 🔐 Default Credentials

```
Username : admin
Password : ForenSOC@2024!
```
> Change immediately via Settings → Change Password.

---

## 🔁 Core Analyst Workflow

```
New Alert detected
    │
    ├─ Review alert details (Severity, Source IP, MITRE ID)
    │
    ├─ False positive? → Mark False Positive → Done
    │
    └─ Real threat?
          │
          ├─ Link alert to an existing Case  OR  Create new Case
          │
          ├─ Upload evidence (PCAP / memory dump / log files)
          │
          ├─ Run analysis (YARA / Zeek / Volatility)
          │
          ├─ Review Timeline (auto-built from alerts + evidence)
          │
          ├─ Map to MITRE ATT&CK → Sync Mappings
          │
          └─ Generate PDF Report → Download
```

---

## ⚡ Alert Severity Guide

| Color | Severity | SLA | Action |
|-------|----------|-----|--------|
| 🔴 | **Critical** | Immediate | Page on-call analyst NOW |
| 🟠 | **High** | < 1 hour | Assign and investigate |
| 🟡 | **Medium** | < 8 hours | Triage and queue |
| 🔵 | **Low** | < 48 hours | Review batch |

---

## 📂 Auto-Ingest (Zero-Click)

Drop any `.log` file into:
```
backend/ingest_drop/
```
The watcher picks it up within **10 seconds** and processes it automatically. No UI action needed.

---

## 🔍 Detection Rules — Quick Reference

| Rule Name | Trigger | Severity | MITRE |
|-----------|---------|----------|-------|
| SSH Brute Force | 5 failed SSH logins / 5 min from same IP | High | T1110 |
| Multiple Failed Logins | 3 auth failures / 10 min | Medium | T1110 |
| Suspicious Web Request | HTTP GET to `/admin`, `/wp-admin`, `/phpmyadmin` | Medium | T1046 |

To run all rules against the last 24h of events:  
**Detection Rules → Run Detection Scan**

---

## 🔬 Forensics Analysis — What to Upload

| File Type | Recommended Analysis | Tool |
|-----------|---------------------|------|
| `.pcap` / `.cap` | PCAP Analysis | Zeek |
| `.mem` / `.dmp` | Memory Analysis | Volatility 3 |
| `.exe` / `.bin` / `.dll` | YARA Scan | YARA |
| `.json` (Suricata EVE) | Suricata EVE Parser | Built-in |
| `.log` | Log Ingest → Detection | Rule Engine |

---

## 🌐 Public Threat Search (No Login Required)

Navigate to: `https://your-forensoc-url/public`

| Search Type | Example Input |
|-------------|---------------|
| IP Address | `192.168.1.100` |
| SHA-256 hash | `e3b0c44298fc1c149afb...` |
| MD5 hash | `d41d8cd98f00b204e980...` |
| Domain | `malicious.example.com` |
| File Upload | Any binary for YARA scan |

---

## 🛡️ RBAC Permissions Summary

| Action | Admin | Analyst | Investigator | Viewer |
|--------|-------|---------|--------------|--------|
| View everything | ✅ | ✅ | ✅ | ✅ |
| Create/edit cases | ✅ | ✅ | ✅ | ❌ |
| Upload evidence | ✅ | ✅ | ✅ | ❌ |
| Run forensics | ✅ | ✅ | ✅ | ❌ |
| Manage rules | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ | ❌ |

---

## 🔧 Backend Environment Variables (Key Ones)

```bash
# MUST change in production:
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
ADMIN_PASSWORD=YourStrongPassword!
ALLOWED_ORIGINS_STR=https://your-frontend.vercel.app

# Database (SQLite for dev, PostgreSQL for prod):
DATABASE_URL=postgresql://user:pass@host:5432/forensoc

# Optional integrations:
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
REDIS_URL=redis://localhost:6379/0
```

---

## 📡 API — Most Used Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Authenticate, get JWT |
| `GET` | `/api/alerts` | List alerts (paginated) |
| `GET` | `/api/alerts/stats/overview` | Alert stat cards |
| `GET` | `/api/cases` | List cases |
| `POST` | `/api/cases` | Create case |
| `POST` | `/api/logs/ingest` | Ingest raw log |
| `POST` | `/api/evidence/upload` | Upload evidence file |
| `POST` | `/api/forensics/yara-scan/{id}` | Run YARA on evidence |
| `POST` | `/api/detection/scan` | Run all detection rules |
| `GET` | `/api/public/search?query=<ip>` | Public threat search |
| `GET` | `/health` | Health check |

Full interactive API docs: `http://localhost:8000/api/docs`

---

## 🐳 Docker Quick Commands

```bash
# Start all services
docker compose up -d

# View service status
docker compose ps

# View backend logs (live)
docker compose logs -f backend

# Stop all services
docker compose down

# Full rebuild (after code changes)
docker compose up -d --build

# Remove all data (destructive!)
docker compose down -v
```

---

## 🚨 Common Issues & Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| API returns 401 | Token expired — log out and back in |
| "Network Error" in UI | Check `VITE_API_BASE_URL` in frontend env |
| CORS error in browser | Add frontend URL to `ALLOWED_ORIGINS_STR` on backend |
| WebSocket not connecting | Set `VITE_SOCKET_URL` to the backend root URL |
| Forensics tools return "not available" | Volatility/Zeek must be installed on the server OS |
| Database errors on start | Check `DATABASE_URL` connection string is correct |
| Docker containers restart-looping | Run `docker compose logs <service>` to diagnose |

---

*Full docs: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) · [USER_GUIDE.md](USER_GUIDE.md) · [ARCHITECTURE_AND_API.md](ARCHITECTURE_AND_API.md)*
