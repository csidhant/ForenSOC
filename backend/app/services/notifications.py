"""
Notification service for sending alerts via email.
"""

from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

settings = get_settings()

class NotificationService:
    """Service to handle system notifications."""

    @staticmethod
    def send_email_alert(recipient: str, subject: str, message_body: str) -> bool:
        """
        Send an email alert.
        Currently a placeholder for production SMTP configuration.
        """
        print(f"DEBUG: Sending email to {recipient}")
        print(f"DEBUG: Subject: {subject}")
        print(f"DEBUG: Body: {message_body}")
        
        # Integration logic here
        return True

    @staticmethod
    def notify_analysts(alert_title: str, severity: str, details: str):
        """Notify all relevant analysts of a new high-severity alert."""
        if severity.lower() in ["high", "critical"]:
            # In a real app, you'd fetch analyst emails from DB
            NotificationService.send_email_alert(
                recipient="soc-team@example.com",
                subject=f"[{severity.upper()}] New Alert: {alert_title}",
                message_body=details
            )
