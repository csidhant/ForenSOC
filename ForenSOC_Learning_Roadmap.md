# 🎓 ForenSOC — Complete Learning Roadmap
> *Every technology, concept, library, and pattern inside the codebase — mapped to actual files.*  
> *Study in order. Each phase builds on the previous one.*

---

## 🗺️ The Big Picture — How Everything Connects

```
┌─────────────────────────────────────────────────────────┐
│                    FORENSOC SYSTEM                      │
│                                                         │
│  ┌─────────────────┐     ┌─────────────────────────┐   │
│  │  FRONTEND (UI)  │────▶│   BACKEND (API Engine)  │   │
│  │                 │     │                         │   │
│  │  React 18       │     │  FastAPI (Python)        │   │
│  │  TypeScript     │◀────│  SQLAlchemy ORM          │   │
│  │  Material UI    │     │  Pydantic Schemas        │   │
│  │  Zustand State  │     │  JWT Authentication     │   │
│  │  Socket.io      │◀────│  Socket.io WebSockets   │   │
│  │  Recharts       │     │  Rate Limiting (SlowAPI) │   │
│  │  Vite Bundler   │     │                         │   │
│  └─────────────────┘     └──────────┬──────────────┘   │
│                                     │                   │
│              ┌──────────────────────┼───────────┐       │
│              ▼                      ▼           ▼       │
│    ┌──────────────┐    ┌────────────────┐  ┌────────┐  │
│    │  PostgreSQL  │    │  Forensic Tools│  │ Files  │  │
│    │  SQLite(dev) │    │                │  │        │  │
│    │  SQLAlchemy  │    │  Volatility 3  │  │ PCAP   │  │
│    │  Alembic     │    │  Zeek          │  │ RAM    │  │
│    └──────────────┘    │  YARA          │  │ Dumps  │  │
│                        │  Suricata EVE  │  └────────┘  │
│                        │  Sigma Rules   │               │
│                        └────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Learning Phases Overview

| Phase | Topic Area | Est. Time | Priority |
|-------|-----------|-----------|----------|
| **Phase 1** | Python Fundamentals + Project Setup | 2 weeks | 🔴 Must |
| **Phase 2** | FastAPI — Backend Framework | 2 weeks | 🔴 Must |
| **Phase 3** | Database — SQLAlchemy + PostgreSQL | 1–2 weeks | 🔴 Must |
| **Phase 4** | Cybersecurity Domain Knowledge | 3–4 weeks | 🔴 Must |
| **Phase 5** | React + TypeScript Frontend | 3 weeks | 🔴 Must |
| **Phase 6** | Real-Time — WebSockets + Socket.io | 1 week | 🟡 Important |
| **Phase 7** | DevOps — Docker + CI/CD + Deployment | 2 weeks | 🟡 Important |
| **Phase 8** | Advanced Topics | Ongoing | 🟢 Nice-to-have |

---

## 🔴 PHASE 1 — Python Fundamentals + Project Setup

> **Goal:** Understand how Python powers every piece of the backend.  
> **Files to study:** `backend/app/main.py`, `backend/app/config.py`, `backend/.env.example`, `backend/requirements.txt`

### 1.1 — Python Core Concepts Used in ForenSOC

| Concept | Where It's Used in Code | What to Learn |
|---------|------------------------|---------------|
| **Async/Await** | Every API route handler (`async def`) | Python coroutines, event loop, `asyncio` module |
| **Type Hints** | All function signatures (`def foo(x: int) -> str`) | `typing` module, `Optional`, `List`, `Dict`, `Union` |
| **Decorators** | `@app.get()`, `@router.post()`, `@staticmethod` | How Python decorators work, `functools.wraps` |
| **Context Managers** | `with open(...)`, `with db.begin()` | `__enter__`/`__exit__`, `contextlib` |
| **Dataclasses / Pydantic Models** | All `schemas/` files | `@dataclass`, Pydantic `BaseModel` |
| **Exception Handling** | Every route uses `try/except` | `try/except/finally`, custom exceptions |
| **f-Strings** | `f"Welcome to {settings.APP_NAME}"` | String formatting in Python 3.6+ |
| **List Comprehensions** | `[rule for rule in rules if rule.enabled]` | Concise iteration patterns |
| **Environment Variables** | `backend/app/config.py`, `python-dotenv` | `os.environ`, `.env` files |
| **Module System** | `from app.api.auth import router` | `__init__.py`, relative imports, packages |

### 1.2 — Project Configuration (`config.py`, `.env`)

```
backend/
├── .env.example          ← Template for environment variables
├── .env                  ← YOUR actual secrets (never commit this)
└── app/
    └── config.py         ← Reads .env using pydantic-settings
