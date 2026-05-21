# 🛡️ ForenSOC User-Friendly Improvements & Features Guide

## Overview
This document outlines the login options and all the user-friendly improvements made to ForenSOC to reduce the learning curve, improve the interface, and help security analysts make the most of the platform's capabilities.

---

## 🔑 Available Login Types & Roles

ForenSOC supports a robust set of authentication patterns to cater to developers, students, analysts, and administrators:

### 1. Default/Demo Credentials
For quick testing and classroom environments:
- **Username:** `admin`
- **Password:** `admin` (or configured via `.env` settings)
- **Role:** Administrator (full access)
- *A helpful "Demo Access" reference chip is displayed directly on the `/login` panel for instant access.*

### 2. User Self-Registration
Any new analyst can click **Register now** on the login page or navigate directly to `/register` to create a dedicated profile with their custom Username, Email, and Password. Accounts are written immediately to the local database, allowing instant login.

### 3. Role-Based Access Control (RBAC)
When a user logs in, the platform maps their account to one of four core security roles. Each role offers specific permissions and unlocks matching UI operations:
*   👑 **Admin (`admin`)**: Complete platform administration, tenant workspace creation, rule creation (Sigma/YARA), user provisioning, and full access to system audit logs.
*   🛡️ **Security Analyst (`analyst`)**: Real-time triage feed monitoring, threat intelligence searching, and alert linking/resolution workflows.
*   🔬 **Investigation Analyst (`investigator`)**: Access to deep forensics, YARA scanning, Zeek packet parsing, Volatility memory analysis, chain-of-custody tracking, timeline correlation, and professional PDF security reporting.
*   📊 **Viewer (`viewer`)**: Read-only dashboard observation and metrics overview.

---


## 🆕 New Features Added

### 1. **Onboarding Tour** 
**Path:** `/onboarding`

A guided walkthrough for new users that includes:
- Welcome message with role-based guidance
- Key concepts explained in simple terms
- Getting started checklist
- Quick action buttons for common tasks

**Who should use it:**
- New team members
- Users unfamiliar with SOC/forensics terminology
- First-time login users

**How to access:**
- Click "Take Tour" on dashboard
- Navigate to `http://localhost:3000/onboarding`
- Admins can add it to the Settings for first-login experience

---

### 2. **Help Tooltips** 
**Component:** `HelpTooltip`

Contextual help explanations for all technical terms and features.

**How they work:**
- Hover over the **?** icon next to field labels
- Get brief explanations of:
  - Alert severity levels
  - Sigma rules
  - Evidence chain of custody
  - YARA/MITRE concepts
  - File hash formats (MD5, SHA-256)

**Examples:**
```tsx
import { HelpTooltip } from '@components';

<HelpTooltip
  title="Alert Severity"
  description="Critical alerts need immediate investigation. High alerts within the hour."
/>
```

---

### 3. **Empty State Messages**
**Component:** `EmptyState`

Friendly, actionable messages when there's no data to display.

**Examples:**
- "No alerts yet" → "When threats are detected, they'll appear here" + "Create a test alert"
- "No cases" → "Start your first investigation" + "Create Case" button
- "No evidence" → "Upload forensic artifacts" + "Upload File" button

**Benefit:** Users know they're in the right place and understand what to do next.

---

### 4. **Better Error Handling**
**Component:** `ErrorFallback`

User-friendly error messages instead of generic errors:
- ❌ Before: "Error 500"
- ✅ After: "Server error. Please try again later." + "Try Again" button

**Error-specific messages:**
- `404` → "The page you're looking for doesn't exist"
- `403` → "You don't have permission to access this resource"
- `500` → "Server error. Please try again later"
- `Network Error` → "Check your internet connection"

---

### 5. **Skeleton Loaders**
**Component:** `SkeletonLoader`

Animated placeholders while data loads:
- Shows progress to users (vs. blank screen)
- Prevents jumping/layout shift
- More professional appearance

**Types:**
- `card` - Grid of loading cards
- `table` - Row placeholders
- `chart` - Full-height placeholder
- `text` - Paragraph of loading lines

---

### 6. **Theme Support (Light/Dark Mode)**

Already implemented in app - accessible via Settings. Also accessible instantly via the global Command Palette action.

