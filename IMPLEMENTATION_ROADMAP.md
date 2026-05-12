# ForenSOC - Implementation Roadmap & Setup Guide

## Quick Start Setup

### Prerequisites
- Python 3.9+
- PostgreSQL 12+ (or SQLite for MVP)
- Docker & Docker Compose (optional)
- Git

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/ForenSOC.git
cd ForenSOC
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

#### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your settings:
# DATABASE_URL=postgresql://user:password@localhost/forensoc
# SECRET_KEY=your-secret-key-here
# DEBUG=false
```

#### 4. Database Setup
```bash
# Create database
createdb forensoc

# Run migrations
alembic upgrade head
```

#### 5. Backend Start
```bash
python -m uvicorn app.main:app --reload --port 8000
```

#### 6. Frontend Setup
```bash
cd frontend
pip install -r requirements.txt
streamlit run streamlit_app.py
```

#### 7. Access Application
- Frontend: http://localhost:8501
- API Docs: http://localhost:8000/docs
- API ReDoc: http://localhost:8000/redoc

---

## Docker Setup (Optional)

### Build and Run with Docker Compose
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- FastAPI backend on port 8000
- Streamlit frontend on port 8501

---

## Phase 1: Foundation (Weeks 1-3)

### Week 1: Project Setup & Database
- [ ] Initialize Git repository
- [ ] Set up Python virtual environment
- [ ] Install FastAPI, SQLAlchemy, Pydantic dependencies
- [ ] Create project directory structure
- [ ] Set up PostgreSQL database
- [ ] Create database schema (users, roles, cases, alerts, evidence)
- [ ] Create Alembic migrations

### Week 2: Authentication & User Management
- [ ] Implement JWT authentication
- [ ] Create user registration endpoint
- [ ] Create user login endpoint
- [ ] Create role-based access control (RBAC)
- [ ] Create user management CRUD endpoints
- [ ] Implement password hashing (bcrypt)
- [ ] Add authentication middleware

### Week 3: Case & Alert Foundation
- [ ] Create Case CRUD operations
- [ ] Create Alert CRUD operations
- [ ] Implement case-alert relationship
- [ ] Create alert status workflow (New → In Progress → Closed)
- [ ] Add alert assignment functionality
- [ ] Create basic Streamlit dashboard
- [ ] Set up API documentation with Swagger

**Deliverable**: Basic API with authentication, case/alert management, and skeleton UI

---

## Phase 2: Log Management & Detection (Weeks 4-6)

### Week 4: Log Parser Service
- [ ] Create log parser module (LogParser service)
- [ ] Implement parsers for:
  - [ ] Linux auth.log (failed login, successful login)
  - [ ] Apache/Nginx web server logs (HTTP requests, errors)
  - [ ] CSV log import
  - [ ] Syslog format
- [ ] Create raw_events table insertion
- [ ] Test with sample logs

### Week 5: Log Normalization & Storage
- [ ] Create normalization schema
- [ ] Implement log normalization to common fields:
  - [ ] timestamp, source_ip, dest_ip, username, hostname, event_type, severity
- [ ] Create normalized_events table
- [ ] Implement log search API endpoint
- [ ] Create log filtering by IP, username, event type, severity
- [ ] Add pagination to log searches

### Week 6: Detection Engine
- [ ] Create Detection Engine service
- [ ] Implement built-in detection rules:
  - [ ] SSH brute force (5+ failed logins in 2 minutes)
  - [ ] Suspicious user creation
  - [ ] Repeated failed authentication attempts
  - [ ] Unusual login times
- [ ] Create alert generation logic
- [ ] Implement alert severity assignment
- [ ] Add MITRE mapping to basic rules
- [ ] Create Log Explorer UI in Streamlit

**Deliverable**: End-to-end log ingestion, detection, and alerting with UI

---

## Phase 3: Evidence Management & Basic Forensics (Weeks 7-9)

### Week 7: Evidence Collection & Hashing
- [ ] Create EvidenceHandler service
- [ ] Implement SHA256 and MD5 hashing
- [ ] Create evidence upload endpoint
- [ ] Store evidence metadata (filename, type, size, hashes)
- [ ] Create evidence retrieval endpoints
- [ ] Implement integrity verification (hash recalculation)
- [ ] Create evidence list UI in Streamlit

### Week 8: Chain of Custody Logging
- [ ] Create ChainOfCustodyLogger service
- [ ] Log all evidence actions (upload, view, analyze, export)
- [ ] Include timestamp, actor, and action details
- [ ] Create chain of custody audit trail UI
- [ ] Implement action filtering and searching
- [ ] Create Evidence Vault UI page

### Week 9: Basic File System Forensics
- [ ] Create FileAnalyzer service
- [ ] Implement file scanning (directory or disk image extract)
- [ ] Detect recently modified files
- [ ] Calculate file hashes
- [ ] Detect suspicious extensions (.exe, .dll, .ps1, .bat, .vbs)
- [ ] Detect ransomware-like activity (mass modification + extension change)
- [ ] Create file analysis results storage
- [ ] Create File System Forensics UI page

**Deliverable**: Complete evidence management with integrity verification and basic file analysis

---

## Phase 4: Network & Memory Forensics (Weeks 10-12)

### Week 10: Network Forensics - PCAP Handling
- [ ] Create PCAPAnalyzer service
- [ ] Implement PCAP file upload
- [ ] Integrate Zeek for PCAP analysis
- [ ] Parse Zeek outputs: conn.log, dns.log, http.log, ssl.log, files.log, ssh.log
- [ ] Store Zeek results in database
- [ ] Implement port scan detection (>20 ports in 2 minutes)
- [ ] Create PCAP analysis UI page

### Week 11: Network Forensics - Suricata Integration
- [ ] Integrate Suricata EVE JSON parsing
- [ ] Implement data exfiltration detection (outbound bytes threshold)
- [ ] Implement DNS tunneling detection (long DNS queries or many subdomains)
- [ ] Implement suspicious download detection
- [ ] Create alert generation for network anomalies
- [ ] Create network summary and alerts UI

### Week 12: Memory Forensics - Volatility 3
- [ ] Create MemoryAnalyzer service
- [ ] Implement memory dump upload
- [ ] Integrate Volatility 3 plugins:
  - [ ] windows.info
  - [ ] windows.pslist / windows.pstree
  - [ ] windows.netstat
  - [ ] windows.cmdline
  - [ ] windows.dlllist
  - [ ] windows.malfind
- [ ] Implement suspicious process detection
- [ ] Create memory analysis results storage
- [ ] Create Memory Forensics UI page
- [ ] Flag suspicious indicators (encoded PowerShell, office→cmd, etc.)

**Deliverable**: Complete network and memory forensics capabilities

---

## Phase 5: Timeline & Analysis Tools (Weeks 13-15)

### Week 13: Timeline Reconstruction
- [ ] Create TimelineBuilder service
- [ ] Implement event merging from multiple sources:
  - [ ] Alerts
  - [ ] Normalized events
  - [ ] PCAP analysis
  - [ ] Browser history
  - [ ] File modifications
  - [ ] Memory analysis
  - [ ] Evidence actions
- [ ] Implement chronological sorting
- [ ] Create timeline_events table
- [ ] Create Timeline UI with event display
- [ ] Implement timeline filtering by time range, source, severity

### Week 14: YARA & IOC Scanning
- [ ] Create YARAScanner service
- [ ] Implement YARA rule loading and compilation
- [ ] Create rule library:
  - [ ] Suspicious PowerShell rules
  - [ ] Malware signature rules
  - [ ] Suspicious file name patterns
- [ ] Implement YARA scan execution on evidence files
- [ ] Parse YARA results (matched rules, strings, severity)
- [ ] Create yara_results table
- [ ] Store results linked to evidence
- [ ] Create YARA scanning UI

### Week 15: MITRE ATT&CK Mapping
- [ ] Create MITREMapper service
- [ ] Build detection-to-MITRE mapping database
- [ ] Implement mapping for:
  - [ ] SSH brute force → Credential Access / Brute Force (T1110)
  - [ ] Port scan → Discovery / Network Service Discovery (T1046)
  - [ ] Suspicious downloads → Initial Access / Phishing (T1566)
  - [ ] PowerShell execution → Execution / PowerShell (T1059)
  - [ ] Ransomware activity → Impact / Data Encrypted for Impact (T1486)
- [ ] Create MITRE mappings display
- [ ] Create MITRE ATT&CK heatmap UI
- [ ] Link mappings to cases and alerts

**Deliverable**: Complete timeline reconstruction with YARA scanning and MITRE mapping

---

## Phase 6: Reporting & Polish (Weeks 16-18)

### Week 16: PDF Report Generation
- [ ] Create ReportGenerator service
- [ ] Implement PDF generation with ReportLab
- [ ] Create report structure:
  - [ ] Title page (case name, date, analyst)
  - [ ] Executive summary
  - [ ] Incident details and timeline
  - [ ] Affected hosts and assets
  - [ ] Detection summary (rules triggered)
  - [ ] Evidence collected and analysis results

### Week 17: Report Content & Tables
- [ ] Implement MITRE ATT&CK table in reports
- [ ] Add forensic findings section
- [ ] Create evidence table with hashes
- [ ] Add chain of custody table
- [ ] Create indicators of compromise (IOCs) section
- [ ] Add recommendations section
- [ ] Create report formatting and styling

### Week 18: Dashboard & Report UI
- [ ] Enhance dashboard with metrics:
  - [ ] Total alerts (by severity)
  - [ ] Open cases count
  - [ ] Critical alerts count
  - [ ] Evidence count
  - [ ] Latest incidents timeline
- [ ] Create reports page:
  - [ ] List generated reports
  - [ ] Generate new report button
  - [ ] Download report functionality
  - [ ] Report status tracking
- [ ] Implement report templates
- [ ] Create comprehensive help/documentation

**Deliverable**: Professional PDF reports with comprehensive case documentation

---

## Phase 7: Advanced Features (Weeks 19+)

### Advanced Features Roadmap
- [ ] **Sigma Rule Loader**: Implement simplified YAML-based Sigma rule parsing
- [ ] **Async Processing**: Implement Celery for long-running forensics tasks
- [ ] **Advanced Filtering**: Complex filter builder for log and alert search
- [ ] **API Pagination**: Add cursor-based pagination for large result sets
- [ ] **Visualization**: Add charts for timeline, severity distribution, technique distribution
- [ ] **Bulk Operations**: Bulk case assignment, status updates, evidence actions
- [ ] **User Preferences**: Save user preferences, report templates, filter presets
- [ ] **Advanced Search**: Full-text search on case notes, evidence descriptions
- [ ] **Threat Intelligence**: Integration with public threat feeds
- [ ] **Email Notifications**: Alert notifications via email
- [ ] **Multi-tenant Support**: Workspace/tenant isolation
- [ ] **Performance Optimization**: Database query optimization, caching
- [ ] **Security Hardening**: Input validation, SQL injection prevention, CSRF protection
- [ ] **Audit Logging**: Complete audit trail of all system actions
- [ ] **API Rate Limiting**: Rate limiting and API key management
- [ ] **React Frontend**: Upgrade from Streamlit to React for advanced UI

---

## Implementation Checklist

### Code Quality
- [ ] Unit tests for all services (>80% coverage)
- [ ] Integration tests for API endpoints
- [ ] Type hints throughout codebase
- [ ] Code documentation with docstrings
- [ ] Linting with pylint/flake8
- [ ] Code formatting with black

### Database
- [ ] All tables created with proper relationships
- [ ] Indexes created for performance
- [ ] Migrations versioned with Alembic
- [ ] Test data seeding for development
- [ ] Backup strategy documented

### API
- [ ] All endpoints documented in Swagger
- [ ] Request/response validation with Pydantic
- [ ] Error handling and proper HTTP status codes
- [ ] Pagination support for list endpoints
- [ ] Rate limiting (optional)

### Frontend
- [ ] All pages responsive and user-friendly
- [ ] Real-time data refresh capabilities
- [ ] File upload progress indicators
- [ ] Loading states and error messages
- [ ] Navigation and routing between pages

### Deployment
- [ ] Docker containerization
- [ ] docker-compose for local development
- [ ] Environment configuration management
- [ ] Logging and monitoring
- [ ] Documentation for deployment

### Documentation
- [ ] README with quick start guide
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Architecture overview document
- [ ] User guide for investigators
- [ ] Developer setup guide
- [ ] Troubleshooting guide

### Security
- [ ] Authentication and authorization implemented
- [ ] Password hashing and salting
- [ ] HTTPS/TLS for production
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using ORM)
- [ ] CSRF protection (if applicable)
- [ ] Secure file upload handling
- [ ] Audit logging of sensitive operations

### Testing
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] Test coverage report
- [ ] Performance testing
- [ ] Security testing (optional)

---

## Technology Integration Checklist

### Required Tools
- [ ] Python FastAPI framework
- [ ] PostgreSQL database
- [ ] SQLAlchemy ORM
- [ ] Streamlit (frontend MVP)
- [ ] Volatility 3 (memory analysis)
- [ ] YARA (malware scanning)

### Recommended Tools
- [ ] Zeek (network forensics)
- [ ] Suricata (network IDS)
- [ ] ReportLab (PDF generation)
- [ ] Redis (caching, task queue)
- [ ] Celery (async tasks)
- [ ] pytest (testing)

### Optional Integrations
- [ ] Plaso/log2timeline (advanced timelines)
- [ ] MITRE ATT&CK API
- [ ] VirusTotal API (file scanning)
- [ ] Shodan API (IP intelligence)
- [ ] Public threat feeds
- [ ] Slack notifications
- [ ] Elasticsearch (log storage at scale)

---

## Performance Targets

- [ ] Alert generation: <5 seconds for batch of 1000 logs
- [ ] PCAP analysis: <30 seconds for 100MB PCAP
- [ ] Memory dump analysis: <2 minutes for 4GB dump
- [ ] PDF report generation: <30 seconds
- [ ] UI page load: <2 seconds
- [ ] API response time: <1 second (p95)
- [ ] Database query time: <500ms (p95)

---

## Success Criteria

1. **Complete Workflow**: Log ingestion → Detection → Alert → Case → Evidence → Timeline → Report
2. **Forensic Completeness**: All major forensic sources covered (logs, PCAP, memory, files, browser)
3. **Professional Output**: PDF reports with MITRE mapping and proper chain of custody
4. **Usability**: Intuitive UI for investigators, easy case management
5. **Integrity**: Complete audit trail and evidence integrity verification
6. **Performance**: Fast analysis and report generation
7. **Extensibility**: Easy to add new detection rules and forensic modules
8. **Documentation**: Comprehensive docs for users and developers

---

## Notes for Presentation

**Key Selling Points:**
1. Mini-SOC capabilities meet enterprise-grade DFIR requirements
2. Automated detection and case creation workflow
3. Professional forensic reporting with MITRE alignment
4. Comprehensive evidence handling and chain of custody
5. Multi-source timeline correlation
6. Extensible architecture for custom rules and analysis modules
7. Suitable for small organizations, colleges, and security labs
8. Open-source and customizable

**Demonstration Scenarios:**
1. Log ingestion → Alert generation demo
2. PCAP analysis with port scan detection
3. Memory dump analysis with suspicious process flagging
4. Case creation with timeline reconstruction
5. PDF report generation with MITRE mapping
6. Evidence integrity verification and chain of custody

