"""
Constants for ForenSOC application.
"""

# Severity levels
SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"]

# Alert statuses
ALERT_STATUS = ["New", "In Progress", "Investigating", "Closed", "False Positive"]

# Case statuses
CASE_STATUS = ["Open", "Active", "On Hold", "Closed", "Archived"]

# Evidence types
EVIDENCE_TYPES = [
    "PCAP",
    "Memory Dump",
    "Log File",
    "Disk Image",
    "Browser History",
    "Suspicious File",
    "Configuration File",
    "Database",
    "Email",
    "Other",
]

# Event types
EVENT_TYPES = [
    "failed_login",
    "successful_login",
    "file_access",
    "file_deletion",
    "file_creation",
    "file_modification",
    "network_connection",
    "port_scan",
    "dns_query",
    "process_execution",
    "privilege_escalation",
    "user_creation",
    "user_deletion",
    "group_modification",
]

# Log sources
LOG_SOURCES = [
    "auth.log",
    "apache.log",
    "nginx.log",
    "windows_event",
    "syslog",
    "suricata",
    "zeek",
    "csv",
    "json",
    "other",
]

# Timeline event sources
TIMELINE_SOURCES = [
    "alert",
    "auth.log",
    "web.log",
    "pcap",
    "browser_history",
    "file_system",
    "memory",
    "evidence_action",
]

# Role names
ROLE_ADMIN = "admin"
ROLE_MANAGER = "manager"
ROLE_INVESTIGATOR = "investigator"
ROLE_ANALYST = "analyst"

ROLES = [ROLE_ADMIN, ROLE_MANAGER, ROLE_INVESTIGATOR, ROLE_ANALYST]

# Detection rule types
RULE_TYPE_SSH_BRUTE_FORCE = "ssh_brute_force"
RULE_TYPE_PORT_SCAN = "port_scan"
RULE_TYPE_RANSOMWARE = "ransomware"
RULE_TYPE_DATA_EXFILTRATION = "data_exfiltration"
RULE_TYPE_SUSPICIOUS_POWERSHELL = "suspicious_powershell"
RULE_TYPE_PRIVILEGE_ESCALATION = "privilege_escalation"

# MITRE tactics
MITRE_TACTICS = {
    "reconnaissance": "Reconnaissance",
    "resource_development": "Resource Development",
    "initial_access": "Initial Access",
    "execution": "Execution",
    "persistence": "Persistence",
    "privilege_escalation": "Privilege Escalation",
    "defense_evasion": "Defense Evasion",
    "credential_access": "Credential Access",
    "discovery": "Discovery",
    "lateral_movement": "Lateral Movement",
    "collection": "Collection",
    "command_and_control": "Command and Control",
    "exfiltration": "Exfiltration",
    "impact": "Impact",
}

# Common MITRE techniques
MITRE_TECHNIQUES = {
    "T1110": {"tactic": "Credential Access", "technique": "Brute Force"},
    "T1046": {"tactic": "Discovery", "technique": "Network Service Discovery"},
    "T1059": {"tactic": "Execution", "technique": "Command and Scripting Interpreter"},
    "T1486": {"tactic": "Impact", "technique": "Data Encrypted for Impact"},
    "T1041": {"tactic": "Exfiltration", "technique": "Exfiltration Over C2 Channel"},
    "T1566": {"tactic": "Initial Access", "technique": "Phishing"},
}

# Report sections
REPORT_SECTIONS = [
    "executive_summary",
    "incident_details",
    "detection_summary",
    "affected_assets",
    "timeline_of_events",
    "evidence_collected",
    "forensic_analysis",
    "mitre_mapping",
    "indicators_of_compromise",
    "recommendations",
    "chain_of_custody",
    "appendix",
]

# Chain of custody actions
COC_ACTIONS = [
    "uploaded",
    "viewed",
    "analyzed",
    "exported",
    "hash_verified",
    "report_generated",
    "shared",
    "archived",
]

# Integrity statuses
INTEGRITY_STATUS_VERIFIED = "Verified"
INTEGRITY_STATUS_TAMPERED = "Tampered"
INTEGRITY_STATUS_PENDING = "Pending Verification"

# File extensions for suspicious files
SUSPICIOUS_EXTENSIONS = [
    ".exe",
    ".dll",
    ".sys",
    ".scr",
    ".msi",
    ".ps1",
    ".ps2",
    ".psc1",
    ".psc2",
    ".vbs",
    ".js",
    ".jse",
    ".bat",
    ".cmd",
    ".com",
    ".cpl",
    ".inf",
    ".jar",
    ".sh",
    ".bash",
    ".zsh",
]

# Ransomware indicators
RANSOMWARE_EXTENSIONS = [
    ".locked",
    ".encrypted",
    ".crypto",
    ".lck",
    ".enc",
    ".crypt",
    ".aes",
    ".rsaes-oaep",
    ".cerber",
    ".dharma",
]