**Benefits:**
- Eye-friendly for 24/7 SOC analysts
- Reduces eye strain during long investigation sessions
- Better for different lighting environments

---

### 7. **Global Command Palette**
**Keyboard Shortcut:** `Ctrl+K`
**Component:** `CommandPalette`

A centralized search overlay that indexes live resources and triggers instant system actions:
- **Search Scope:** Live fuzzy search across Cases, Alerts, Evidence files, and Detection Rules (Sigma/YARA).
- **System Actions:** Instantly swap dark/light theme, open the DFIR Glossary Modal, check system health, and navigate to admin settings.
- **Controls:** Arrow Keys to navigate, `Enter` to run/navigate, `Esc` to close.

---

### 8. **DFIR Cybersecurity Glossary Guide**
**Component:** `GlossaryModal`

A searchable, context-sensitive cybersecurity definitions directory for SOC analysts.
- **Key Terms Documented:** Sigma Rules, YARA Signatures, Zeek Logs, Suricata Rules, Volatility Memory Analysis, and Chain of Custody (CoC).
- **Practical Guides:** Shows sample configuration patterns, syntax layouts, and forensic audit ledger standards.
- **Access:** Accessible by clicking "Glossary Guide" in the sidebar navigation or typing "glossary" in the `Ctrl+K` palette.

---

### 9. **Floating Quick Actions FAB**
**Component:** `FloatingActions`

A spring-animated bottom-right floating button menu that provides single-click access to common workflows:
- **Quick Alerts:** Create a security alert on-the-fly.
- **New Case:** Rapidly initialize an investigation case.
- **Rule Search:** Access detection rules management.
- **On-screen Help:** Prompt contextual onboarding information.

---

---

## 📚 Educational Resources

### Getting Started Guide
New users should follow this sequence:

1. **Login** with default credentials
2. **Take the Onboarding Tour** (`/onboarding`)
3. **Read the Dashboard** - understand what alerts mean
4. **Review 1-2 Recent Alerts** - understand severity/impact
5. **Create First Case** - practice case management
6. **Upload Sample Evidence** - learn evidence vault
7. **Explore Forensics Tools** - familiarize with analysis

### Key Concepts Explained

#### Alerts 🚨
- **What:** Security events detected by rules (Sigma rules)
- **Why:** Early warning of potential threats
- **Action:** Review severity, link to case, resolve when investigated

#### Cases 📂
- **What:** Incident investigations grouping related alerts + evidence
- **Why:** Organize investigations, track progress, create reports
- **Action:** Create → link alerts → add evidence → write timeline → generate report

#### Evidence 🔍
- **What:** Forensic files with integrity verification
- **Why:** Chain of custody for legal compliance
- **Hashes:** MD5 (fast), SHA-256 (secure) - both calculated automatically

#### Forensics 🧬
- **What:** Deep analysis tools (YARA, Volatility, PCAP, Timeline)
- **Why:** Understand attack details, find malware, reconstruct events
- **When:** After case is created, use for detailed investigation

---

## 🎯 Common Workflows

### Workflow 1: Alert Triage (5 mins)
1. Go to **Alerts**
2. Sort by **Severity** (Critical first)
3. Click alert → **Review Details**
4. Decision:
   - ✅ Real threat → **Link to Case** → investigate later
   - ❌ False positive → **Mark as False Positive**

### Workflow 2: Create Investigation Case (10 mins)
1. Go to **Cases** → **Create New**
2. Fill: Title, Description, Severity
3. **Save**
4. Click case → **Link Alerts**
5. Upload evidence files
6. Create timeline (optional)
7. When complete → **Generate PDF Report**

### Workflow 3: Forensic Analysis (30+ mins)
1. Upload suspicious file to **Evidence Vault**
2. System auto-scans with YARA rules
3. View **Forensics** → **File Analysis** results
4. If malware → **Create Case** + link evidence
5. Use **Timeline Builder** to reconstruct attack sequence
6. Add observations to case notes
7. **Export PDF Report** for stakeholders

---

## 🔧 Configuration Tips

### For Administrators

#### Enable Real-time Notifications
1. Go to **Settings** → **Integrations**
2. Add Slack webhook URL
3. Set alert severity threshold
4. Save

