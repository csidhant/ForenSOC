# ForenSOC - Project Design Document

## 1. Project Overview

**Project Name**: ForenSOC: Advanced Integrated SOC and Digital Forensics Platform
**Domain**: Cybersecurity, SOC, DFIR, Digital Forensics
**Scope**: Integrated platform for automated incident detection, investigation, and forensic reporting

---

## 2. Technology Stack Recommendation

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (production) / SQLite (MVP)
- **Task Queue**: Celery (for async processing)
- **Message Broker**: Redis (for Celery)
- **APIs**: RESTful API with OpenAPI/Swagger documentation

### Frontend
- **Option 1 (Faster MVP)**: Streamlit (rapid prototyping)
- **Option 2 (Advanced)**: React + TypeScript with Material-UI
- **Dashboard**: Real-time updates with WebSockets

### Forensics & Analysis Tools
- **Log Processing**: Python (pandas, loguru)
- **PCAP Analysis**: pyshark, Zeek, Suricata
- **Memory Analysis**: Volatility 3 (via subprocess)
- **File Analysis**: YARA rules
- **PDF Generation**: ReportLab
- **Browser Database**: sqlite3 (for Chrome history)

### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **Version Control**: Git
- **Testing**: pytest, pytest-asyncio
- **Logging**: Python logging + structured logging

---

## 3. Project Directory Structure

```
ForenSOC/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI entry point
│   │   ├── config.py                  # Configuration management
│   │   ├── database.py                # Database connection & session
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── host.py
│   │   │   ├── event.py
│   │   │   ├── alert.py
│   │   │   ├── case.py
│   │   │   ├── evidence.py
│   │   │   ├── chain_of_custody.py
│   │   │   ├── timeline.py
│   │   │   ├── mitre_mapping.py
│   │   │   ├── report.py
│   │   │   └── yara_result.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── alert.py
│   │   │   ├── case.py
│   │   │   ├── evidence.py
│   │   │   ├── event.py
│   │   │   └── timeline.py
│   │   │
│   │   ├── crud/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── alert.py
│   │   │   ├── case.py
│   │   │   ├── evidence.py
│   │   │   ├── event.py
│   │   │   └── timeline.py
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                # Authentication endpoints
│   │   │   ├── logs.py                # Log ingestion & search
│   │   │   ├── alerts.py              # Alert management
│   │   │   ├── cases.py               # Case management
│   │   │   ├── evidence.py            # Evidence vault
│   │   │   ├── pcap.py                # Network forensics
│   │   │   ├── memory.py              # Memory forensics (Volatility)
│   │   │   ├── files.py               # File system forensics
│   │   │   ├── browser.py             # Browser forensics
│   │   │   ├── timeline.py            # Timeline reconstruction
│   │   │   ├── reports.py             # Report generation
│   │   │   ├── yara.py                # YARA scanning
│   │   │   ├── mitre.py               # MITRE ATT&CK mapping
│   │   │   └── dashboard.py           # Dashboard metrics
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── log_parser.py          # Log parsing & normalization
│   │   │   ├── detection_engine.py    # Detection rules & alerts
│   │   │   ├── pcap_analyzer.py       # PCAP analysis (Zeek, Suricata)
│   │   │   ├── memory_analyzer.py     # Volatility 3 wrapper
│   │   │   ├── file_analyzer.py       # File system analysis
│   │   │   ├── browser_analyzer.py    # Browser history analysis
│   │   │   ├── timeline_builder.py    # Timeline reconstruction
│   │   │   ├── evidence_handler.py    # Evidence hashing & verification
│   │   │   ├── yara_scanner.py        # YARA rule execution
│   │   │   ├── report_generator.py    # PDF report generation
│   │   │   ├── mitre_mapper.py        # MITRE technique mapping
│   │   │   └── chain_of_custody.py    # CoC logging
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── hash_utils.py          # SHA256, MD5 hashing
│   │   │   ├── file_utils.py          # File operations
│   │   │   ├── datetime_utils.py      # Timestamp parsing
│   │   │   ├── validators.py          # Input validation
│   │   │   ├── constants.py           # Constants & severities
│   │   │   └── logging_config.py      # Logging setup
│   │   │
│   │   ├── tasks/
│   │   │   ├── __init__.py
│   │   │   ├── log_processing.py      # Async log processing
│   │   │   ├── detection_tasks.py     # Async detection
│   │   │   ├── forensics_tasks.py     # Async forensic analysis
│   │   │   └── report_tasks.py        # Async report generation
│   │   │
│   │   └── rules/
│   │       ├── __init__.py
│   │       ├── sigma_loader.py        # Sigma rule parser
│   │       ├── detection_rules.py     # Built-in detection rules
│   │       └── yara_rules/            # YARA rule files
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_api.py
│   │   ├── test_services.py
│   │   ├── test_detection.py
│   │   └── conftest.py
│   │
│   ├── migrations/                    # Alembic migrations
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── streamlit_app.py              # Streamlit UI (MVP option)
│   ├── pages/
│   │   ├── 1_Dashboard.py
│   │   ├── 2_Log_Explorer.py
│   │   ├── 3_Alerts.py
│   │   ├── 4_Cases.py
│   │   ├── 5_Evidence.py
│   │   ├── 6_Network_Forensics.py
│   │   ├── 7_Memory_Forensics.py
│   │   ├── 8_Browser_Forensics.py
│   │   ├── 9_MITRE_ATT&CK.py
│   │   ├── 10_Reports.py
│   │   └── 11_Settings.py
│   ├── components/
│   │   ├── sidebar.py
│   │   ├── metrics.py
│   │   └── charts.py
│   ├── requirements.txt
│   └── .streamlit/
│       └── config.toml
│
├── docker-compose.yml
├── README.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── API_ENDPOINTS.md
├── SETUP_GUIDE.md
└── .gitignore
```

