# ForenSOC - Architecture & API Specification

## System Architecture

### High-Level Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA SOURCES                                 │
│  Logs, PCAPs, Memory Dumps, Files, Browser History             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   INGESTION LAYER                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Log Parser   │ │ PCAP Handler │ │ File Upload  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PROCESSING LAYER                                │
│  ┌────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │Normalizer  │ │ Hash Engine  │ │ Rule Engine  │              │
│  └────────────┘ └──────────────┘ └──────────────┘              │
│  ┌────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │ Zeek/Suri  │ │ Volatility 3 │ │ YARA Scanner │              │
│  └────────────┘ └──────────────┘ └──────────────┘              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DETECTION LAYER                                │
│  ┌──────────────────────────────────────────┐                  │
│  │ Detection Engine                         │                  │
│  │ - Rule Evaluation                        │                  │
│  │ - Threshold Calculation                  │                  │
│  │ - Alert Generation                       │                  │
│  └──────────────────────────────────────────┘                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  INVESTIGATION LAYER                             │
│  ┌────────────────────────────────────────────┐                │
│  │ Alert Management ─┐                        │                │
│  │ Case Management ──┼─→ Timeline Builder    │                │
│  │ Evidence Vault ───┼─→ CoC Logger          │                │
│  │ MITRE Mapper ─────┘                        │                │
│  └────────────────────────────────────────────┘                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REPORTING LAYER                                │
│  ┌──────────────────────────────────────────┐                  │
│  │ PDF Report Generator                     │                  │
│  │ - Content assembly                       │                  │
│  │ - Formatting & styling                   │                  │
│  │ - Evidence compilation                   │                  │
│  └──────────────────────────────────────────┘                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER                               │
│  PostgreSQL Database                                             │
│  - Raw Events, Normalized Events, Alerts                        │
│  - Cases, Evidence, Timeline Events                             │
│  - MITRE Mappings, Reports                                      │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER                                  │
│  ┌──────────────────────────────────────────┐                  │
│  │ Streamlit Web Interface                  │                  │
│  │ - Dashboard, Alerts, Cases               │                  │
│  │ - Evidence Vault, Network Forensics      │                  │
│  │ - Memory/File/Browser Analysis           │                  │
│  │ - Timeline, Reports                      │                  │
│  └──────────────────────────────────────────┘                  │
│                      ▲                                           │
│                      │ REST API                                  │
│              FastAPI Backend                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ API LAYER (Routes & Endpoints)                          │   │
│  │ ├─ /auth/* (Authentication)                             │   │
│  │ ├─ /logs/* (Log management)                             │   │
│  │ ├─ /alerts/* (Alert management)                         │   │
│  │ ├─ /cases/* (Case management)                           │   │
│  │ ├─ /evidence/* (Evidence vault)                         │   │
│  │ ├─ /pcap/* (Network forensics)                          │   │
│  │ ├─ /memory/* (Memory forensics)                         │   │
│  │ ├─ /files/* (File system forensics)                     │   │
│  │ ├─ /browser/* (Browser forensics)                       │   │
│  │ ├─ /timeline/* (Timeline reconstruction)                │   │
│  │ ├─ /yara/* (YARA scanning)                              │   │
│  │ ├─ /mitre/* (MITRE ATT&CK mapping)                      │   │
│  │ ├─ /reports/* (Report generation)                       │   │
│  │ └─ /dashboard/* (Dashboard metrics)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                       │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │ SERVICE LAYER (Business Logic)                           │  │
│  │ ├─ LogParser service                                    │  │
│  │ ├─ DetectionEngine service                              │  │
│  │ ├─ PCAPAnalyzer service                                 │  │
│  │ ├─ MemoryAnalyzer service                               │  │
│  │ ├─ FileAnalyzer service                                 │  │
│  │ ├─ BrowserAnalyzer service                              │  │
│  │ ├─ TimelineBuilder service                              │  │
│  │ ├─ EvidenceHandler service                              │  │
│  │ ├─ YARAScanner service                                  │  │
│  │ ├─ ReportGenerator service                              │  │
│  │ ├─ MITREMapper service                                  │  │
│  │ └─ ChainOfCustodyLogger service                          │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                       │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │ DATA LAYER (CRUD & Database)                             │  │
│  │ ├─ User CRUD                                             │  │
│  │ ├─ Alert CRUD                                            │  │
│  │ ├─ Case CRUD                                             │  │
│  │ ├─ Evidence CRUD                                         │  │
│  │ ├─ Event CRUD                                            │  │
│  │ └─ Timeline CRUD                                         │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                       │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │ EXTERNAL TOOLS INTEGRATION                               │  │
│  │ ├─ Volatility 3 (subprocess)                             │  │
│  │ ├─ Zeek (subprocess)                                     │  │
│  │ ├─ Suricata (JSON parsing)                               │  │
│  │ ├─ YARA (yara-python)                                    │  │
│  │ └─ ReportLab (PDF generation)                            │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                       │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            ▼
                    PostgreSQL Database
```

---

## API Endpoints Specification

### 1. Authentication Endpoints

```
POST /api/auth/login
  Request: { username: string, password: string }
  Response: { access_token: string, token_type: string, user: UserSchema }
  Status: 200 (success), 401 (unauthorized)

POST /api/auth/logout
  Headers: Authorization: Bearer <token>
  Response: { message: "Successfully logged out" }
  Status: 200

POST /api/auth/register (Admin only)
  Request: { username: string, email: string, password: string, role_id: int }
  Response: { id: int, username: string, email: string, role: string }
  Status: 201 (created), 400 (bad request), 409 (conflict)

GET /api/auth/me
  Headers: Authorization: Bearer <token>
  Response: { id: int, username: string, email: string, role: string }
  Status: 200
```

### 2. Log Management Endpoints

```
POST /api/logs/ingest
  Request: { log_source: string, logs: List[string] }
  Response: { ingested_count: int, errors: List[string] }
  Status: 200, 400

GET /api/logs/search
  Query: {
    case_id?: int,
    log_source?: string,
    source_ip?: string,
    dest_ip?: string,
    username?: string,
    event_type?: string,
    severity?: string,
    start_time?: datetime,
    end_time?: datetime,
    limit?: int (default 50),
    offset?: int (default 0)
  }
  Response: {
    total: int,
    items: List[NormalizedEventSchema],
    offset: int,
    limit: int
  }
  Status: 200

GET /api/logs/{log_id}
  Response: NormalizedEventSchema (with raw_event details)
  Status: 200, 404
```

### 3. Alert Endpoints

```
GET /api/alerts
  Query: {
    status?: string,
    severity?: string,
    assigned_to?: int,
    case_id?: int,
    limit?: int,
    offset?: int
  }
  Response: { total: int, items: List[AlertSchema] }
  Status: 200

GET /api/alerts/{alert_id}
  Response: AlertSchema (with full details, notes)
  Status: 200, 404

PATCH /api/alerts/{alert_id}
  Request: { status?: string, severity?: string, assigned_to?: int }
  Response: AlertSchema
  Status: 200, 404

POST /api/alerts/{alert_id}/notes
  Request: { note_text: string }
  Response: { id: int, note_text: string, created_at: datetime }
  Status: 201, 404

POST /api/alerts/{alert_id}/convert-to-case
  Request: { case_title: string, description?: string }
  Response: { case_id: int, case_number: string }
  Status: 201, 404

DELETE /api/alerts/{alert_id}
  Status: 204 (no content), 404
```

### 4. Case Endpoints

```
GET /api/cases
  Query: { status?: string, assigned_to?: int, limit?: int, offset?: int }
  Response: { total: int, items: List[CaseSchema] }
  Status: 200

POST /api/cases
  Request: {
    title: string,
    description: string,
    severity: string,
    case_type: string
  }
  Response: CaseSchema (with case_number auto-generated)
  Status: 201, 400

GET /api/cases/{case_id}
  Response: CaseSchema (full details with alerts, evidence count)
  Status: 200, 404

PATCH /api/cases/{case_id}
  Request: { title?: string, description?: string, status?: string, assigned_to?: int }
  Response: CaseSchema
  Status: 200, 404

POST /api/cases/{case_id}/close
  Request: { close_notes?: string }
  Response: CaseSchema (with closed_at timestamp)
  Status: 200, 404

GET /api/cases/{case_id}/timeline
  Query: { source?: string, severity?: string }
  Response: List[TimelineEventSchema] (sorted by event_time)
  Status: 200

GET /api/cases/{case_id}/evidence
  Response: List[EvidenceSchema]
  Status: 200

GET /api/cases/{case_id}/alerts
  Response: List[AlertSchema]
  Status: 200

POST /api/cases/{case_id}/notes
  Request: { note_text: string, note_type?: string }
  Response: { id: int, note_text: string, created_at: datetime }
  Status: 201
```

### 5. Evidence Endpoints

```
POST /api/evidence/upload
  Request: FormData {
    case_id: int,
    evidence_type: string,
    file: binary,
    description?: string
  }
  Response: {
    id: int,
    evidence_id: string,
    filename: string,
    sha256_hash: string,
    integrity_status: string,
    uploaded_at: datetime
  }
  Status: 201, 400

GET /api/evidence
  Query: { case_id?: int, evidence_type?: string, limit?: int, offset?: int }
  Response: { total: int, items: List[EvidenceSchema] }
  Status: 200

GET /api/evidence/{evidence_id}
  Response: EvidenceSchema (with metadata, hashes, CoC count)
  Status: 200, 404

POST /api/evidence/{evidence_id}/verify-hash
  Response: { integrity_status: string, hash_match: bool }
  Status: 200, 404

GET /api/evidence/{evidence_id}/chain-of-custody
  Response: List[ChainOfCustodySchema] (ordered by action_time)
  Status: 200, 404

GET /api/evidence/{evidence_id}/download
  Response: File binary
  Status: 200, 404
```

### 6. PCAP Analysis Endpoints

```
POST /api/pcap/upload
  Request: FormData {
    case_id: int,
    file: binary (PCAP file),
    description?: string
  }
  Response: { evidence_id: int, status: "Processing" }
  Status: 201, 400

GET /api/pcap/{evidence_id}/summary
  Response: {
    total_packets: int,
    total_flows: int,
    top_ips: List[IPInfo],
    protocols: List[str],
    suspicious_flows: int,
    alerts_generated: int
  }
  Status: 200, 404

GET /api/pcap/{evidence_id}/zeek-logs
  Query: { log_type: string } # 'conn', 'dns', 'http', 'ssl', 'files', 'ssh'
  Response: { log_type: string, entries: List[dict] }
  Status: 200, 404

GET /api/pcap/{evidence_id}/suricata-alerts
  Query: { severity?: string }
  Response: List[AlertSchema]
  Status: 200, 404

POST /api/pcap/{evidence_id}/analyze
  Request: { zeek?: bool, suricata?: bool }
  Response: { status: "Analyzing" }
  Status: 202 (accepted)
```

### 7. Memory Forensics Endpoints

```
POST /api/memory/upload
  Request: FormData {
    case_id: int,
    file: binary (Memory dump),
    os_type: string,
    description?: string
  }
  Response: { evidence_id: int, status: "Uploaded" }
  Status: 201

GET /api/memory/{evidence_id}/available-plugins
  Response: List[{ plugin_name: string, description: string }]
  Status: 200

POST /api/memory/{evidence_id}/run-plugin
  Request: { plugin_name: string, parameters?: dict }
  Response: { status: "Processing", job_id: string }
  Status: 202

GET /api/memory/{evidence_id}/results/{job_id}
  Response: {
    plugin_name: string,
    status: string,
    output: dict,
    suspicious_indicators: List[string],
    analyzed_at: datetime
  }
  Status: 200, 404

GET /api/memory/{evidence_id}/summary
  Response: {
    os_type: string,
    total_processes: int,
    suspicious_processes: List[ProcessInfo],
    network_connections: List[ConnectionInfo],
    plugins_executed: List[str]
  }
  Status: 200
```

### 8. File System Forensics Endpoints

```
POST /api/files/scan
  Request: {
    case_id: int,
    scan_path: string,
    scan_type: string # 'directory' or 'disk_image'
  }
  Response: { job_id: string, status: "Scanning" }
  Status: 202

GET /api/files/{case_id}/scan-results
  Query: { scan_id?: string }
  Response: {
    total_files: int,
    recently_modified: List[FileInfo],
    suspicious_extensions: List[FileInfo],
    ransomware_indicators: List[RansomwareIndicator]
  }
  Status: 200

GET /api/files/{case_id}/ransomware-detection
  Response: {
    detected: bool,
    severity: string,
    modified_file_count: int,
    affected_extensions: List[string],
    time_window: string
  }
  Status: 200
```

### 9. Browser Forensics Endpoints

```
POST /api/browser/upload-history
  Request: FormData {
    case_id: int,
    file: binary (Chrome History SQLite DB),
    browser_type: string
  }
  Response: { evidence_id: int, urls_extracted: int, downloads_extracted: int }
  Status: 201

GET /api/browser/{evidence_id}/urls
  Query: { suspicious_only?: bool }
  Response: List[{
    url: string,
    title: string,
    visit_count: int,
    last_visit_time: datetime
  }]
  Status: 200

GET /api/browser/{evidence_id}/downloads
  Query: { suspicious_only?: bool }
  Response: List[{
    filename: string,
    source_url: string,
    download_path: string,
    download_time: datetime,
    is_suspicious: bool,
    reason: string
  }]
  Status: 200
```

### 10. Timeline Endpoints

```
GET /api/timeline/{case_id}
  Query: {
    source?: string,
    severity?: string,
    event_type?: string,
    start_time?: datetime,
    end_time?: datetime
  }
  Response: List[TimelineEventSchema] (sorted by event_time ASC)
  Status: 200, 404

GET /api/timeline/{case_id}/correlations
  Response: {
    event_clusters: List[{
      events: List[TimelineEventSchema],
      time_window_minutes: int,
      confidence: float
    }]
  }
  Status: 200
```

### 11. YARA Endpoints

```
POST /api/yara/scan
  Request: {
    evidence_id: int,
    rule_set?: string # 'default', 'custom', 'all'
  }
  Response: { job_id: string, status: "Scanning" }
  Status: 202

GET /api/yara/{evidence_id}/results
  Response: List[{
    rule_name: string,
    matched: bool,
    severity: string,
    matched_strings: List[string],
    scan_time: datetime
  }]
  Status: 200
```

### 12. MITRE ATT&CK Endpoints

```
GET /api/mitre/tactics
  Response: List[{ tactic: string, description: string, technique_count: int }]
  Status: 200

GET /api/mitre/techniques
  Query: { tactic?: string }
  Response: List[{
    technique_id: string,
    technique: string,
    tactic: string,
    description: string
  }]
  Status: 200

GET /api/mitre/case/{case_id}
  Response: {
    tactics: List[{
      tactic: string,
      count: int,
      techniques: List[{
        technique_id: string,
        technique: string,
        count: int
      }]
    }]
  }
  Status: 200

POST /api/mitre/map-alert
  Request: { alert_id: int, technique_id: string, confidence: string }
  Response: { id: int, alert_id: int, technique_id: string }
  Status: 201
```

### 13. Report Endpoints

```
POST /api/reports/generate
  Request: {
    case_id: int,
    report_type?: string,
    include_sections?: List[string]
  }
  Response: { report_id: int, status: "Generating", job_id: string }
  Status: 202

GET /api/reports/{report_id}
  Response: {
    id: int,
    report_number: string,
    case_id: int,
    status: string,
    generated_at: datetime,
    file_path: string,
    file_size: int
  }
  Status: 200, 404

GET /api/reports/{report_id}/download
  Response: File binary (PDF)
  Status: 200, 404

GET /api/reports/case/{case_id}
  Response: List[ReportSchema]
  Status: 200
```

### 14. Dashboard Endpoints

```
GET /api/dashboard/metrics
  Response: {
    total_alerts: int,
    total_cases: int,
    total_evidence: int,
    critical_alerts: int,
    open_cases: int,
    closed_cases: int,
    alerts_by_severity: { Low: int, Medium: int, High: int, Critical: int },
    cases_by_status: { Open: int, Closed: int, OnHold: int }
  }
  Status: 200

GET /api/dashboard/recent-alerts
  Query: { limit?: int (default 10) }
  Response: List[AlertSchema]
  Status: 200

GET /api/dashboard/open-cases
  Query: { limit?: int (default 10) }
  Response: List[CaseSchema]
  Status: 200

GET /api/dashboard/critical-alerts
  Response: List[AlertSchema] (severity = 'Critical' or 'High')
  Status: 200
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "detail": "Error description",
  "status_code": 400,
  "timestamp": "2026-05-12T10:30:00Z"
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 202: Accepted (async operation)
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (duplicate)
- 500: Internal Server Error

---

## Rate Limiting (Optional)

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1620000000
```

Default: 1000 requests per hour per user

---

## Pagination

List endpoints support pagination:
```
GET /api/alerts?limit=20&offset=0
```

Response includes:
```json
{
  "total": 150,
  "items": [...],
  "limit": 20,
  "offset": 0
}
```

