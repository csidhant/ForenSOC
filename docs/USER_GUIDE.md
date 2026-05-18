# ForenSOC — Analyst & Investigator User Guide

**Version**: 1.0.0 | **Audience**: Security Analysts, Digital Forensic Investigators, SOC Managers

---

## Welcome to ForenSOC

ForenSOC is an integrated platform designed to unify the workflows of security operations (monitoring and detection) with digital forensics and incident response (detailed, post-incident forensic deep-dives).

This guide walks you through the day-to-day usage of ForenSOC: from monitoring real-time telemetry to reconstructing attack timelines and publishing forensic reports.

---

## Table of Contents

1. [Dashboard & Threat Telemetry](#1-dashboard--threat-telemetry)
2. [Real-time Alerts & Sigma Triage](#2-real-time-alerts--sigma-triage)
3. [Case Management & Kanban Workflow](#3-case-management--kanban-workflow)
4. [Evidence Vault & Custody Protocols](#4-evidence-vault--custody-protocols)
5. [Digital Forensics Modules](#5-digital-forensics-modules)
   - [5.1 Network Packet Analysis (PCAP)](#51-network-packet-analysis-pcap)
   - [5.2 Memory Forensics (Volatility 3)](#52-memory-forensics-volatility-3)
   - [5.3 Malware Scanning (YARA)](#53-malware-scanning-yara)
6. [Timeline Reconstruction & MITRE ATT&CK](#6-timeline-reconstruction--mitre-attck)
7. [Generating Forensic Reports](#7-generating-forensic-reports)

---

## 1. Dashboard & Threat Telemetry

The Dashboard is your primary mission control panel. It aggregates all system state metrics and real-time security indicators.

```
+-------------------------------------------------------------------------+
| [System Operational]                                 (Dark Mode Toggle) |
+-------------------------------------------------------------------------+
| (Total Alerts: 142)  (Active Cases: 8)  (Evidence Vault: 32) (Intel: OK)|
+-------------------------------------------------------------------------+
|                                                                         |
|  [ Global Threat Map ]                 [ Alerts Over Time ]            |
|  Pins attacks dynamically using        Vibrant Area chart showing       |
|  Geo-IP mapping.                       triage trends.                   |
|                                                                         |
+-------------------------------------------------------------------------+
|  [ Live Alert Stream ]                                                  |
|  Real-time toast notifications and raw logs popping via WebSocket feed.  |
+-------------------------------------------------------------------------+
```

### Key Submodules
*   **System Status Indicator**: Displays real-time API connectivity and backend worker health in the top bar.
*   **Geo-IP Threat Map**: Pins the source location of incoming malicious alerts. Green pins designate benign activity, amber represents medium severity, and pulsing red indicators point to ongoing critical attacks.
*   **Live Alert Feed**: Displays incoming threats as they happen. Powered by WebSockets, it eliminates browser refreshes.

---

## 2. Real-time Alerts & Sigma Triage

All security events flow into the **Alerts Page**. This is where initial log triage occurs.

### Triaging Incoming Alerts
1.  **Filter and Search**: Use the real-time search bar to isolate alerts by Title, Description, or Log Source. You can filter by **Severity** (Critical, High, Medium, Low, Info) or **Status** (Unreviewed, In Progress, Resolved, False Positive).
2.  **Inspect Alert Details**: Click **View Detail** on any alert to open the diagnostic window. It exposes:
    - Target hostnames and IP addresses
    - Raw normalized JSON event metadata
    - The matching Sigma rule YAML signature that triggered the detection
3.  **Triage Actions**:
    - **One-Click Resolve**: If a threat has been safely mitigated, click **Resolve**.
    - **Convert to Case**: If an alert warrants a comprehensive team investigation, select **Convert to Case**. This creates a formal incident entry in the Cases panel and links the alert dynamically.

---

## 3. Case Management & Kanban Workflow

Once an alert is escalated, it enters the **Cases Page**. ForenSOC utilizes a highly visual Kanban card grid to organize active investigations.

```
  ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
  │         OPEN            │     │       IN PROGRESS       │     │        RESOLVED         │
  ├─────────────────────────┤     ├─────────────────────────┤     ├─────────────────────────┤
  │ [CASE-204] SSH Brute    │ ──> │ [CASE-202] Memory Dump  │ ──> │ [CASE-201] Phishing Tri │
  │ Priority: Critical      │     │ Priority: High          │     │ Priority: Medium        │
  │ Assigned: Investigator  │     │ Assigned: Analyst Bob   │     │ Assigned: Admin         │
  └─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

### Managing Incidents
*   **Visual Status Indicators**: Cards are color-coded by priority (Red border for Critical, Amber for High, Blue for Medium, Grey for Low) with status tags.
*   **Create Case**: Click **Create New Case** to spin up an investigation manually. Provide a Title, Description, Status, and assign a priority level.
*   **Case Details**: Click **Manage** on any case card to open the case command center, which houses four operational hubs:
    1.  **Case Timeline**: Second-by-second aggregated forensic log.
    2.  **Linked Alerts**: Every security event associated with the incident.
    3.  **Evidence Vault**: Crypographically sealed files uploaded by investigators.
    4.  **Case Notes**: Multi-analyst collaborative log for shift handover documentation.

---

## 4. Evidence Vault & Custody Protocols

The **Evidence Vault** is a secure storage system for volatile files, network captures, memory images, and suspicious binaries.

```
       [ Upload Artifact ] ──> Calculates Cryptographic Signature (SHA-256)
                                               │
                                               ▼
                              Creates Signed Database Record
                                               │
                                               ▼
                        Integrity Verified status is set to "Green"
```

### Ingestion Protocol
1.  Navigate to the case, and open the **Evidence Vault** panel.
2.  Click **Upload Evidence**.
3.  Select file type (**PCAP Capture**, **Memory Dump**, **Disk Image**, **User File**, **Browser History SQLite**).
4.  Specify an accurate **Description** and **Collected By** name.
5.  Click **Submit**. The file is encrypted, hashed on ingestion, and locked in the vault.

### Integrity & Custody
*   **Verify Integrity**: Click **Verify Hash** to run an automated check. The platform hashes the file on disk and verifies it against the signed hash saved on upload.
*   **Chain of Custody**: Every download, modification, or forensically executed script updates the immutable Chain of Custody list with date, actor, and verification hashes.

---

## 5. Digital Forensics Modules

Once artifacts are placed in the vault, you can execute deep forensic workflows.

### 5.1 Network Packet Analysis (PCAP)

ForenSOC parses network packet captures to discover exfiltration and beaconing.

```
  PCAP Upload ──> Ingested ──> Zeek Extraction ──> Logs Created (conn.log, dns.log, ssl.log)
                                       │
                                       ▼
                             Suricata Rule Evaluation
                                       │
                                       ▼
                       Anomaly Indicators Pinned to Case
```

*   **Extraction**: The system runs Zeek on the capture to extract structured tables (Connections, DNS requests, HTTP sessions, SSL certificates).
*   **IDS Scans**: Suricata parses the PCAP against rules to locate malicious packet footprints.
*   **Triage**: Check the **Network Analysis** dashboard to discover:
    - Top conversation source/destination IPs
    - High-frequency DNS queries (flags DNS tunneling)
    - Suspicious browser User-Agents

---

### 5.2 Memory Forensics (Volatility 3)

Investigate high-severity incidents like rootkits or active malware processes using built-in Volatility 3 connectors.

```
  Memory Dump ──> Selected ──> Select Plugin ──> Execution (Processes, Connections, Registry)
                                                        │
                                                        ▼
                                         Flags Suspicious Indicators
                                         (Hidden PIDs, Malicious DLLs)
```

#### Supported Volatility Plugins
-   `windows.pslist`: Lists all running processes (flags parent-child process anomalies).
-   `windows.pstree`: Displays running processes in a hierarchical tree layout.
-   `windows.netscan`: Extracts active network connections, sockets, and listening ports.
-   `windows.malfind`: Identifies injected code blocks and suspicious memory segments.

#### Executing Memory Analysis
1. Select the Memory Dump artifact inside the Evidence Vault.
2. Select your target Volatility plugin from the dropdown.
3. Click **Execute Plugin**. The job runs in the background.
4. Review the completed job to inspect flagged hidden PIDs, socket maps, or suspicious DLLs.

---

### 5.3 Malware Scanning (YARA)

Scan file uploads, script drops, or running binaries for malicious code using advanced YARA rules.

#### Uploading Custom Signatures
1. Navigate to **System Settings → YARA Configurations**.
2. Click **Add YARA Rule**.
3. Paste a standard YARA signature:
   ```yara
   rule Suspicious_ReverseShell {
       strings:
           $shell_cmd = "cmd.exe /c powershell -nop -w hidden -c"
           $socket_conn = "System.Net.Sockets.TCPClient"
       condition:
           any of them
   }
   ```
4. Click **Save**.

#### Running a Malware Scan
1. Select the target file inside the Case Evidence Vault.
2. Select **Run YARA Scan**.
3. Select your rule set (Default, Custom, or All).
4. Click **Scan**. Any matching text strings, hex blocks, or signature rules will be highlighted.

---

## 6. Timeline Reconstruction & MITRE ATT&CK

Manual correlation during high-pressure incidents is error-prone. ForenSOC automates event correlation.

```
  [ Raw Logs ] ───┐
  [ Alerts ] ─────┼──> [ Ingestion Engine ] ──> Chronological Timeline (200 OK)
  [ Evidence ] ───┘
```

### Chronicle Visualization
*   ForenSOC aggregates raw logs, generated alerts, evidence uploads, and investigator notes into a unified second-by-second timeline.
*   Filter by event source or severity to reconstruct the precise path of the threat (e.g., initial entry via phish → credential theft → lateral movement → exfiltration).

### MITRE ATT&CK Matrix Mapping
*   Every alert generated by the Sigma engine automatically maps to the **MITRE ATT&CK** matrix.
*   Open the **MITRE Visualizer** page inside your active Case to see a heat-mapped grid of tactics (Initial Access, Execution, Persistence, Command & Control). This grid highlights the attacker's operational patterns and maps out potential gaps in your network's defense system.

---

## 7. Generating Forensic Reports

When an investigation closes, you can generate an executive-ready report in one click.

```
  Case Closed ──> Click Generate ──> ReportLab PDF Assembly ──> Download Signed PDF
```

### Generating a PDF Report
1.  Navigate to your active Case.
2.  Click **Generate PDF Report**.
3.  Customize your report selections:
    - [x] Executive Summary (includes case metadata and recommendations)
    - [x] Incident Timeline
    - [x] Evidence Vault List & Chain of Custody hashes
    - [x] MITRE ATT&CK mapping overview
4.  Click **Compile Report**.
5.  A professionally styled, cryptographically signed PDF report will generate instantly. Download the PDF directly for delivery to executive leadership, legal counsel, or external law enforcement.

---

*ForenSOC User Guide — Empowering analysts to protect, detect, and resolve threats.*