---

## 4. Core Services Architecture

### Service Layer Responsibilities

#### 1. **LogParser Service**
- Ingest logs from: Linux auth logs, web server logs, Windows events, CSV
- Normalize to common schema: timestamp, source_ip, dest_ip, username, hostname, event_type, severity
- Store in raw_events and normalized_events tables

#### 2. **DetectionEngine Service**
- Load and execute detection rules
- Support rule types: SSH brute force, port scan, suspicious PowerShell, ransomware activity
- Generate alerts with severity and MITRE mapping
- Rate-based detection: events within timeframe threshold

#### 3. **PCAPAnalyzer Service**
- Upload and parse PCAP files
- Execute Zeek for: conn.log, dns.log, http.log, ssl.log, files.log, ssh.log
- Execute Suricata for: EVE JSON alerts, flows, DNS, HTTP, TLS
- Detect: port scans, DNS tunneling, data exfiltration, suspicious downloads
- Create alerts for detected suspicious patterns

#### 4. **MemoryAnalyzer Service**
- Accept memory dump uploads
- Execute Volatility 3 plugins: windows.info, pslist, pstree, netstat, cmdline, dlllist, malfind
- Flag suspicious indicators: encoded PowerShell, office→cmd, unknown Temp executables
- Create findings tied to evidence

#### 5. **FileAnalyzer Service**
- Scan uploaded folders or disk image extracts
- Detect recently modified files
- Calculate SHA256 hashes
- Detect ransomware: >30 files modified in 1 min with .locked/.encrypted extension
- Flag suspicious executable extensions

#### 6. **BrowserAnalyzer Service**
- Parse Chrome/Chromium SQLite history database
- Extract: URLs, titles, visit counts, last visit time
- Extract downloads: filename, source URL, target path
- Flag suspicious downloads: .exe, .ps1, .bat, .zip, .js, .vbs
- Correlate with timeline events

#### 7. **TimelineBuilder Service**
- Merge events from: alerts, logs, PCAP analysis, browser history, file changes, memory analysis
- Chronological sorting
- Source-specific event schemas
- Time-based correlation and clustering

#### 8. **EvidenceHandler Service**
- Generate SHA256 and MD5 hashes
- Verify integrity on demand
- Maintain metadata: filename, type, case_id, collected_by, collected_time
- Track chain of custody for all actions

#### 9. **YARAScanner Service**
- Load and compile YARA rules
- Execute scans on uploaded files
- Return: matched rule, metadata, severity, matched strings
- Attach results to evidence

