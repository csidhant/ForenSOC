/**
 * Help Content Library
 * Centralized explanations for all UI elements
 * Used by HelpTooltip components throughout the app
 */

export const HELP_CONTENT = {
  // ─── ALERTS ─────────────────────────────────────────────────────────
  alerts: {
    severity: {
      title: "Alert Severity",
      description:
        "🔴 Critical: Immediate action required\n🟠 High: Investigate within 1 hour\n🟡 Medium: Investigate within 1 day\n🔵 Low: Informational, review when available",
    },
    status: {
      title: "Alert Status",
      description:
        "New: Unreviewed alert\nIn Progress: Currently being investigated\nResolved: Investigation complete\nFalse Positive: Not a real threat (helps tune rules)",
    },
    sourceIp: {
      title: "Source IP",
      description:
        "The IP address that initiated the network activity. Click to search all events from this IP.",
    },
    destIp: {
      title: "Destination IP",
      description:
        "The IP address that received the network activity. May be internal or external.",
    },
    alertType: {
      title: "Alert Type",
      description:
        "Category of the threat detected. Examples: brute_force, port_scan, malware, suspicious_login, web_attack",
    },
  },

  // ─── CASES ──────────────────────────────────────────────────────────
  cases: {
    priority: {
      title: "Case Priority",
      description:
        "🔴 Critical: Immediate action\n🟠 High: Within 24 hours\n🟡 Medium: Within 1 week\n🔵 Low: When time allows",
    },
    caseStatus: {
      title: "Case Status",
      description:
        "Open: Investigation ongoing\nOn Hold: Waiting for additional info\nClosed: Investigation complete\nArchived: Historical reference",
    },
    linkedAlerts: {
      title: "Linked Alerts",
      description:
        "Security events associated with this investigation. Click an alert to view details or mark as resolved.",
    },
    evidence: {
      title: "Evidence Files",
      description:
        "Forensic artifacts collected during investigation. Each file has hash verification (MD5/SHA-256) for chain of custody.",
    },
    timeline: {
      title: "Timeline Events",
      description:
        "Chronological sequence of events related to the incident. Helps reconstruct the attack flow and understand progression.",
    },
  },

  // ─── EVIDENCE ────────────────────────────────────────────────────────
  evidence: {
    fileHash: {
      title: "File Hash (MD5 & SHA-256)",
      description:
        "Unique fingerprints of the file for integrity verification. MD5 is fast but less secure. SHA-256 is more secure. Both are automatically calculated.",
    },
    chainOfCustody: {
      title: "Chain of Custody",
      description:
        "Audit trail showing who accessed the evidence and when. Required for legal compliance and case credibility.",
    },
    fileType: {
      title: "File Type",
      description:
        "Category of the forensic artifact. Examples: malware, log_file, memory_dump, pcap, registry, browser_history, email",
    },
    scanResults: {
      title: "Scan Results",
      description:
        "Results from automatic antivirus and YARA rule scanning. Green = clean, Red = threats detected.",
    },
  },

  // ─── FORENSICS ──────────────────────────────────────────────────────
  forensics: {
    yaraScanning: {
      title: "YARA Scanning",
      description:
        "Pattern-based malware detection engine. Compares files against rule sets to identify known malicious patterns. Returns matches with severity levels.",
    },
    volatilityAnalysis: {
      title: "Memory Analysis (Volatility)",
      description:
        "Extracts and analyzes RAM (memory) dumps. Reveals: running processes, network connections, injected code, credentials, rootkits.",
    },
    pcapAnalysis: {
      title: "PCAP Analysis (Zeek/Suricata)",
      description:
        "Analyzes network packet captures. Shows: traffic patterns, suspicious IPs, malicious domains, protocol anomalies, file transfers.",
    },
    timeline: {
      title: "Timeline Builder",
      description:
        "Correlates events chronologically. Helps reconstruct attack sequence: initial compromise → lateral movement → data exfiltration → cleanup.",
    },
  },

  // ─── DETECTION ──────────────────────────────────────────────────────
  detection: {
    sigmaRules: {
      title: "Sigma Rules",
      description:
        "Generic rule format for log-based threat detection. Works with Splunk, ELK, ArcSight, etc. Easy to write and share in SOC community.",
    },
    ruleStatus: {
      title: "Rule Status",
      description:
        "Enabled: Rule is actively detecting threats\nDisabled: Rule is turned off\nTesting: Rule in evaluation phase\nDeprecated: Old rule, no longer used",
    },
    ruleMatches: {
      title: "Total Matches",
      description:
        "Number of times this rule has triggered alerts. High numbers may indicate: active threat or rule needs tuning.",
    },
    lastTriggered: {
      title: "Last Triggered",
      description:
        "When this rule last detected something. Recently triggered rules often need immediate attention.",
    },
  },

  // ─── MITRE ATT&CK ───────────────────────────────────────────────────
  mitre: {
    techniques: {
      title: "MITRE ATT&CK Techniques",
      description:
        "Standardized catalog of adversary tactics and techniques used in real-world attacks. Helps classify attacks and compare threat actors.",
    },
    tactic: {
      title: "Tactic",
      description:
        "High-level category of attacker behavior. Examples: Reconnaissance, Weaponization, Delivery, Exploitation, Installation, C&C, Actions on Objectives",
    },
    mitigations: {
      title: "Mitigations",
      description:
        "Defensive actions to prevent or detect this technique. Includes: network segmentation, EDR deployment, detection rules, user training.",
    },
  },

  // ─── TIMELINE ────────────────────────────────────────────────────────
  timeline: {
    eventTime: {
      title: "Event Time",
      description:
        "Exact timestamp when the event occurred. Critical for correlation. Always use UTC to avoid timezone confusion.",
    },
    eventType: {
      title: "Event Type",
      description:
        "Category of event. Examples: login, file_access, network_connection, process_execution, suspicious_behavior, alert_triggered",
    },
    hostname: {
      title: "Hostname",
      description: "Computer/server where the event originated. Helps identify affected systems in your network.",
    },
    username: {
      title: "Username",
      description: "User account involved in the event. May reveal compromised accounts or insider threat.",
    },
    description: {
      title: "Event Description",
      description: "Detailed explanation of what happened. Keep detailed notes for the final report.",
    },
  },

  // ─── REPORTS ────────────────────────────────────────────────────────
  reports: {
    reportType: {
      title: "Report Type",
      description:
        "📄 Investigation: Detailed analysis and findings\n🎯 Executive: High-level summary for management\n🔍 Technical: Deep technical details for SOC team",
    },
    includeTimeline: {
      title: "Include Timeline",
      description:
        "Shows chronological sequence of events. Helps stakeholders understand attack progression and progression.",
    },
    includeMitre: {
      title: "Include MITRE ATT&CK Heatmap",
      description:
        "Visual mapping of attacker techniques against MITRE framework. Helps understand threat actor patterns and TTPs.",
    },
    includeEvidence: {
      title: "Include Evidence Summary",
      description:
        "List of collected forensic artifacts. Shows chain of custody and integrity verification hashes.",
    },
  },

  // ─── AUDIT LOGS ──────────────────────────────────────────────────────
  audit: {
    action: {
      title: "Audit Action",
      description:
        "What operation was performed. Examples: user_login, alert_created, case_modified, evidence_uploaded, report_generated, user_deleted",
    },
    user: {
      title: "User",
      description: "Which user performed the action. Use for accountability and investigating unauthorized actions.",
    },
    timestamp: {
      title: "Timestamp",
      description: "When the action occurred (UTC). Useful for correlating with security incidents.",
    },
    details: {
      title: "Details",
      description: "Additional context about the action. May include before/after values, IP address, or error messages.",
    },
  },

  // ─── LOGS ────────────────────────────────────────────────────────────
  logs: {
    logSource: {
      title: "Log Source",
      description:
        "Where the log came from. Examples: syslog, Windows Event Log, Apache, Nginx, firewall, proxy, DNS server, endpoint detection",
    },
    searchIp: {
      title: "Search by IP",
      description: "Find all events from a specific IP address. Great for pivoting on suspicious IPs from alerts.",
    },
    searchUsername: {
      title: "Search by Username",
      description: "Find all events from a specific user account. Helps identify compromised accounts or unauthorized access.",
    },
    searchDomain: {
      title: "Search by Domain",
      description: "Find all DNS lookups or HTTP requests to a domain. Helps identify C&C communications.",
    },
  },

  // ─── DASHBOARD ────────────────────────────────────────────────────────
  dashboard: {
    overview: {
      title: "Dashboard Overview",
      description:
        "High-level view of cases, alerts, and system health. Spot spikes, open investigations, and critical threats quickly.",
    },
    threatMap: {
      title: "Threat Map",
      description:
        "Geographic view of alert source locations. Helps identify concentrated attack origins and network hotspots.",
    },
  },

  // ─── GENERAL ─────────────────────────────────────────────────────────
  general: {
    darkMode: {
      title: "Dark Mode",
      description:
        "🌙 Eye-friendly theme for 24/7 SOC analysts. Reduces eye strain during long investigation sessions.",
    },
    rolePermissions: {
      title: "User Roles",
      description:
        "👤 Admin: Full access, system configuration\n🔍 Analyst: Create cases, investigate alerts\n🧬 Investigator: Deep forensic analysis\n👁️ Viewer: Read-only access",
    },
    chainOfCustody: {
      title: "Chain of Custody",
      description:
        "Legal documentation showing who handled evidence and when. Ensures evidence admissibility in court. All file uploads are automatically logged.",
    },
  },
};

export type HelpKey = keyof typeof HELP_CONTENT;

/**
 * Get help content by path
 * Usage: getHelpContent('alerts.severity')
 */
export function getHelpContent(path: string): { title: string; description: string } | null {
  const parts = path.split(".");
  let current: any = HELP_CONTENT;

  for (const part of parts) {
    current = current?.[part];
    if (!current) return null;
  }

  return current;
}