```

**What to study:**
- How `pydantic-settings` loads typed config from environment variables
- Why `.env` is in `.gitignore` (secrets management)
- The `@lru_cache` decorator used on `get_settings()` to avoid re-reading config

### 1.3 — Python Packages (`requirements.txt`)

Study each package and WHY it's used:

```
fastapi==0.104.1         ← Web framework (the backbone)
uvicorn[standard]        ← ASGI server (runs FastAPI)
sqlalchemy==2.0.23       ← Database ORM
alembic==1.13.0          ← Database migrations
psycopg2-binary          ← PostgreSQL driver
python-jose              ← JWT token creation/validation
passlib[bcrypt]          ← Password hashing
pydantic==2.5.0          ← Data validation
yara-python==4.5.0       ← YARA malware scanning
watchdog==3.0.0          ← File system watching
reportlab==4.0.9         ← PDF generation
slowapi==0.1.9           ← Rate limiting
python-socketio          ← WebSocket server
geocoder==1.38.1         ← IP → geolocation (threat map)
loguru==0.7.2            ← Better logging
PyYAML==6.0.1            ← Parse Sigma YAML rules
```

**📚 Resources:**
- Python.org official tutorial (free): https://docs.python.org/3/tutorial/
- "Automate the Boring Stuff with Python" (free book): https://automatetheboringstuff.com/
- RealPython async guide: https://realpython.com/async-io-python/

---

## 🔴 PHASE 2 — FastAPI Backend Framework

> **Goal:** Understand the entire API layer of ForenSOC.  
> **Files to study:** All 17 files inside `backend/app/api/`

### 2.1 — FastAPI Core Concepts

| Concept | File Where Used | What to Study |
|---------|----------------|---------------|
| **App initialization** | `app/main.py` lines 24–31 | `FastAPI()` constructor, title, docs URL |
| **Routers** | Every file in `api/` | `APIRouter()`, `prefix`, `tags` |
| **Path parameters** | `api/cases.py`: `GET /cases/{case_id}` | `@router.get("/{id}")` |
| **Query parameters** | `api/logs.py`: `?page=1&limit=50` | `Query()` with defaults and validation |
| **Request body** | `api/evidence.py`: POST with file upload | `Body()`, `Form()`, `UploadFile` |
| **Dependency injection** | `api/dependencies.py` | `Depends()`, shared DB sessions |
| **Background tasks** | async operations in forensics | `BackgroundTasks` |
| **Middleware** | `main.py` CORS + Rate limiting | `add_middleware()`, middleware stack |
| **OpenAPI docs** | Auto-generated at `/api/docs` | Swagger UI, ReDoc |
| **HTTP status codes** | All routes | `status.HTTP_200_OK`, `HTTPException` |
| **File uploads** | `api/evidence.py`, `api/forensics.py` | `UploadFile`, `File()`, multipart |

### 2.2 — The API Layer Map (17 Routes)

```
backend/app/api/
├── auth.py           ← Login, logout, token refresh (JWT)
├── users.py          ← CRUD for users, role assignment
├── cases.py          ← Case creation, SLA tracking, status mgmt
├── alerts.py         ← Alert triage, severity filtering, status updates
├── logs.py           ← Log ingestion endpoint, Sigma evaluation trigger
├── detection.py      ← Sigma/YARA rule CRUD, manual historical scan
├── evidence.py       ← Evidence file upload, hash verification, download
├── forensics.py      ← PCAP/RAM dump upload → Zeek/Volatility analysis
├── timeline.py       ← Event correlation → chronological attack timeline
├── reports.py        ← PDF report generation (ReportLab)
├── mitre.py          ← MITRE ATT&CK matrix data
├── audit.py          ← Immutable system audit log retrieval
├── search.py         ← Full-text search across cases/events/alerts
├── threat_intel.py   ← IP/hash threat intelligence lookups
├── public.py         ← Public YARA sandbox (no auth required)
└── dependencies.py   ← Shared: get_db(), get_current_user(), roles
```

### 2.3 — Authentication Flow (Study `api/auth.py`)

```
User sends username+password
       ↓
auth.py verifies against DB (bcrypt hash comparison)
       ↓
Creates JWT token (python-jose) with user_id + role + expiry
       ↓
Client stores token in localStorage
       ↓
Every protected request sends: Authorization: Bearer <token>
       ↓
dependencies.py → get_current_user() decodes token → injects user
       ↓
Role check: @requires_role("admin") or @requires_role("analyst")
```

### 2.4 — Pydantic Schemas (`backend/app/schemas/`)

Every API has 3 Pydantic models (study the pattern):

```python
# Example from schemas/case.py
class CaseBase(BaseModel):       # Shared fields
    title: str
    severity: str

class CaseCreate(CaseBase):      # For POST requests (input)
    description: Optional[str]

