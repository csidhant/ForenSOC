# ForenSOC - Database Schema Design

## Overview
PostgreSQL database schema for the ForenSOC platform. All tables include audit fields (created_at, updated_at).

---

## 1. User & Access Management

### Table: users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Table: roles
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example roles: analyst, investigator, admin, manager
```

---

## 2. Host & Asset Management

### Table: hosts
```sql
CREATE TABLE hosts (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(255) NOT NULL,
    os_type VARCHAR(100),
    ip_address INET,
    mac_address MACADDR,
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    description TEXT,
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hostname (hostname),
    INDEX idx_case_id (case_id)
);
```

---

## 3. Event & Log Management

### Table: raw_events
```sql
CREATE TABLE raw_events (
    id BIGSERIAL PRIMARY KEY,
    log_source VARCHAR(100) NOT NULL, -- 'auth.log', 'apache.log', 'windows_event', 'suricata', 'zeek'
    raw_data TEXT NOT NULL,
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_source (log_source),
    INDEX idx_case_id (case_id),
    INDEX idx_ingested_at (ingested_at)
);
```

### Table: normalized_events
```sql
CREATE TABLE normalized_events (
    id BIGSERIAL PRIMARY KEY,
    event_timestamp TIMESTAMP NOT NULL,
    log_source VARCHAR(100) NOT NULL,
    source_ip INET,
    dest_ip INET,
    source_port INTEGER,
    dest_port INTEGER,
    username VARCHAR(255),
    hostname VARCHAR(255),
    event_type VARCHAR(100), -- 'login', 'file_access', 'network_connection', etc.
    severity VARCHAR(20), -- 'Low', 'Medium', 'High', 'Critical'
    description TEXT,
    raw_event_id BIGINT REFERENCES raw_events(id) ON DELETE CASCADE,
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    raw_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (event_timestamp),
    INDEX idx_source_ip (source_ip),
    INDEX idx_dest_ip (dest_ip),
    INDEX idx_case_id (case_id),
    INDEX idx_event_type (event_type)
);
```

---

## 4. Alert Management

### Table: alerts
```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    alert_number VARCHAR(50) UNIQUE NOT NULL, -- 'ALT-001', 'ALT-002', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    status VARCHAR(50) DEFAULT 'New', -- 'New', 'In Progress', 'Investigating', 'Closed', 'False Positive'
    alert_type VARCHAR(100), -- 'SSH Brute Force', 'Port Scan', 'Ransomware', etc.
    
    -- Network Context
    source_ip INET,
    dest_ip INET,
    source_port INTEGER,
    dest_port INTEGER,
    hostname VARCHAR(255),
    username VARCHAR(255),
    
    -- Timeline
    event_time TIMESTAMP,
    detected_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- MITRE ATT&CK
    mitre_tactic VARCHAR(100),
    mitre_technique VARCHAR(100),
    mitre_id VARCHAR(20), -- 'T1110', 'T1046', etc.
    
    -- Relationships
    raw_event_id BIGINT REFERENCES raw_events(id) ON DELETE SET NULL,
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Evidence
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_source_ip (source_ip),
    INDEX idx_case_id (case_id),
    INDEX idx_assigned_to (assigned_to)
);
```

### Table: alert_notes
```sql
CREATE TABLE alert_notes (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    analyst_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alert_id (alert_id)
);
```

---

## 5. Case Management

### Table: cases
```sql
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL, -- 'CASE-001', 'CASE-002', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    status VARCHAR(50) DEFAULT 'Open', -- 'Open', 'Active', 'On Hold', 'Closed', 'Archived'
    case_type VARCHAR(100), -- 'Malware', 'Data Exfiltration', 'APT', 'Insider Threat', etc.
    
    -- Personnel
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timeline
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    incident_start TIMESTAMP,
    incident_end TIMESTAMP,
    
    -- Classification
    is_confidential BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_assigned_to (assigned_to)
);
```

### Table: case_notes
```sql
CREATE TABLE case_notes (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    analyst_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    note_text TEXT NOT NULL,
    note_type VARCHAR(50), -- 'investigation', 'finding', 'recommendation', 'action_item'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_case_id (case_id),
    INDEX idx_analyst_id (analyst_id)
);
```

---

## 6. Evidence Management

### Table: evidence
```sql
CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    evidence_id VARCHAR(50) UNIQUE NOT NULL, -- 'EV-001', 'EV-002', etc.
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    evidence_type VARCHAR(100) NOT NULL, -- 'PCAP', 'Memory Dump', 'Log File', 'Disk Image', 'Browser History', 'Suspicious File', etc.
    
    -- File Information
    filename VARCHAR(255) NOT NULL,
    original_path TEXT,
    stored_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Hash Verification
    sha256_hash VARCHAR(64) NOT NULL,
    md5_hash VARCHAR(32),
    integrity_status VARCHAR(50) DEFAULT 'Verified', -- 'Verified', 'Tampered', 'Pending Verification'
    hash_verified_at TIMESTAMP,
    hash_verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Collection Information
    uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    collected_date TIMESTAMP,
    collected_by VARCHAR(255),
    
    -- Metadata
    description TEXT,
    is_sensitive BOOLEAN DEFAULT FALSE,
    source_system VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_case_id (case_id),
    INDEX idx_evidence_type (evidence_type),
    INDEX idx_sha256_hash (sha256_hash)
);
```

### Table: chain_of_custody
```sql
CREATE TABLE chain_of_custody (
    id SERIAL PRIMARY KEY,
    evidence_id INTEGER NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'uploaded', 'viewed', 'analyzed', 'exported', 'hash_verified', 'report_generated'
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255),
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    tool_used VARCHAR(255), -- 'Volatility 3', 'YARA', 'Zeek', etc.
    output_hash VARCHAR(64),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_evidence_id (evidence_id),
    INDEX idx_action_time (action_time)
);
```

---

## 7. Timeline & Event Correlation

### Table: timeline_events
```sql
CREATE TABLE timeline_events (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    event_time TIMESTAMP NOT NULL,
    
    -- Classification
    source VARCHAR(100) NOT NULL, -- 'alert', 'auth.log', 'pcap', 'browser_history', 'file_system', 'memory', 'evidence_action'
    event_type VARCHAR(100), -- 'failed_login', 'port_scan', 'file_deletion', 'process_execution', etc.
    severity VARCHAR(20),
    
    -- Content
    description TEXT NOT NULL,
    details JSONB,
    
    -- Relationships
    related_alert_id INTEGER REFERENCES alerts(id) ON DELETE SET NULL,
    related_evidence_id INTEGER REFERENCES evidence(id) ON DELETE SET NULL,
    related_normalized_event_id BIGINT REFERENCES normalized_events(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_case_id (case_id),
    INDEX idx_event_time (event_time),
    INDEX idx_source (source)
);
```

---

## 8. MITRE ATT&CK Mapping

### Table: mitre_mappings
```sql
CREATE TABLE mitre_mappings (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    
    tactic VARCHAR(100) NOT NULL, -- 'Reconnaissance', 'Resource Development', 'Initial Access', etc.
    technique VARCHAR(100) NOT NULL,
    technique_id VARCHAR(20) NOT NULL, -- 'T1110', 'T1046', etc.
    sub_technique VARCHAR(100),
    sub_technique_id VARCHAR(20),
    
    confidence_level VARCHAR(20), -- 'Low', 'Medium', 'High'
    description TEXT,
    evidence_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_technique_id (technique_id)
);
```

---

## 9. Forensics Analysis Results

### Table: yara_results
```sql
CREATE TABLE yara_results (
    id SERIAL PRIMARY KEY,
    evidence_id INTEGER NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    rule_name VARCHAR(255) NOT NULL,
    rule_severity VARCHAR(20), -- 'Low', 'Medium', 'High', 'Critical'
    rule_category VARCHAR(100),
    
    matched BOOLEAN NOT NULL,
    matched_strings TEXT,
    match_count INTEGER DEFAULT 0,
    
    raw_output TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_evidence_id (evidence_id),
    INDEX idx_rule_name (rule_name)
);
```

### Table: volatility_results
```sql
CREATE TABLE volatility_results (
    id SERIAL PRIMARY KEY,
    evidence_id INTEGER NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    memory_dump_name VARCHAR(255),
    
    plugin_name VARCHAR(100) NOT NULL, -- 'windows.info', 'windows.pslist', 'windows.netstat', etc.
    plugin_output TEXT NOT NULL,
    
    suspicious_indicators TEXT, -- JSON array of flagged items
    analysis_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analyzed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_evidence_id (evidence_id),
    INDEX idx_plugin_name (plugin_name)
);
```

### Table: pcap_analysis
```sql
CREATE TABLE pcap_analysis (
    id SERIAL PRIMARY KEY,
    evidence_id INTEGER NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    
    -- Zeek Analysis
    zeek_executed BOOLEAN DEFAULT FALSE,
    zeek_conn_log TEXT,
    zeek_dns_log TEXT,
    zeek_http_log TEXT,
    zeek_ssl_log TEXT,
    zeek_files_log TEXT,
    zeek_ssh_log TEXT,
    
    -- Suricata Analysis
    suricata_executed BOOLEAN DEFAULT FALSE,
    suricata_alerts TEXT,
    suricata_flows TEXT,
    suricata_dns TEXT,
    suricata_http TEXT,
    suricata_tls TEXT,
    
    -- Findings
    port_scans_detected INTEGER DEFAULT 0,
    suspicious_dns_detected INTEGER DEFAULT 0,
    data_exfiltration_detected INTEGER DEFAULT 0,
    suspicious_downloads_detected INTEGER DEFAULT 0,
    
    analysis_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analyzed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_evidence_id (evidence_id)
);
```

### Table: browser_artifacts
```sql
CREATE TABLE browser_artifacts (
    id SERIAL PRIMARY KEY,
    evidence_id INTEGER NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    
    artifact_type VARCHAR(50) NOT NULL, -- 'URL', 'Download', 'Cookie', 'Cached'
    
    -- URL Artifacts
    url TEXT,
    title VARCHAR(512),
    visit_count INTEGER,
    last_visit_time TIMESTAMP,
    
    -- Download Artifacts
    download_filename VARCHAR(255),
    download_source_url TEXT,
    download_target_path TEXT,
    download_start_time TIMESTAMP,
    download_end_time TIMESTAMP,
    
    -- Classification
    is_suspicious BOOLEAN DEFAULT FALSE,
    suspicious_reason VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_evidence_id (evidence_id),
    INDEX idx_is_suspicious (is_suspicious)
);
```

---

## 10. Reporting

### Table: reports
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    report_number VARCHAR(50) UNIQUE NOT NULL, -- 'RPT-001', 'RPT-002', etc.
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    
    report_type VARCHAR(50) DEFAULT 'Incident Report', -- 'Incident Report', 'Forensic Analysis', 'Timeline Report', etc.
    title VARCHAR(255) NOT NULL,
    
    -- File Information
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_hash VARCHAR(64),
    
    -- Generation Info
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    report_date TIMESTAMP,
    
    -- Status
    status VARCHAR(50) DEFAULT 'Generated', -- 'Generating', 'Generated', 'Reviewed', 'Finalized', 'Archived'
    is_confidential BOOLEAN DEFAULT FALSE,
    
    -- Content Metadata
    included_sections JSONB, -- Array of included sections
    total_pages INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_case_id (case_id),
    INDEX idx_generated_at (generated_at)
);
```

---

## 11. Audit & Logging

### Table: audit_log
```sql
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100), -- 'case', 'alert', 'evidence', 'report', etc.
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_entity_type (entity_type)
);
```

---

## 12. Configuration & System

### Table: system_config
```sql
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50), -- 'string', 'integer', 'boolean', 'json'
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 13. Indexes & Query Optimization

```sql
-- Performance Indexes
CREATE INDEX idx_alerts_severity_status ON alerts(severity, status);
CREATE INDEX idx_normalized_events_timestamp_case ON normalized_events(event_timestamp, case_id);
CREATE INDEX idx_timeline_events_case_time ON timeline_events(case_id, event_time DESC);
CREATE INDEX idx_evidence_case_type ON evidence(case_id, evidence_type);
CREATE INDEX idx_chain_of_custody_evidence_time ON chain_of_custody(evidence_id, action_time DESC);
```

---

## 14. Example Queries

### Recent Alerts for Dashboard
```sql
SELECT id, alert_number, title, severity, status, event_time
FROM alerts
WHERE status != 'Closed' AND created_at > NOW() - INTERVAL '7 days'
ORDER BY detected_time DESC
LIMIT 20;
```

### Case Timeline
```sql
SELECT event_time, source, event_type, description, severity
FROM timeline_events
WHERE case_id = ?
ORDER BY event_time ASC;
```

### Evidence Integrity Status
```sql
SELECT evidence_id, integrity_status, COUNT(*) as total_actions
FROM chain_of_custody
WHERE evidence_id IN (SELECT id FROM evidence WHERE case_id = ?)
GROUP BY evidence_id, integrity_status;
```

### MITRE ATT&CK Summary for Case
```sql
SELECT tactic, technique, technique_id, COUNT(*) as count
FROM mitre_mappings
WHERE case_id = ?
GROUP BY tactic, technique, technique_id
ORDER BY count DESC;
```