#### 10. **ReportGenerator Service**
- Generate PDF with sections: Executive Summary, Incident Details, Detection Summary, Affected Assets, Timeline, Evidence, Forensic Analysis, MITRE Mapping, IOCs, Recommendations, CoC, Appendix
- Use ReportLab for PDF generation
- Include charts and tables

#### 11. **MITREMapper Service**
- Map detection types to MITRE tactics/techniques
- Store mapping in mitre_mappings table
- Return for alert/case views

#### 12. **ChainOfCustodyLogger Service**
- Log every action: upload, view, analyze, export, hash verify, report generate
- Timestamp all actions
- Store actor (analyst name)
- Preserve evidence integrity audit trail

---

## 5. Database Schema (Key Tables)

```sql
-- Users & Roles
users (id, username, email, password_hash, role, created_at)
roles (id, name, permissions)

-- Host Management
hosts (id, hostname, os_type, ip_address, case_id, created_at)

-- Event Logging
raw_events (id, log_source, raw_data, collected_at, case_id)
normalized_events (id, timestamp, source_ip, dest_ip, username, hostname, event_type, severity, raw_event_id, case_id)

-- Alerting & Cases
alerts (id, title, description, severity, status, source_ip, dest_ip, hostname, event_time, detected_time, mitre_tactic, mitre_technique, mitre_id, raw_event_id, case_id, assigned_to, created_at)
cases (id, case_number, title, description, severity, status, created_by, assigned_to, created_at, closed_at)
case_notes (id, case_id, analyst, note_text, created_at)

-- Evidence Management
evidence (id, case_id, evidence_type, filename, original_path, stored_path, sha256_hash, md5_hash, file_size, uploaded_by, uploaded_at, integrity_status)
chain_of_custody (id, evidence_id, action, actor, action_time, details)

-- Timeline & Forensics
timeline_events (id, case_id, event_time, source, event_type, description, severity, related_alert_id, related_evidence_id)
mitre_mappings (id, alert_id, tactic, technique, technique_id)
yara_results (id, evidence_id, rule_name, matched, severity)
volatility_results (id, evidence_id, plugin_name, output)
pcap_analysis (id, case_id, zeek_conn_log, zeek_dns_log, suricata_alerts)
browser_artifacts (id, evidence_id, url, title, visit_time, download_source, download_path)

-- Reporting
reports (id, case_id, report_type, generated_at, generated_by, file_path, status)
```

---

## 6. API Endpoints Overview

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - Register user (admin only)

### Log Management
- `POST /api/logs/ingest` - Upload and parse logs
- `GET /api/logs/search` - Search logs by filters
- `GET /api/logs/{id}` - Get specific log entry

### Alerts
- `GET /api/alerts` - List alerts with filters
- `GET /api/alerts/{id}` - Get alert details
- `PATCH /api/alerts/{id}` - Update alert (status, assignment)
- `POST /api/alerts/{id}/convert-to-case` - Convert alert to case
- `POST /api/alerts/{id}/notes` - Add analyst notes

### Cases
- `GET /api/cases` - List cases
- `POST /api/cases` - Create new case
- `GET /api/cases/{id}` - Get case details
- `PATCH /api/cases/{id}` - Update case
- `GET /api/cases/{id}/timeline` - Get case timeline
- `GET /api/cases/{id}/evidence` - List case evidence
- `POST /api/cases/{id}/notes` - Add case notes
- `POST /api/cases/{id}/close` - Close case

### Evidence
- `POST /api/evidence/upload` - Upload evidence file
- `GET /api/evidence` - List evidence
- `GET /api/evidence/{id}` - Get evidence details
- `POST /api/evidence/{id}/verify-hash` - Verify integrity
- `GET /api/evidence/{id}/chain-of-custody` - Get CoC log

### Network Forensics
- `POST /api/pcap/upload` - Upload PCAP file
- `GET /api/pcap/{id}/summary` - Get PCAP analysis summary
- `GET /api/pcap/{id}/zeek-logs` - Get Zeek output
- `GET /api/pcap/{id}/suricata-alerts` - Get Suricata alerts