class CaseResponse(CaseBase):    # For responses (output)
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)  # Pydantic v2
```

**📚 Resources:**
- FastAPI official docs (best docs ever written): https://fastapi.tiangolo.com/
- FastAPI full tutorial: https://fastapi.tiangolo.com/tutorial/
- Pydantic v2 docs: https://docs.pydantic.dev/latest/

---

## 🔴 PHASE 3 — Database Layer (SQLAlchemy + PostgreSQL)

> **Goal:** Understand how data is stored, queried, and migrated.  
> **Files:** `backend/app/database.py`, `backend/app/models/`, `backend/app/crud/`

### 3.1 — SQLAlchemy ORM Concepts

| Concept | File | What to Learn |
|---------|------|---------------|
| **Engine + Session** | `app/database.py` | `create_engine()`, `SessionLocal`, connection pooling |
| **Declarative Base** | `models/base.py` | `DeclarativeBase`, all models inherit from it |
| **Model definition** | Every file in `models/` | `Column()`, `String`, `Integer`, `DateTime`, `ForeignKey` |
| **Relationships** | `models/case.py`, `models/alert.py` | `relationship()`, `back_populates`, lazy loading |
| **Queries** | Every file in `crud/` | `.query()`, `.filter()`, `.first()`, `.all()`, `.count()` |
| **SQLAlchemy 2.0** | All models | `select()`, `session.execute()` new style |

### 3.2 — Database Models Map (13 Models)

```
backend/app/models/
├── base.py        ← DeclarativeBase — all models inherit from here
├── user.py        ← User, Role (RBAC foundation)
├── alert.py       ← Security alerts with severity + status
├── case.py        ← Investigation cases with SLA tracking
├── event.py       ← Raw log events (ingested logs)
├── evidence.py    ← Evidence files with SHA-256 + MD5 hashes
├── forensics.py   ← Forensic analysis results (Zeek/Volatility/YARA)
├── detection.py   ← Sigma/YARA detection rules
├── mitre.py       ← MITRE ATT&CK technique data
├── report.py      ← Generated PDF report metadata
├── timeline.py    ← Attack timeline correlation entries
├── audit.py       ← Tamper-resistant audit log entries
└── __init__.py    ← Exports all models
```

### 3.3 — CRUD Pattern (8 CRUD files)

ForenSOC uses a Repository Pattern. Study how it separates DB logic:

```
backend/app/crud/
├── user.py        ← UserCRUD, RoleCRUD classes
├── alert.py       ← AlertCRUD: create, get, filter, update status
├── case.py        ← CaseCRUD: create, link evidence, update SLA
├── event.py       ← EventCRUD: bulk insert, time-window queries
├── evidence.py    ← EvidenceCRUD: store hash + file metadata
├── report.py      ← ReportCRUD: save generated report refs
├── timeline.py    ← TimelineCRUD: ordered event correlation
└── __init__.py
```

### 3.4 — PostgreSQL Concepts to Study

```sql
-- These patterns appear throughout ForenSOC:
SELECT * FROM alerts WHERE severity = 'High' ORDER BY created_at DESC LIMIT 50;
SELECT COUNT(*) FROM events WHERE timestamp > NOW() - INTERVAL '5 minutes';
UPDATE cases SET status = 'Resolved' WHERE id = 1;
-- Joins (SQLAlchemy does these automatically via relationships)
SELECT alerts.*, users.username FROM alerts JOIN users ON alerts.user_id = users.id;
```

**What to study:**
- Basic SQL: SELECT, INSERT, UPDATE, DELETE, WHERE, JOIN, ORDER BY, LIMIT
- PostgreSQL-specific: SERIAL, TEXT, TIMESTAMP WITH TIME ZONE, JSONB
- Indexes (why they matter for log queries)
- Alembic migrations: `alembic revision`, `alembic upgrade head`

**📚 Resources:**
- SQLAlchemy 2.0 tutorial: https://docs.sqlalchemy.org/en/20/tutorial/
- PostgreSQL tutorial: https://www.postgresqltutorial.com/ (free)
- Alembic docs: https://alembic.sqlalchemy.org/en/latest/tutorial.html

---

## 🔴 PHASE 4 — Cybersecurity Domain Knowledge

> **This is the HARDEST phase.** ForenSOC implements real cybersecurity tools.  
> **Files:** Everything inside `backend/app/services/`

### 4.1 — SIEM Concepts (Security Information & Event Management)

**What ForenSOC does:** Ingests logs → parses them → evaluates detection rules → raises alerts.

#### Study these in order:

**4.1.1 — Log Formats** (`services/log_parser.py`)
```
What is a log?  →  A timestamped record of a system event.

Formats used in ForenSOC:
├── Windows Event Log (XML/JSON)  ← EventID 4625 = failed login
├── Syslog                        ← Standard Unix log format
├── Suricata EVE JSON             ← Network IDS alerts
└── Custom JSON                   ← ForenSOC's own format

Key Fields to know:
  EventID     ← Windows-specific event identifier
  Severity    ← Critical / High / Medium / Low / Informational
  Source IP   ← Where the event came from
  Timestamp   ← When it happened
  Username    ← Who triggered it
```

**4.1.2 — Sigma Rules** (`services/detection_engine.py`, `services/sigma_loader.py`, `backend/app/rules/`)
```
What is Sigma?
  → A generic YAML rule language for log-based threat detection.
  → Like regex, but for security events.
  → Rules describe: WHAT to look for + HOW to correlate.

