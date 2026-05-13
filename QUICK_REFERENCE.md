# ForenSOC - Quick Reference & Technology Stack

## Technology Stack Summary

### Backend
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | FastAPI | 0.95+ | REST API framework |
| **ASGI Server** | Uvicorn | 0.20+ | ASGI web server |
| **ORM** | SQLAlchemy | 2.0+ | Database ORM |
| **Database** | PostgreSQL | 12+ | Primary database |
| **Auth** | FastAPI-JWT | Latest | JWT authentication |
| **Validation** | Pydantic | 2.0+ | Data validation |
| **Async Tasks** | Celery | 5.3+ | Async task queue |
| **Message Broker** | Redis | 7.0+ | Celery backend |
| **Migrations** | Alembic | 1.10+ | Database migrations |

### Forensics & Analysis
| Tool | Purpose | Integration |
|------|---------|-------------|
| **Volatility 3** | Memory analysis | subprocess, plugin execution |
| **Zeek** | Network IDS, PCAP analysis | subprocess, log parsing |
| **Suricata** | Network IDS, EVE JSON output | JSON parsing |
| **YARA** | Malware pattern matching | yara-python library |
| **ReportLab** | PDF generation | Python library |
| **pyshark** | PCAP parsing (optional) | Python library |
| **sqlite3** | Chrome history DB parsing | Python standard library |

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18 + TypeScript | Production-ready UI |
| **UI Library** | Material-UI 5 | Professional Material Design |
| **State Management** | Zustand | Lightweight state management |
| **HTTP Client** | Axios | API communication with interceptors |
| **Build Tool** | Vite | Fast build tool |
| **Charts** | Recharts | Data visualization |
| **Routing** | React Router v6 | Client-side routing |

### Development Tools
| Tool | Purpose |
|------|---------|
| **Version Control** | Git |
| **Testing** | pytest, pytest-asyncio |
| **Code Quality** | pylint, flake8, black |
| **Type Checking** | mypy |
| **API Documentation** | Swagger/OpenAPI |
| **Containerization** | Docker, Docker Compose |

---

## Quick Project Statistics

| Metric | Value |
|--------|-------|
| **Expected Total Lines of Code** | 8,000-12,000 |
| **Database Tables** | 17+ |
| **API Endpoints** | 50+ |
| **Core Services** | 12+ |
| **Implementation Timeline** | 18-24 weeks |
| **Estimated Development Time (1 dev)** | 3-4 months |

---

## Directory Structure at a Glance

```
ForenSOC/
├── backend/
│   ├── app/
│   │   ├── models/          (Database models: 10+ files)
│   │   ├── schemas/         (Pydantic schemas: 10+ files)
│   │   ├── crud/            (CRUD operations: 8+ files)
│   │   ├── api/             (API routes: 14+ files)
│   │   ├── services/        (Business logic: 12+ files)
│   │   ├── utils/           (Utilities: 7+ files)
│   │   ├── tasks/           (Celery tasks: 4+ files)
│   │   ├── rules/           (Detection rules: 3+ files)
│   │   ├── main.py          (FastAPI app)
│   │   ├── config.py        (Configuration)
│   │   └── database.py      (DB connection)
│   ├── tests/               (Unit & integration tests)
│   ├── migrations/          (Alembic migrations)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend-react/
│   ├── src/
│   │   ├── components/      (React components)
│   │   ├── pages/           (Page components: 8 pages)
│   │   ├── services/        (API service layer)
│   │   ├── types/           (TypeScript type definitions)
│   │   ├── theme/           (Material-UI theme)
│   │   ├── utils/           (Utilities & stores)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/              (Static assets)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml
└── docs/                    (Project documentation)
```

---

## Core Detection Rules (Phase 2)

### SSH Brute Force Detection
```yaml
Detection:
  - Pattern: Failed SSH login attempts
  - Threshold: 5+ failed attempts per username in 2 minutes
  - Severity: High
  - MITRE: Credential Access / Brute Force (T1110)
```