#### Configure Detection Rules
1. **Detection Rules** → **Create Rule**
2. Choose template (Sigma, Suricata, Yara)
3. Test with sample data
4. Enable when confident

#### User Management
- **Settings** → **Users**
- Assign roles: Admin, Analyst, Investigator, Viewer
- Each role has specific permissions

---

## 🚀 Pro Tips for Analysts

### Speed Up Your Workflow
1. **Keyboard Shortcuts & Commands**
   - `Ctrl+K` (or clicking the Search icon in the header bar) - Opens the **Global Command Palette** instantly.
   - Use the **Up/Down Arrow keys** to navigate through Cases, Alerts, Evidence, Detection Rules, and System Actions.
   - Press **ENTER** to select or navigate.
   - Press **ESC** to dismiss.

2. **Saved Filters** (coming soon)
   - Save alert filters for repeated use
   - Create custom dashboard views

3. **Batch Operations** (coming soon)
   - Link multiple alerts to case at once
   - Bulk update case status

### Stay Organized
- **Always create a case** for investigation
- **Link all related alerts** to the case
- **Add observations** to case notes
- **Generate reports** before closing case

### Reduce Investigation Time
- Use **Log Explorer** to pivot on IPs/usernames
- Use **MITRE ATT&CK** to understand attack techniques
- Use **Threat Intel** to enrich IOCs (IPs, domains, hashes)
- Use **Timeline** to correlate events chronologically

---

## 📊 Dashboard Explained

| Widget | Meaning | What to Do |
|--------|---------|-----------|
| **Total Alerts** | Count of open security events | Click to filter by severity |
| **Critical Alerts** | High-risk threats needing immediate attention | Investigate these first |
| **Open Cases** | Active investigations | View to track progress |
| **Evidence Items** | Forensic files uploaded | Use for analysis |
| **Alert Trend Chart** | 7-day alert volume | Watch for patterns/spikes |
| **Severity Distribution** | Pie chart of alert severity | Understand threat landscape |
| **Live Feed** | Real-time alerts as they arrive | Monitor during incident |
| **Threat Map** | Geographic origins of threats | Identify attack sources |

---

## ❓ FAQ

**Q: What does the red alert icon mean?**
A: Critical severity - requires immediate investigation

**Q: Why do I see "False Positive" option?**
A: If an alert is not a real threat, mark it to tune detection rules

**Q: Can I export reports to PDF?**
A: Yes - open a case → click "Generate Report" → download PDF

**Q: What's the difference between MD5 and SHA-256?**
A: Both are file hash checksums. SHA-256 is more secure (longer hash). Both auto-calculated.

**Q: How do I search for an IP across all logs?**
A: Use **Log Explorer** → enter IP → view all related events

**Q: Can I assign cases to team members?**
A: Yes - open case → "Assign To" → select user

**Q: What if my alert is resolving on its own?**
A: Click **Resolve** when investigation is complete

---

## 🆘 Getting Help