Example Sigma Rule (YAML):
  title: SSH Brute Force
  logsource:
    category: authentication
  detection:
    selection:
      EventID: 4625
      count(SourceIP) > 5
    timeframe: 5m
  level: high
  tags:
    - attack.credential_access
    - attack.t1110  ← MITRE ATT&CK technique ID

ForenSOC's Rule Engine (detection_engine.py):
  → Reads rules from DB (created via /api/detection/rules)
  → On every log ingestion, evaluates each enabled rule
  → If a rule matches → creates an Alert in the DB
  → Sends WebSocket notification to dashboard
```

**4.1.3 — Brute Force Detection (Time-Window Logic)**
```python
# Simplified from detection_engine.py
# "5 failed logins from same IP in 5 minutes = alert"
events_in_window = db.query(Event).filter(
    Event.source_ip == source_ip,
    Event.event_type == "failed_login",
    Event.timestamp > (now - timedelta(seconds=300))
).count()

if events_in_window >= rule.threshold:
    create_alert(...)
```

### 4.2 — DFIR (Digital Forensics & Incident Response)

**4.2.1 — Memory Forensics with Volatility 3** (`services/memory_analyzer.py`)
```
What is RAM forensics?
  → Analyzing a dump of a computer's RAM to find:
    - Running processes (even hidden malware)
    - Network connections open at time of capture
    - Encryption keys stored in memory
    - Injected code (malware hiding in legitimate processes)

How ForenSOC uses it:
  1. Analyst uploads a .raw/.mem/.vmem file via UI
  2. Backend calls: volatility3 -f memory.raw <plugin>
  3. Plugins used:
     - windows.pslist    ← List all processes
     - windows.netscan   ← Active network connections
     - windows.malfind   ← Find injected shellcode
     - windows.cmdline   ← Command line args of processes
  4. Results parsed → stored in DB → shown in UI

What to study:
  - What a memory image is and how to capture one (WinPmem, DumpIt)
  - Volatility 3 command line basics
  - Common forensic artifacts in memory (MFT, registry hives, prefetch)
```

**4.2.2 — Network Forensics with Zeek** (`services/pcap_analyzer.py`)
```
What is Zeek (formerly Bro)?
  → An open-source network analysis framework.
  → Converts raw PCAP (packet capture) files into structured logs.

Zeek Log Types:
  conn.log    ← All TCP/UDP/ICMP connections
  dns.log     ← DNS queries (what domains were looked up?)
  http.log    ← HTTP requests (what URLs, user agents?)
  ssl.log     ← SSL/TLS certificates (detect bad certs)
  files.log   ← Files transferred over the network

How ForenSOC uses it:
  1. Analyst uploads .pcap file
  2. Backend runs: zeek -r capture.pcap
  3. Parses Zeek JSON logs
  4. Extracts connections, DNS queries, HTTP requests
  5. Displays in Network Forensics Workspace

What to study:
  - How TCP/IP works (IP addresses, ports, handshakes)
  - What a PCAP file is (Wireshark tutorial)
  - Zeek quickstart: https://docs.zeek.org/en/master/quickstart.html
```

**4.2.3 — YARA Scanning** (`services/yara_scanner.py`)
```
What is YARA?
  → "Pattern matching swiss army knife for malware researchers"
  → Write rules that describe malware → scan files for matches.

Example YARA Rule:
  rule DetectMimikatz {
      strings:
          $s1 = "mimikatz"
          $s2 = "lsass.exe" nocase
      condition:
          any of them
  }

How ForenSOC uses it:
  - Scan uploaded files against custom YARA rules
  - Public sandbox (no auth needed): /api/public/scan
  - Admin can create custom YARA rules via UI
  - Results show: which rule matched, at what offset, confidence

What to study:
  - YARA documentation: https://yara.readthedocs.io/
  - Malware traffic analysis: https://www.malware-traffic-analysis.net/
```

**4.2.4 — Suricata EVE Logs** (`services/suricata_eve.py`)
```
What is Suricata?
  → Open-source IDS/IPS (Intrusion Detection/Prevention System)
  → Monitors network traffic in real-time against signatures
  → Produces "EVE JSON" format logs

EVE JSON example:
  {
    "timestamp": "2024-01-01T10:00:00",
    "event_type": "alert",
    "alert": {
      "signature": "ET SCAN Nmap SYN Scan",
      "severity": 2,
      "category": "Attempted Information Leak"
    },
    "src_ip": "192.168.1.50",
    "dest_port": 22
  }

ForenSOC parses these and creates alerts from Suricata detections.
```

**4.2.5 — Browser Forensics** (`services/file_analyzer.py`)
```
What ForenSOC does:
  - Parses Chrome's SQLite databases:
    ~/.config/google-chrome/Default/History
    ~/.config/google-chrome/Default/Downloads

  - Extracts:
    - URLs visited (with timestamps)
    - Files downloaded
    - Search queries
    - Malicious URL flags

