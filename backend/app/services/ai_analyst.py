from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.case import Case
from typing import List

class SmartAnalyst:
    """
    Simulates an AI analyst to provide natural language summaries 
    of technical security events.
    """
    
    @staticmethod
    def summarize_case(db: Session, case_id: int) -> str:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return "Case not found."
        
        alerts = db.query(Alert).filter(Alert.case_id == case_id).all()
        
        if not alerts:
            return f"Case '{case.title}' currently has no detected alerts. It appears to be a clean or manual investigation."
        
        severity_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        tactics = set()
        
        for alert in alerts:
            severity_counts[alert.severity] = severity_counts.get(alert.severity, 0) + 1
            if alert.mitre_tactic:
                tactics.add(alert.mitre_tactic)
        
        summary = f"Summary for Case {case.case_number}:\n"
        summary += f"- This investigation involves {len(alerts)} security alerts.\n"
        
        if severity_counts['Critical'] > 0 or severity_counts['High'] > 0:
            summary += "- WARNING: High-severity threats detected. Urgent action recommended.\n"
        
        if tactics:
            summary += f"- Observed attacker tactics include: {', '.join(tactics)}.\n"
        
        summary += "\nAI Recommendation:\n"
        if "Credential Access" in tactics:
            summary += "-> Attacker is attempting to steal passwords. Reset administrative credentials and enable MFA immediately."
        elif "Discovery" in tactics:
            summary += "-> Potential internal recon detected. Isolate the source host to prevent lateral movement."
        else:
            summary += "-> Continue monitoring. Collect more evidence logs to verify if this is a false positive."
            
        return summary

    @staticmethod
    def explain_alert(alert: Alert) -> str:
        """Explains a single alert in plain English."""
        explanations = {
            "ssh_brute_force": "Someone is trying to guess a password on your server by trying many combinations very quickly.",
            "suspicious_web": "A user or bot is trying to access sensitive admin areas of your website that should be hidden.",
            "multiple_failed_logins": "There are repeated login failures, which usually means an account is being targeted for hijacking.",
            "ransomware_activity": "Critical! High-speed file modifications detected. This looks like ransomware encrypting your data."
        }
        
        base_desc = alert.description or "No technical details provided."
        simple_desc = explanations.get(alert.rule_type, "This is a suspicious technical event that requires analyst review.")
        
        return f"Technically: {base_desc}\nIn Simple Terms: {simple_desc}"
