# ForenSOC User Guide

> **For security analysts, investigators, and administrators using the ForenSOC platform.**

---

## Table of Contents

- [Logging In](#logging-in)
- [Dashboard Overview](#dashboard-overview)
- [Working with Alerts](#working-with-alerts)
- [Managing Cases](#managing-cases)
- [Evidence Vault](#evidence-vault)
- [Log Explorer](#log-explorer)
- [Detection Rules](#detection-rules)
- [Digital Forensics](#digital-forensics)
- [MITRE ATT&CK](#mitre-attck)
- [Reports & Audit](#reports--audit)
- [Public Threat Search](#public-threat-search)
- [Settings](#settings)
- [Role Permissions](#role-permissions)

---

## Logging In

Navigate to the ForenSOC URL (local: `http://localhost:3000`, or your deployed URL).

### Available Login Options

1.  **Quick-Start Demo Account (Pre-seeded):**
    For immediate local development or classroom evaluation, use the built-in system administrator credentials:
    *   **Username:** `admin`
    *   **Password:** `admin` (or the production override set in your `.env` settings)
    *   *Note: These credentials are also displayed directly on the login panel chip for rapid dev access.*

2.  **User Self-Registration:**
    If you do not have an account, click **Register now** on the login page or navigate to `/register` to create a personalized profile (Username, Email, and Password) that is saved immediately in the secure database.

3.  **Role-Based Access Control (RBAC):**
    Your login maps to a specific workspace and role that restricts the available actions and views:
    *   **Admin (`admin`)**: Complete privileges over rule creation, users, and audit trails.
    *   **Analyst (`analyst`)**: Alerts monitoring, threat mapping, log queries.
    *   **Investigator (`investigator`)**: Memory/Zeek forensics, evidence custody, case timelines, PDF reporting.
    *   **Viewer (`viewer`)**: Read-only observation and metrics monitoring.

> ⚠️ **Security Warning:** Change default passwords immediately after your first login via **Settings → Account**.

---

---

## Dashboard Overview

The Dashboard is your mission control. It shows:

| Widget | What it tells you |
|--------|-------------------|
| **Total Alerts** | Count of open security alerts |
| **Open Cases** | Active incident investigations |
| **Critical Alerts** | High-severity detections needing immediate attention |
| **Evidence Items** | Files stored in the forensic vault |
| **Alert Trend Chart** | 7-day bar chart of alert volume |
| **Severity Distribution** | Pie chart of alert severity breakdown |
| **Live Alert Feed** | Real-time WebSocket-pushed latest alerts |
| **Global Threat Map** | Geographic origin of network-based threats |

The dashboard auto-refreshes via WebSocket — no manual reload needed.

---

## Working with Alerts

**Navigate to: Alerts** (sidebar)

### Viewing Alerts

Alerts are color-coded by severity:
- 🔴 **Critical** — Immediate action required
- 🟠 **High** — Investigate within the hour
- 🟡 **Medium** — Investigate within the day
- 🔵 **Low** — Informational, review when time allows

### Alert Actions

| Action | How |
|--------|-----|
| View details | Click on any alert row |
| Resolve alert | Click **Resolve** button (turns alert to closed state) |
| Mark false positive | Click **False Positive** — removes from active queue |
| Link to case | Click **Link to Case** — associates alert with an investigation |
| Assign to analyst | Click **Assign** — pick from user list |

### Filters

Use the top filter bar to filter by:
- **Severity** (Critical / High / Medium / Low)
- **Status** (Open / Closed / False Positive)
- **Free text search** (alert name, source IP)

### Real-time Notifications

When a new critical alert fires, you will see:
1. A **red toast notification** in the top-right corner
2. A **Slack message** if `SLACK_WEBHOOK_URL` is configured

---

## Managing Cases

**Navigate to: Cases** (sidebar)

Cases are incident investigations that group related alerts, evidence, and timelines.

### Creating a Case

1. Click **+ New Case**
2. Fill in: Title, Description, Priority (Low / Medium / High / Critical), Status
3. Click **Create** — the case appears in the card grid

### Case Priority Colors

| Priority | Card Color |
|----------|------------|
| Critical | Red border |
| High | Orange border |
| Medium | Yellow border |
| Low | Blue border |

### Inside a Case

Click any case card to open the **Case Detail** view:

| Tab | Contents |
|-----|----------|
| **Overview** | Title, description, assignees, status |
| **Alerts** | Linked alerts for this incident |
| **Evidence** | Files uploaded to this case |
| **Timeline** | Chronological event reconstruction |
| **MITRE** | ATT&CK tactic/technique mapping |
| **Reports** | Generated PDF forensic reports |

---

## Evidence Vault

**Navigate to: Evidence Vault** (sidebar)

Securely store and analyze forensic evidence with full chain-of-custody tracking.

### Uploading Evidence

1. Click **Upload Evidence**
2. Select a file (supports: `.pcap`, `.mem`, `.bin`, `.log`, `.zip`, `.exe`, and more)
3. Set the Evidence Type: Memory Dump / PCAP / Binary / Log File / Other
4. Link to a Case (optional)
5. Click **Upload** — the system auto-calculates SHA-256 and MD5 hashes

### Verifying Integrity

Click **Verify** on any evidence item to re-hash the file and confirm it matches the stored hash. This is the chain-of-custody check.

### Analysis Actions

| Action | Tool Used |
|--------|-----------|
| YARA Scan | Scans binary against built-in malware rules |
| Memory Analysis | Runs Volatility 3 on memory dumps |
| PCAP Analysis | Runs Zeek on network captures |
| File Analysis | Extracts metadata and file type info |

---

## Log Explorer

**Navigate to: Log Explorer** (sidebar)

Browse raw and normalized security events ingested into ForenSOC.

### Tabs

- **Raw Logs** — Original log lines as ingested
- **Normalized Events** — Parsed, structured events ready for detection

### Ingesting Logs Manually

1. Click **Ingest Log**
2. Paste or type a raw log line
3. Select the log source type
4. Click **Submit** — the system parses and normalizes the event, then runs detection rules against it

### Auto-Ingest (Zero-Click)

Drop any `.log` file into the `backend/ingest_drop/` folder. The automation watcher picks it up within seconds and processes it automatically.

---

## Detection Rules

**Navigate to: Detection Rules** (sidebar)

Manage the rules that generate alerts from log events.

### Built-in Rules

| Rule | Severity | Description |
|------|----------|-------------|
| SSH Brute Force | High | 5+ failed SSH logins from same IP within 5 minutes |
| Multiple Failed Logins | Medium | 3+ auth failures within 10 minutes |
| Suspicious Web Request | Medium | HTTP requests to admin paths (`/wp-admin`, `/phpmyadmin`) |

### Adding a Custom Rule

**Option 1 — GUI Form:**
1. Click **+ New Rule**
2. Fill in name, severity, event type, threshold, time window
3. Click **Save**

**Option 2 — Sigma YAML:**
1. Click **Upload Sigma Rule**
2. Paste your Sigma YAML
3. Click **Parse & Create** — the engine converts it to a ForenSOC rule

### Enabling / Disabling Rules

Toggle the switch next to any rule to enable or disable it without deleting it.

### Running a Manual Scan

Click **Run Detection Scan** to apply all active rules against the last 24 hours of normalized events. Matches generate new alerts immediately.

---

## Digital Forensics

**Navigate to: Forensics** (sidebar)

Run advanced analysis against uploaded evidence files.

| Tool | Input | Output |
|------|-------|--------|
| **YARA** | Binary / EXE file | Malware rule matches with confidence scores |
| **Volatility 3** | Windows memory dump | Running processes, network connections, injected code |
| **Zeek** | PCAP network capture | HTTP sessions, DNS queries, file transfers, connection logs |
| **Suricata EVE** | Suricata JSON output | IDS alerts parsed into ForenSOC events |

> **Note:** Volatility and Zeek require the tools to be installed on the server. Cloud deployments (Render free tier) will return a graceful "tool not available" message. YARA works on all deployments.

---

## MITRE ATT&CK

**Navigate to: MITRE** (sidebar)

Visualize how detected threats map to the MITRE ATT&CK framework.

- **Global Heatmap** — Color-coded matrix showing which tactics and techniques have been observed across all cases
- **Case Summary** — For a specific case, which ATT&CK techniques were triggered and by which alerts

Click **Sync Mappings** on a case to automatically populate ATT&CK technique tags from linked alerts.

---

## Reports & Audit

### Reports

**Navigate to: Reports** (sidebar)

Generate a professional PDF forensic report for any case:

1. Open a Case → **Reports** tab
2. Click **Generate PDF Report**
3. The report includes: executive summary, timeline, linked alerts, evidence manifest, MITRE mappings
4. Click **Download** to save

### Audit Logs

**Navigate to: Audit Logs** (sidebar)

Immutable log of every write operation in the system:
- Who performed the action
- What was changed
- Timestamp

This log cannot be edited or deleted — it is the system's chain-of-custody at the platform level.

---

## Public Threat Search

**Navigate to: `/public` (no login required)**

Anyone can search the ForenSOC threat database without an account:

1. **Search** — Enter an IP address, domain name, or SHA-256/MD5 hash
2. **File Scan** — Upload a file for YARA analysis

This is similar to VirusTotal — useful for quick lookups by anyone in your organization who doesn't have a ForenSOC account.

---

## Settings

**Navigate to: Settings** (sidebar → bottom)

| Section | Options |
|---------|---------|
| **Appearance** | Toggle Dark / Light mode |
| **Notifications** | Enable/disable toast alerts, sound, Slack |
| **Account** | Change display name, email, password |
| **System Info** | App version, connected services status |

---

## Role Permissions

| Permission | Admin | Analyst | Investigator | Viewer |
|------------|-------|---------|--------------|--------|
| View dashboard | ✅ | ✅ | ✅ | ✅ |
| View alerts & cases | ✅ | ✅ | ✅ | ✅ |
| Create / edit cases | ✅ | ✅ | ✅ | ❌ |
| Upload evidence | ✅ | ✅ | ✅ | ❌ |
| Run forensics | ✅ | ✅ | ✅ | ❌ |
| Create detection rules | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ | ❌ |
| Generate reports | ✅ | ✅ | ✅ | ❌ |

---

*For deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).  
For API reference, see [ARCHITECTURE_AND_API.md](ARCHITECTURE_AND_API.md).*