### Port Scan Detection
```yaml
Detection:
  - Pattern: Connection attempts to multiple ports from single source
  - Threshold: 20+ destination ports in 2 minutes
  - Severity: High
  - MITRE: Discovery / Network Service Discovery (T1046)
```

### Suspicious PowerShell Detection
```yaml
Detection:
  - Pattern: PowerShell with encoded commands
  - Keywords: -enc, -e, FromBase64String, IEX
  - Severity: High
  - MITRE: Execution / PowerShell (T1059)
```

### Ransomware Detection
```yaml
Detection:
  - Pattern: Mass file modifications with extension changes
  - Threshold: 30+ files in 1 minute with .locked/.encrypted/.crypto
  - Severity: Critical
  - MITRE: Impact / Data Encrypted for Impact (T1486)
```

### Data Exfiltration Detection
```yaml
Detection:
  - Pattern: Unusually high outbound data transfer
  - Threshold: >1GB to external IP in 5 minutes
  - Severity: High
  - MITRE: Exfiltration / Exfiltration Over C2 Channel (T1041)
```

---

## Key Database Relationships

```
users ──┐
        ├──→ cases ──┬──→ alerts ──→ mitre_mappings
        │            ├──→ evidence ──→ chain_of_custody
        │            ├──→ case_notes
        │            └──→ timeline_events ──┬──→ alerts
        │                                    ├──→ evidence
        │                                    └──→ normalized_events
        │
        ├──→ alerts ──┬──→ raw_events ──→ normalized_events
        │             └──→ case_notes
        │
        ├──→ evidence ──┬──→ chain_of_custody
        │               ├──→ yara_results
        │               ├──→ volatility_results
        │               ├──→ pcap_analysis
        │               └──→ browser_artifacts
        │
        └──→ reports
```

---

## Key Forensic Workflows

### Workflow 1: Alert to Investigation Case
```
1. Log Ingestion & Normalization
   └→ Detection Engine runs rules
     └→ Alert Generated
       └→ Analyst converts alert to Case
         └→ Evidence Collection begins
           └→ Analysis & Timeline building
             └→ Report Generation
```

### Workflow 2: PCAP Network Forensics
```
1. PCAP Upload
   └→ Zeek Analysis (conn.log, dns.log, http.log, etc.)
     └→ Suricata Alert generation
       └→ Port scan & Exfiltration Detection
         └→ Timeline events created
           └→ Evidence linked to case
```

### Workflow 3: Memory Forensics Analysis
```
1. Memory Dump Upload
   └→ Volatility 3 plugins executed (pslist, netstat, malfind, etc.)
     └→ Suspicious process detection
       └→ Process relationships mapped
         └→ Timeline events for executions
           └→ Malware indicators flagged
```

### Workflow 4: Complete Investigation
```
1. Case Created (from alert or manual)
2. Evidence Collection
   └→ Files uploaded (PCAP, memory, logs, etc.)
     └→ Hash verification & CoC logging
3. Analysis Execution
   └→ Zeek/Suricata for PCAP
     └→ Volatility 3 for memory
       └→ YARA for malware
         └→ Browser history extracted
4. Timeline Reconstruction
   └→ All events merged and correlated
5. MITRE Mapping
   └→ Techniques identified
6. Report Generation
   └→ Professional PDF with findings
```

---

## Important Implementation Notes

### Authentication & Authorization
- Use JWT tokens with 24-hour expiration
- Implement role-based access control (RBAC)
- Roles: Admin, Manager, Investigator, Analyst
- Audit log all actions by user

### Data Security
- Hash evidence files (SHA256 primary, MD5 secondary)
- Encrypt sensitive data in database
- Implement confidential flag for cases
- Complete chain of custody audit trail

### Performance Considerations
- Index frequently queried fields (case_id, timestamp, severity)
- Use pagination for large result sets (limit 50 by default)
- Implement caching for MITRE technique data
- Use async processing for long-running tasks (Celery)
- Consider full-text search for log searching (PostgreSQL FTS)