1. **In-app Help:** Hover over **?** icons for explanations
2. **Onboarding Tour:** Visit `/onboarding` anytime
3. **User Guide:** See docs/USER_GUIDE.md in repo
4. **API Docs:** Visit `http://localhost:8000/docs` (Swagger UI)
5. **Zero-Cost Deployment Guide:** See [docs/DEPLOYMENT_GUIDE.md](file:///c:/Users/Acer/Desktop/ForenSOC/docs/DEPLOYMENT_GUIDE.md) in the repo to host your own copy online for free.
6. **Contact:** Message your SOC admin for troubleshooting

---

## 🔄 Upcoming Improvements

- [ ] Saved filters & views
- [ ] Batch operations
- [ ] Mobile-optimized UI
- [ ] Video tutorials
- [ ] AI-powered alert summarization

---

## 📁 Modified & Created Files Directory

Below is a detailed log of the files created or modified to integrate these user-friendly student guide mechanisms and advanced user interfaces:

### 🆕 Newly Created Files
*   **[StudentGuidePanel.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/StudentGuidePanel.tsx)**: Inline expandable card container showcasing feature summaries, triage workflows, and conceptual guides on major entry pages (Dashboard, Alerts, etc.).
*   **[OnboardingPage.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/pages/OnboardingPage.tsx)**: Fully interactive, stateful 5-step welcome tour giving a breakdown of roles, DFIR terms, getting started tasks, and visual pipeline workflows.
*   **[CommandPalette.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/CommandPalette.tsx)**: Keyboard-driven global search center (`Ctrl+K`) that searches across Live Cases, Alerts, Evidence files, and Detection Rules, and triggers system actions.
*   **[GlossaryModal.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/GlossaryModal.tsx)**: Beautifully structured modal featuring an interactive DFIR dictionary for looking up tools and formats (Sigma, YARA, Zeek, Volatility, MD5/SHA-256).
*   **[FloatingActions.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/FloatingActions.tsx)**: Spring-animated bottom-right Action Menu for rapid deployment of common items (new case, quick alert, rules lookup).
*   **[BreadcrumbsNav.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/BreadcrumbsNav.tsx)**: Dynamic route navigation tracking that visually traces hierarchy paths (e.g., `Dashboard > Alerts > Investigation`) so analysts don't get disoriented.
*   **[EmptyState.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/EmptyState.tsx)**: Illustrative placeholders with clear icons and call-to-actions, preventing user confusion when data loads empty.
*   **[HelpTooltip.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/HelpTooltip.tsx)**: Compact hover icon providing instant definitions and help strings for fields and headers across the entire platform.
*   **[SkeletonLoader.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/SkeletonLoader.tsx)**: Modern multi-profile skeleton layouts representing cards, table rows, and charts during async REST operations.
*   **[ErrorFallback.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/ErrorFallback.tsx)**: Graceful error page wrapping React views, delivering constructive error details (404/403/500/Offline) and easy action recovery.
*   **[helpContent.ts](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/utils/helpContent.ts)**: Static centralized definitions engine compiling complex security concepts for tooltips.
*   **[PublicSearchPage.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/pages/PublicSearchPage.tsx)** / **[public.py](file:///c:/Users/Acer/Desktop/ForenSOC/backend/app/api/public.py)**: Open external endpoints allowing threat database querying and sandbox YARA scanning without authentication.
*   **[USER_FRIENDLY_GUIDE.md](file:///c:/Users/Acer/Desktop/ForenSOC/docs/USER_FRIENDLY_GUIDE.md)**: This exact educational document mapping user guide improvements.
*   **[IMPLEMENTATION_TRACKER.md](file:///c:/Users/Acer/Desktop/ForenSOC/docs/IMPLEMENTATION_TRACKER.md)**: Technical task board tracing status of UX integrations.

### 🛠️ Modified System Files
*   **[LoginPage.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/pages/LoginPage.tsx)**: Added quick-click credentials chips, simplified visual components, and added TLS and JWT security tags.
*   **[DashboardPage.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/pages/DashboardPage.tsx)**: Embedded direct floating actions, command palette support, custom loading states, empty stat guides, and breadcrumbs.
*   **[AlertsPage.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/pages/AlertsPage.tsx)**: Integrated custom table skeleton loaders, helper triage tooltips, and empty states.
*   **[Navigation.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/Navigation.tsx)**: Added Student Guide trigger links, quick glossary pop-up triggers, integrated header search hooks, and modern styling adjustments.
*   **[Routes.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/Routes.tsx)**: Registered onboarding pipelines, public lookup routes, and robust redirects.
*   **[App.tsx](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/App.tsx)**: Injected Global Floating Action components, Ctrl+K hotkey captures, and standard global UI frameworks.
*   **[index.ts](file:///c:/Users/Acer/Desktop/ForenSOC/frontend-react/src/components/index.ts)**: Centralized global component index exports.
*   **[README.md](file:///c:/Users/Acer/Desktop/ForenSOC/README.md)**: Updated and structured primary project instructions, login profiles, default credentials, and platform features.
*   **[USER_GUIDE.md](file:///c:/Users/Acer/Desktop/ForenSOC/docs/USER_GUIDE.md)**: Enhanced login documentation, role descriptions, and configuration guides.

---

**Version:** 1.1  
**Last Updated:** May 2026  
**Maintained by:** ForenSOC Team
