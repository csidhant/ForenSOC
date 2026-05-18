# ForenSOC — Security & Compliance Guide

**Version**: 1.0.0 | **Classification**: Internal / Restricted | **Audience**: Security Operations, Compliance Auditors

---

## Table of Contents

1. [Security Architecture Overview](#1-security-architecture-overview)
2. [Authentication & Session Management](#2-authentication--session-management)
3. [Role-Based Access Control (RBAC)](#3-role-based-access-control-rbac)
4. [Evidence Integrity & Chain of Custody](#4-evidence-integrity--chain-of-custody)
5. [Log Ingestion & Sigma Signature Security](#5-log-ingestion--sigma-signature-security)
6. [Data Protection & Encryption](#6-data-protection--encryption)
7. [System Hardening & Threat Modeling](#7-system-hardening--threat-modeling)
8. [Immutable Audit Logging](#8-immutable-audit-logging)
9. [Regulatory Compliance (GDPR, SOC2, ISO 27001)](#9-regulatory-compliance-gdpr-soc2-iso-27001)

---

## 1. Security Architecture Overview

ForenSOC is designed with a defense-in-depth model to protect critical digital forensics data, security logs, and case investigations. The platform isolates components into distinct operational boundaries:

```
                  ┌──────────────────────┐
                  │   Analyst Browser    │
                  └──────────┬───────────┘
                             │ HTTPS + WSS
                             ▼
  ======================= DMZ Boundary =======================
                  ┌──────────────────────┐
                  │   Reverse Proxy      │  (Nginx / Cloudflare TLS)
                  └──────────┬───────────┘
                             │ HTTP (Internal Net)
                             ▼
  ==================== Service Boundary ======================
           ┌────────────────────────────────────┐
           │      FastAPI Application Core      │ (CORS / SlowAPI Rate Limiting)
           └──────┬──────────────────────┬──────┘
                  │                      │
                  ▼                      ▼
  ┌────────────────────────┐    ┌────────────────────────┐
  │   PostgreSQL Database   │    │  Evidence Storage      │ (SHA-256 Verified)
  │   (Parameterized SQL)  │    │  (Restricted Disk/S3)  │
  └────────────────────────┘    └────────────────────────┘
```

### Core Design Principles
*   **Principle of Least Privilege**: Users and service components are assigned the minimum necessary permissions required to fulfill their functions.
*   **Complete Mediation**: Every access request is validated against the active token's scopes and role assignments before execution.
*   **Secure Defaults**: The application boots with high-strength default settings, including short-duration JWTs and default strict CORS headers.

---

## 2. Authentication & Session Management

ForenSOC implements **stateless JSON Web Tokens (JWT)** for user session verification.

```
  ┌──────────┐                 ┌─────────────┐                 ┌──────────┐
  │ Investigator │                 │ FastAPI API │                 │ Database │
  └────┬─────┘                 └──────┬──────┘                 └────┬─────┘
       │                               │                               │
       │  1. Login(User, Pass)         │                               │
       ├──────────────────────────────>│                               │
       │                               │  2. Fetch Hashed Password     │
       │                               ├──────────────────────────────>│
       │                               │  3. Verify & Generate JWT     │
       │                               │<──────────────────────────────┤
       │  4. Return Access Token       │                               │
       │<──────────────────────────────┤                               │
       │                               │                               │
       │  5. API Call (Bearer Token)   │                               │
       ├──────────────────────────────>│                               │
       │                               │  6. Authorize JWT Claims      │
       │                               │   (Self-Contained)            │
       │  7. Return Incident Data      │                               │
       │<──────────────────────────────┤                               │
```

### JWT Protocol Specifications
- **Signature Algorithm**: `HS256` (HMAC SHA-256)
- **Token Expiry**: Default 1440 minutes (24 hours), customizable via `ACCESS_TOKEN_EXPIRE_MINUTES`.
- **Payload Contents**:
  ```json
  {
    "sub": "username",
    "role": "analyst",
    "exp": 1787163000
  }
  ```

### Password Protection
- **Hashing Function**: `bcrypt` (Salt rounds automatically tuned by Work Factor).
- **Storage**: Safe parameterization inside the database schema (no cleartext passwords ever logged).

---

## 3. Role-Based Access Control (RBAC)

The platform supports four hardcoded user roles with progressive authorization scopes:

| Role | Auth Scopes | Authorized Pages | Case Actions | Evidence Actions | System Settings |
|------|-------------|------------------|--------------|------------------|-----------------|
| **Admin** | Read, Write, Delete, System | All Pages | Create, Edit, Close, Delete | Upload, Download, Verify | Full access |
| **Investigator** | Read, Write, Forensic | Dashboard, Cases, Alerts, Vault | Create, Edit, Close | Upload, Download, Verify | View only |
| **Analyst** | Read, Triage | Dashboard, Cases, Alerts | Create, Triage | View metadata only | View only |
| **Viewer** | Read-Only | Dashboard, Case Viewer | Read only | View metadata only | Denied |

---

## 4. Evidence Integrity & Chain of Custody

Maintaining a pristine chain of custody and guaranteeing evidence has not been tampered with are core requirements of the DFIR vault.

```
       [ Upload ] ──────> [ Ingestion Engine ]
                                 │
                                 ▼
                     Calculate Cryptographic Hashes
                     (SHA-256 and MD5 Generated)
                                 │
                                 ▼
         Store File              │              Insert Database Record
     (Hashed Path) ◄─────────────┴─────────────► (Hashes + Actor Metadata)
                                                (Strict Chain of Custody log)
```

### Cryptographic Safeguards
*   **Dual-Hash Ingestion**: Every file uploaded into the Evidence Vault triggers a simultaneous calculation of both **SHA-256** and **MD5** hashes.
*   **Integrity Verifications**: At any point, an analyst can trigger a manual or automated integrity verification:
    1. Re-calculates the active file hash on disk.
    2. Compares the hash directly with the signed database value.
    3. Records the verified timestamp and investigator metadata.

### Immutable Chain of Custody (CoC)
Every operational step involving an evidence artifact—upload, download, deletion, custom volatility scanning, or threat intelligence query—triggers a transaction entry:
```json
{
  "evidence_id": 42,
  "action": "download",
  "actor_name": "investigator_john",
  "action_time": "2026-05-18T07:22:00Z",
  "details": "Evidence downloaded for Volatility analysis",
  "integrity_status": "verified_match"
}
```

---

## 5. Log Ingestion & Sigma Signature Security

ForenSOC ingests massive streams of system event logs. We implement strict filters to prevent injection attacks and protect the internal pipeline:

### 1. Parsing Sandbox
- Logs are strictly normalized using safe custom mapping patterns.
- No log parsing triggers dynamically executed commands (prevention of Log4j-like remote code executions).
- Incoming UTF-8 streams are scrubbed to strip non-printable or corrupt control characters.

### 2. Sigma Rule Upload Safety
- Sigma signatures are loaded as standard JSON or YAML.
- YAML parsing is done via `yaml.safe_load` inside the backend Python service to prevent arbitrary python object injection.
- Rules are pre-compiled and executed strictly inside a structured python matcher.

---

## 6. Data Protection & Encryption

| Boundary | Standard | Implementation |
|----------|----------|----------------|
| **Data in Transit** | TLS 1.3 / TLS 1.2 | Nginx / Render reverse-proxy TLS termination. WebSockets use secure `wss://` standard. |
| **Data at Rest** | AES-256 | Deployed PostgreSQL database supports full disk encryption. |
| **Evidence Vault** | Filesystem Perms | Ephemeral uploads are placed in folders with strict read-only execution permissions. |
| **API Sessions** | Secure JWT | Tokens are passed solely via the HTTP Authorization header (prevents CSRF). |

---

## 7. System Hardening & Threat Modeling

ForenSOC maintains high security standards against the OWASP Top 10 vulnerabilities:

### 💉 Injection Attacks (SQLi, Command Injection)
*   **SQL Injection**: Prevented by utilizing the **SQLAlchemy ORM**. Every database query is parameterized. Raw queries are completely banned.
*   **Command Injection**: System integrations like Volatility and Zeek use strict subprocess execution with arrays (`subprocess.run(["plugin", "param"])`), completely bypassing shell parsing (`shell=False`).

### 🛡️ Rate Limiting & Denial of Service (DoS)
*   The application implements standard endpoint throttling using the **SlowAPI** package.
*   Default limit: `200 requests/minute` per IP address.
*   Critical auth paths (login, register) are tightly limited to `5 attempts/minute` to mitigate brute force attacks.

### 🌐 Cross-Origin Resource Sharing (CORS)
*   Wildcard headers (`*`) are disallowed.
*   The API checks origins against the dynamic `ALLOWED_ORIGINS_STR` env var.
*   Requests from untrusted domains are automatically rejected at the gateway middleware layer.

---

## 8. Immutable Audit Logging

Every state-mutating request made to the REST API is logged using a structured audit system. These logs are stored in a dedicated `audit_logs` database table.

### Actions Tracked
- User creation and role changes
- Case status shifts (e.g., OPEN → CLOSED)
- Evidence addition or verified hash discrepancies
- Rate-limiting threshold violations
- Failed login attempts and session invalidations

### Structure of an Audit Log
```json
{
  "id": 1054,
  "timestamp": "2026-05-18T07:23:45Z",
  "actor_username": "admin",
  "action": "ROLE_CHANGE",
  "target_type": "USER",
  "target_id": "8",
  "details": "User 'analyst_bob' upgraded from analyst to investigator",
  "ip_address": "192.168.1.50"
}
```

---

## 9. Regulatory Compliance

ForenSOC meets rigorous operational baselines aligned with global security frameworks:

### GDPR (General Data Protection Regulation)
- **Data Deletion**: Built-in support for investigator user account deletion and case purging.
- **Access Tracking**: Audit log records every interaction with case data.

### SOC 2 (Trust Services Criteria)
- **Security**: Stateless JWT, strict passwords, RBAC verification.
- **Confidentiality**: Cases can be isolated and marked private for restricted investigator viewing.
- **Integrity**: Forensic vault logs every modification with immutable SHA-256 verification.

### ISO 27001
- **Domain A.12**: Operational security via SlowAPI rate-limiting and robust logging.
- **Domain A.14**: Systems acquisition, development, and maintenance — strict TypeScript configurations and automated quality checks on all branches.

---

*Report prepared by the ForenSOC Security Engineering & Governance Team.*