### Forensic Integrity
- Every evidence action logged with timestamp and actor
- Hash verification before and after analysis
- Immutable chain of custody records
- Report generation preserves case state at time of generation

### Error Handling
- Try-catch all external tool calls (Volatility, Zeek, etc.)
- Log detailed error messages for troubleshooting
- Fail gracefully with user-friendly error messages
- Return 202 Accepted for long-running operations with job_id

---

## Required Packages

### Backend Core
```
fastapi==0.95.0
uvicorn==0.20.0
sqlalchemy==2.0.0
psycopg2-binary==2.9.0
pydantic==2.0.0
python-dotenv==0.21.0
python-multipart==0.0.5
python-jose==3.3.0
passlib==1.7.4
bcrypt==4.0.0
```

### Forensics Tools
```
volatility3==2.4.0
yara-python==4.2.0
zeek-auxiliary==1.0.0  # Optional, often system-installed
suricata==7.0.0  # Often system-installed
```

### Utilities
```
reportlab==4.0.0
pandas==1.5.0
requests==2.28.0
pyshark==0.6.0  # For PCAP reading
```

### Frontend (Streamlit MVP)
```
streamlit==1.20.0
plotly==5.13.0
pandas==1.5.0
```

### Development & Testing
```
pytest==7.2.0
pytest-asyncio==0.20.0
black==23.1.0
pylint==2.16.0
mypy==1.0.0
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (target: >80% coverage)
- [ ] Code review completed
- [ ] Security audit performed
- [ ] Database backups configured
- [ ] Logging configured
- [ ] API documentation updated
- [ ] README with deployment instructions

### Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Reverse proxy configured (nginx/Apache)
- [ ] Regular expression rules validated
- [ ] File upload directory permissions set

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Log aggregation working
- [ ] Backup jobs running
- [ ] Users added and roles assigned
- [ ] Sample data loaded for testing
- [ ] Documentation accessible to team

---

## Presentation & Demo Scenarios

### Scenario 1: Log-Based Attack Detection (5 mins)
1. Upload sample auth.log with brute force attempts
2. Detection engine triggers SSH brute force alert
3. Show alert with severity and MITRE mapping
4. Convert alert to case
5. Show case timeline with related events

### Scenario 2: Network Forensics Analysis (8 mins)
1. Upload PCAP file with port scan traffic
2. Execute Zeek analysis automatically
3. Show detected port scans in alerts
4. Display Zeek conn.log analysis
5. Show top IPs and protocols
6. Demonstrate MITRE mapping for Discovery/Network Service Discovery

### Scenario 3: Memory Dump Forensics (8 mins)
1. Upload memory dump
2. Execute Volatility 3 pslist plugin
3. Show suspicious process (encoded PowerShell)
4. Execute malfind plugin
5. Display detected code injections
6. Create findings linked to case

### Scenario 4: Complete Incident Investigation (15 mins)
1. Create investigation case
2. Upload multiple evidence types (PCAP, memory, logs)
3. Run all forensic analyses
4. Show reconstructed timeline with all events
5. Display MITRE ATT&CK heatmap of techniques
6. Generate PDF report with findings
7. Show chain of custody audit trail

---

## Success Metrics

### Functionality
- ✅ Complete incident response workflow implemented
- ✅ All 14 modules operational
- ✅ 50+ API endpoints tested and documented
- ✅ Professional PDF reports generated
- ✅ MITRE ATT&CK mapping integrated

### Quality
- ✅ >80% test coverage
- ✅ Zero critical security issues
- ✅ <1 second p95 API response time
- ✅ <30 second report generation
- ✅ Complete audit trail for all actions

### Usability
- ✅ Intuitive UI with 11+ Streamlit pages
- ✅ Clear workflow from alert to report
- ✅ Helpful error messages
- ✅ Comprehensive documentation
- ✅ Demo scenarios work perfectly

### Presentation
- ✅ Clear architecture diagrams
- ✅ Comprehensive design documentation
- ✅ Live demonstration working smoothly
- ✅ Professional presentation materials
- ✅ Code quality and structure impressive