### Memory Forensics
- `POST /api/memory/upload` - Upload memory dump
- `POST /api/memory/{id}/run-plugin` - Execute Volatility plugin
- `GET /api/memory/{id}/results` - Get Volatility results

### File System Forensics
- `POST /api/files/scan` - Scan folder/disk image
- `GET /api/files/{id}/results` - Get scan results

### Browser Forensics
- `POST /api/browser/upload-history` - Upload browser history DB
- `GET /api/browser/{id}/urls` - Get extracted URLs
- `GET /api/browser/{id}/downloads` - Get extracted downloads

### Timeline
- `GET /api/timeline/{case_id}` - Get case timeline
- `GET /api/timeline/{case_id}/filter` - Get timeline with filters

### YARA Scanning
- `POST /api/yara/scan` - Scan file with YARA rules
- `GET /api/yara/results/{id}` - Get YARA scan results

### MITRE ATT&CK
- `GET /api/mitre/tactics` - List MITRE tactics
- `GET /api/mitre/case/{case_id}` - Get mapped techniques for case

### Reporting
- `POST /api/reports/generate` - Generate PDF report
- `GET /api/reports/{id}` - Download report
- `GET /api/reports/case/{case_id}` - List case reports

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/recent-alerts` - Get recent alerts
- `GET /api/dashboard/open-cases` - Get open cases
- `GET /api/dashboard/critical-alerts` - Get critical alerts

---

## 7. Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
- [ ] Set up FastAPI backend with PostgreSQL
- [ ] Database schema and Alembic migrations
- [ ] User authentication and authorization
- [ ] Basic CRUD operations for cases and alerts
- [ ] Streamlit UI skeleton with dashboard

### Phase 2: Log Management & Detection (Weeks 4-6)
- [ ] Log parser service (Linux auth, web server, CSV)
- [ ] Log normalization to common schema
- [ ] Detection engine with built-in rules
- [ ] Alert generation and management
- [ ] Log search and filter UI

### Phase 3: Evidence & Forensics (Weeks 7-9)
- [ ] Evidence collection and hashing (SHA256, MD5)
- [ ] Chain of custody logging
- [ ] File system forensics (hash, extension detection)
- [ ] Browser history analysis
- [ ] Evidence vault UI

### Phase 4: Network & Memory Forensics (Weeks 10-12)
- [ ] PCAP upload and Zeek integration
- [ ] Suricata EVE JSON parsing
- [ ] Port scan and data exfiltration detection
- [ ] Memory dump analysis with Volatility 3
- [ ] Network forensics UI

### Phase 5: Timeline & Analysis (Weeks 13-15)
- [ ] Timeline reconstruction engine
- [ ] Event correlation and merging
- [ ] MITRE ATT&CK mapping
- [ ] YARA rule scanning
- [ ] Timeline UI with filters

### Phase 6: Reporting & Polish (Weeks 16-18)
- [ ] PDF report generation with ReportLab
- [ ] Report sections: summary, timeline, evidence, CoC, recommendations
- [ ] MITRE mapping visualization
- [ ] Dashboard metrics and charts
- [ ] Testing and documentation

### Phase 7: Advanced Features & Optimization (Weeks 19+)
- [ ] Sigma rule loader
- [ ] Async task processing with Celery
- [ ] Advanced filtering and search
- [ ] User interface improvements
- [ ] Performance optimization
- [ ] Security hardening

---

## 8. Key Design Principles

1. **Evidence Integrity**: Every evidence action is logged and auditable
2. **Forensic Readiness**: Clear chain of custody for legal compliance
3. **Modular Design**: Each forensic module is independent and testable
4. **Scalability**: Async processing for long-running analyses
5. **Industry Alignment**: MITRE ATT&CK mapping for professional reporting
6. **User-Centric**: Clear workflow from alert to investigation to report
7. **Extensibility**: Support for custom rules, YARA rules, and plugins

---

## 9. Success Criteria

- End-to-end workflow: log ingestion → detection → alert → case → evidence → timeline → report
- Support multiple forensic analysis types (memory, file, network, browser)
- Professional PDF reports with MITRE ATT&CK mapping
- Chain of custody integrity verification
- Dashboard with real-time metrics
- Comprehensive API for all major functions
- Clear, intuitive UI for investigators