What to study:
  - SQLite basics (it's a file-based database, no server needed)
  - Chrome forensics artifacts and their locations
```

### 4.3 — MITRE ATT&CK Framework (`api/mitre.py`, `services/mitre_sync.py`)
```
What is MITRE ATT&CK?
  → A globally-accessible knowledge base of adversary tactics and techniques.
  → Every known attack technique has a unique ID (e.g., T1110 = Brute Force)
  → Organized into: Tactics → Techniques → Sub-techniques

Structure:
  Tactics (WHY):    Reconnaissance, Initial Access, Persistence, Privilege Escalation...
  Techniques (HOW): T1110 Brute Force, T1059 Command Execution, T1003 Credential Dumping...

ForenSOC integration:
  - Every detection rule has a mitre_technique + mitre_id field
  - MITRE page shows a matrix of all techniques
  - Clicking a technique shows all alerts mapped to it

What to study:
  - Browse https://attack.mitre.org/ — spend 2 hours here
  - Understand the Tactic → Technique hierarchy
  - Learn the most common techniques in real attacks
```

### 4.4 — Chain of Custody (`models/evidence.py`, `utils/hash_utils.py`)
```
What is Chain of Custody?
  → Legal requirement in digital forensics.
  → Every piece of evidence must have an unbroken record of:
    - Who accessed it
    - When they accessed it
    - What they did with it
  → Required for evidence to be admissible in court.

How ForenSOC implements it:
  1. File uploaded → SHA-256 + MD5 calculated immediately
  2. Hash stored in DB (immutable)
  3. Every access (download, verify, view) logged in audit table
  4. Tamper detection: periodic re-hash → compare to stored hash
  5. PDF report includes full chain of custody ledger

SHA-256 example (utils/hash_utils.py):
  import hashlib
  sha256 = hashlib.sha256(file_bytes).hexdigest()
```

### 4.5 — GeoIP & Threat Intelligence
```
services/geoip_service.py  ← IP → Country/City (for threat map)
services/threat_intel.py   ← Check IP/hash against threat databases

What to study:
  - How IP geolocation works (MaxMind GeoIP database)
  - What threat intelligence feeds are (VirusTotal, AbuseIPDB, AlienVault OTX)
  - IOC (Indicator of Compromise): IP, domain, file hash, URL
```

**📚 Cybersecurity Resources (Free):**
- TryHackMe: https://tryhackme.com (interactive labs, beginner-friendly)
- Blue Team Labs Online: https://blueteamlabs.online
- Sigma Rules GitHub: https://github.com/SigmaHQ/sigma
- MITRE ATT&CK: https://attack.mitre.org/
- Zeek docs: https://docs.zeek.org/
- Volatility 3 docs: https://volatility3.readthedocs.io/
- YARA docs: https://yara.readthedocs.io/

---

## 🔴 PHASE 5 — React + TypeScript Frontend

> **Goal:** Understand how the entire UI is built and state managed.  
> **Files:** Everything inside `frontend-react/src/`

### 5.1 — TypeScript First

ForenSOC uses TypeScript everywhere. Study:

| TS Concept | Where Used | What to Learn |
|-----------|-----------|---------------|
| **Interfaces** | `src/types/` | `interface User { id: number; role: string }` |
| **Generics** | API service: `apiService.get<User[]>('/users')` | `function foo<T>(arg: T): T` |
| **Type Assertions** | `as UserRole`, `as Alert[]` | When and how to cast types |
| **Enums** | Severity levels, status types | `enum Severity { High = 'High', Low = 'Low' }` |
| **Optional Chaining** | `user?.profile?.email` | Safe navigation |
| **Union Types** | `'admin' | 'analyst' | 'viewer'` | Multiple possible types |
| **Type Guards** | `if (typeof x === 'string')` | Runtime type narrowing |

### 5.2 — React 18 Patterns Used

| Pattern | File | What to Study |
|---------|------|---------------|
| **Functional Components** | Every `.tsx` file | Function components with `React.FC` |
| **useState** | `LoginPage.tsx`, all forms | `const [value, setValue] = useState("")` |
| **useEffect** | `App.tsx`, `DashboardPage.tsx` | Side effects, cleanup, dependency array |
| **useRef** | Navigation, command palette | DOM refs, mutable values |
| **Custom Hooks** | `useAuthStore` from Zustand | Composable state logic |
| **Memoization** | `React.memo`, `useMemo`, `useCallback` | Performance optimization |
| **Error Boundaries** | `ErrorFallback.tsx` | Catch render errors gracefully |
| **Lazy Loading** | `Routes.tsx` | `React.lazy()`, `Suspense` |
| **Context** | Theme provider wrapping app | Avoid prop drilling |

### 5.3 — Material UI (MUI v5) — The Design System

```
frontend-react/src/theme/theme.tsx  ← The entire design system lives here
```

**What to study:**
- MUI `ThemeProvider` and `createTheme()`
- Typography system (Inter font, scale, weights)
- Palette: primary, secondary, error, warning, info colors in HSL
- Glassmorphism effect: `backdropFilter: 'blur(10px)'`, semi-transparent backgrounds
- `sx` prop vs `styled()` components
- MUI Grid v2 for layout
- MUI DataGrid for the log explorer table

```
Key MUI Components used:
  Box, Stack, Grid         ← Layout
  Typography               ← Text
  Card, Paper              ← Containers
  Button, IconButton       ← Actions
  TextField, Select        ← Form inputs
  Dialog, Drawer           ← Overlays
  Chip, Badge              ← Labels
  CircularProgress         ← Loading states
  Tooltip                  ← Help text
  DataGrid                 ← Large data tables (Log Explorer)
  Accordion                ← Collapsible sections
```

### 5.4 — Zustand — State Management (`utils/store.ts`)

```
ForenSOC uses Zustand instead of Redux (simpler, less boilerplate)

Stores:
  useAuthStore     ← isAuthenticated, user, token, setUser(), logout()

Usage example:
  const { user, isAuthenticated } = useAuthStore();
```

**What to study:**
- Why global state is needed (sharing data across many components)
- `create()` function in Zustand
- Selectors for performance
- Middleware: persist (localStorage), devtools

### 5.5 — The 18 Pages (Frontend Architecture)

```
frontend-react/src/pages/
├── LoginPage.tsx          ← JWT auth form, demo credentials chip
├── RegisterPage.tsx       ← User registration
├── OnboardingPage.tsx     ← First-time setup wizard
├── DashboardPage.tsx      ← Main metrics (charts, stats, live feed)
├── AlertsPage.tsx         ← Alert triage table with filters (biggest file 26KB)
├── CasesPage.tsx          ← Case management kanban/table
├── CaseDetailPage.tsx     ← Individual case with evidence + timeline
├── LogExplorerPage.tsx    ← Full-text log search (25KB, complex DataGrid)
├── DetectionRulesPage.tsx ← Sigma/YARA rule editor
├── EvidenceVaultPage.tsx  ← File upload + hash verification
├── ForensicsPage.tsx      ← Upload PCAP/RAM → run analysis
├── TimelinePage.tsx       ← Attack timeline visualization
├── MitrePage.tsx          ← MITRE ATT&CK matrix
├── ReportsPage.tsx        ← Generate + download PDF reports
├── AuditLogsPage.tsx      ← System audit log viewer
├── SettingsPage.tsx       ← User profile + platform config
├── PublicSearchPage.tsx   ← Public YARA sandbox (no login)
└── NotFoundPage.tsx       ← 404 page
```

### 5.6 — API Service Layer (`services/apiService.ts`)

This is the bridge between React and FastAPI:

```typescript
// Pattern used throughout apiService.ts
class ApiService {
  private baseURL = import.meta.env.VITE_API_BASE_URL;

  async getAlerts(filters?: AlertFilters): Promise<Alert[]> {
    const response = await axios.get(`${this.baseURL}/api/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters
    });
    return response.data;
  }
}
```

**What to study:**
- `axios` library (HTTP client)
- JWT token in request headers
- Axios interceptors (auto-refresh token)
- Error handling (401 → redirect to login)
- Environment variables in Vite (`import.meta.env.VITE_*`)

### 5.7 — Recharts (Data Visualization in Dashboard)

```
Used in: DashboardPage.tsx

Chart types:
  LineChart      ← Log ingestion over time
  BarChart       ← Alerts by severity
  PieChart       ← Alert status distribution
  AreaChart      ← Threat activity over time
  RadarChart     ← MITRE technique coverage
```

### 5.8 — Vite Build Tool

```
frontend-react/vite.config.ts

Key concepts:
  - Dev server with HMR (Hot Module Replacement)
  - Path aliases: @components, @services, @utils, @pages
  - Environment variables (VITE_ prefix)
  - Build optimization (code splitting, tree shaking)
  - Proxy to backend (avoids CORS in dev)
```

**📚 Frontend Resources:**
- TypeScript handbook (free): https://www.typescriptlang.org/docs/handbook/
- React docs (new): https://react.dev/learn
- Material UI docs: https://mui.com/material-ui/getting-started/
- Zustand docs: https://zustand-demo.pmnd.rs/
- Recharts docs: https://recharts.org/en-US/
- Vite docs: https://vitejs.dev/guide/

---

## 🟡 PHASE 6 — Real-Time WebSockets

> **Goal:** Understand how the dashboard updates live without page refresh.  
> **Files:** `services/socket_manager.py`, `frontend-react/src/services/socketService.ts`

### 6.1 — How Socket.io Works in ForenSOC

```
Flow:
  1. Backend starts Socket.io server (mounted on /socket.io)
  2. Frontend connects on page load (App.tsx: socketService.connect())
  3. When a new alert fires:
     a. detection_engine.py creates alert in DB
     b. Emits socket event: io.emit("new_alert", alert_data)
     c. Every connected browser receives it instantly
     d. Dashboard updates in real-time (no polling)

Backend (socket_manager.py):
  import socketio
  sio = socketio.AsyncServer(async_mode='asgi')
  await sio.emit("new_alert", {"id": 1, "severity": "High"})

Frontend (socketService.ts):
  const socket = io(BACKEND_URL);
  socket.on("new_alert", (data) => {
    store.addAlert(data);  // Updates Zustand → re-renders UI
  });
```

**What to study:**
- WebSocket protocol vs HTTP (persistent connection)
- Socket.io events: `emit`, `on`, `off`
- Rooms and namespaces (for multi-tenant later)
- Reconnection logic
- ASGI (Async Server Gateway Interface) — why FastAPI uses it

**📚 Resource:** Socket.io docs: https://socket.io/docs/v4/

---

## 🟡 PHASE 7 — DevOps (Docker + CI/CD + Deployment)

> **Goal:** Understand how ForenSOC is containerized and deployed.  
> **Files:** `docker-compose.yml`, `docker-compose.prod.yml`, `backend/Dockerfile`, `nginx/`, `render.yaml`

### 7.1 — Docker Concepts

```
ForenSOC/
├── docker-compose.yml        ← Dev environment (3 services)
├── docker-compose.prod.yml   ← Production (adds nginx)
├── backend/Dockerfile        ← How to build the Python container
└── nginx/                    ← Reverse proxy config
```

**Docker concepts used:**
```yaml
# docker-compose.yml pattern
services:
  backend:
    build: ./backend          # Build from Dockerfile
    ports: ["8000:8000"]      # Host:Container port mapping
    environment:
      DATABASE_URL: ${DB_URL} # Inject env variables
    depends_on: [db]          # Start order

  db:
    image: postgres:15        # Use official PostgreSQL image
    volumes:
      - pg_data:/var/lib/postgresql/data  # Persist data

  frontend:
    build: ./frontend-react   # Build React app
    ports: ["3000:80"]        # Nginx serves built app on 80
```

**What to study:**
- What a container is (vs a VM)
- `Dockerfile` instructions: FROM, WORKDIR, COPY, RUN, CMD, EXPOSE
- `docker-compose up --build -d`
- Volumes (data persistence)
- Networks (how containers talk to each other)
- Multi-stage builds (smaller final images)

### 7.2 — Nginx (Reverse Proxy)

```
nginx/ config does:
  1. Serves built React frontend (static files)
  2. Proxies /api/* requests to backend:8000
  3. Proxies /socket.io/* to backend WebSocket
  4. HTTPS termination (SSL certificate)
  5. Gzip compression for faster loading
```

### 7.3 — CI/CD with GitHub Actions (`.github/workflows/`)

**What to study:**
- What CI/CD means (Continuous Integration / Continuous Deployment)
- `.github/workflows/ci.yml` syntax: `on: push`, `jobs:`, `steps:`
- Running tests automatically on every git push
- Deploying to Render/Vercel from main branch

### 7.4 — Cloud Deployment (render.yaml)

```yaml
# render.yaml defines ForenSOC's cloud deployment
services:
  - type: web              # Web service
    name: forensoc-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Platforms ForenSOC supports:**
- **Render.com** — Backend API (free tier: 512MB RAM)
- **Vercel** — Frontend (free, global CDN)
- **Supabase** — PostgreSQL database (free: 500MB)

**📚 DevOps Resources:**
- Docker getting started: https://docs.docker.com/get-started/
- GitHub Actions docs: https://docs.github.com/en/actions
- Render deploy guide: https://render.com/docs

---

## 🟢 PHASE 8 — Advanced Topics (Study as You Grow)

### 8.1 — Security Hardening (Before Enterprise Customers)

| Topic | File | What to Study |
|-------|------|---------------|
| **JWT security** | `api/auth.py` | Short expiry, refresh tokens, revocation |
| **bcrypt** | `services/auth_service.py` | Why slow hashing prevents brute force |
| **Rate limiting** | `main.py` SlowAPI | 200 req/min per IP — tune for your users |
| **CORS policy** | `main.py` CORSMiddleware | `allow_origins` — restrict to your domain only |
| **SQL injection** | All `crud/` files | SQLAlchemy ORM prevents it — understand why |
| **File upload security** | `api/evidence.py` | Magic bytes check, file size limits, virus scan |
| **HTTPS** | `nginx/` | TLS certificates, Let's Encrypt |
| **OWASP Top 10** | General | The 10 most critical web security risks |

### 8.2 — AI Integration (`services/ai_analyst.py`)

```
ForenSOC has an AI analyst service stub.
What it could do:
  - Auto-triage alerts by severity using ML
  - Summarize attack timelines in plain English
  - Suggest remediation steps for detected threats
  - Anomaly detection on log patterns

Study: OpenAI API, LangChain, or local LLMs (Ollama)
```

### 8.3 — Celery + Redis (Async Task Queue)

```python
# Commented out in requirements.txt — optional feature
# celery==5.3.4
# redis==5.0.1

# backend/app/celery_app.py — already scaffolded
# Use case: Run Volatility analysis in background
#   (memory dumps take 30-60 seconds — can't block the HTTP request)
```

**What to study:**
- Why you need a task queue (long-running operations)
- Celery workers, queues, brokers
- Redis as message broker

### 8.4 — Multi-Tenancy (Critical for SaaS)

```
Currently: Single-tenant (one organization per instance)
Needed for SaaS: Multiple customers sharing one deployment

Approach to study:
  Option A: Row-level security (add tenant_id to every table)
  Option B: Schema-per-tenant (PostgreSQL schemas)
  Option C: Database-per-tenant (most isolated, expensive)
```

### 8.5 — Observability (For Production)

```
Add these before enterprise customers:
  - Sentry        ← Error tracking (crashes in production)
  - PostHog       ← User analytics (which features are used)
  - Prometheus    ← Metrics (API latency, DB query time)
  - Grafana       ← Dashboard for Prometheus metrics
  - Loguru        ← Already in use! Better than print() for logs
```

### 8.6 — Elastic Integration (`services/elastic_integration.py`)

```
ForenSOC has a stub for Elasticsearch integration.
  - Elasticsearch = search engine optimized for log data
  - Used by Elastic SIEM, Kibana
  - Would replace PostgreSQL for log storage at scale
  - 1 billion log events → needs Elasticsearch, not PostgreSQL

Study:
  - Elasticsearch basics: https://www.elastic.co/guide/en/elasticsearch/reference/
  - When to use ES vs PostgreSQL (scale threshold)
```

---

## 📅 Recommended Study Schedule

| Week | Focus | Daily Time | Milestone |
|------|-------|-----------|-----------|
| 1–2 | Python fundamentals + async | 2 hrs/day | Can read backend code comfortably |
| 3–4 | FastAPI + Pydantic + JWT auth | 2 hrs/day | Can add a new API endpoint |
| 5–6 | SQLAlchemy + PostgreSQL | 2 hrs/day | Can add a new DB model + CRUD |
| 7–8 | SIEM concepts + Sigma rules | 2 hrs/day | Can write and test a detection rule |
| 9–10 | DFIR: Volatility + Zeek + YARA | 2 hrs/day | Can analyze a sample PCAP file |
| 11 | MITRE ATT&CK framework | 2 hrs/day | Can map an attack to techniques |
| 12–13 | TypeScript + React 18 | 2 hrs/day | Can add a new frontend page |
| 14 | MUI + Zustand + Recharts | 2 hrs/day | Can build a chart component |
| 15 | WebSockets + real-time | 1 hr/day | Can add a new socket event |
| 16–17 | Docker + deployment | 2 hrs/day | Can deploy ForenSOC to Render |
| 18+ | Security hardening + advanced | 1 hr/day | Ongoing |

---

## 🛠️ Practical Exercises (Learn by Doing)

Do these directly inside the ForenSOC codebase:

### Beginner
1. **Add a new field** to the `Alert` model (e.g., `analyst_notes`) — touch `models/alert.py`, `schemas/alert.py`, `crud/alert.py`, `api/alerts.py`, and the frontend `AlertsPage.tsx`
2. **Write a new Sigma rule** via the UI — test it by ingesting a log that should trigger it
3. **Upload a sample PCAP** — analyze with Zeek, understand the output

### Intermediate
4. **Add email notifications** — when a Critical alert fires, send an email (use `smtplib` or `SendGrid`)
5. **Add a new chart** to `DashboardPage.tsx` — e.g., "Alerts by Day of Week" (Recharts BarChart)
6. **Write a YARA rule** for a simple malware pattern — test in the public sandbox

### Advanced
7. **Implement multi-tenancy** — add `tenant_id` to `User` model and filter all queries by it
8. **Add Celery** — move Volatility analysis to a background task
9. **Add PostHog analytics** — track which pages users visit most
10. **Write a new forensics module** — browser forensics for Firefox (extend `file_analyzer.py`)

---

## 📚 Master Reading List

| Book / Resource | Why Read It | Free? |
|----------------|------------|-------|
| Python Docs Tutorial | Phase 1 foundation | ✅ Free |
| FastAPI Official Docs | Best API docs ever written | ✅ Free |
| SQLAlchemy 2.0 Tutorial | Phase 3 database layer | ✅ Free |
| TryHackMe — SOC Analyst path | Phase 4 cybersecurity | Mostly free |
| React.dev Learn | Phase 5 React 18 | ✅ Free |
| TypeScript Handbook | Phase 5 TypeScript | ✅ Free |
| Docker Getting Started | Phase 7 | ✅ Free |
| MITRE ATT&CK website | Phase 4 framework | ✅ Free |
| "The Web Application Hacker's Handbook" | Security hardening | Paid (~$40) |
| "Blue Team Handbook" | DFIR + SOC operations | Paid (~$30) |

---

*This roadmap covers 100% of technologies, patterns, and concepts inside the ForenSOC codebase.*  
*Last updated: 2026-05-25 — Generated from direct analysis of every file in the project.*
