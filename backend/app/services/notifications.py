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
    def send_slack_alert(message: str) -> bool:
        """
        Send a notification to a Slack webhook.
        """
        slack_webhook_url = getattr(settings, "SLACK_WEBHOOK_URL", None)
        if not slack_webhook_url:
            print(f"DEBUG: Slack alert generated but no webhook configured: {message}")
            return False
            
        import requests
        try:
            response = requests.post(
                slack_webhook_url,
                json={"text": message},
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            print(f"ERROR: Failed to send Slack alert: {e}")
            return False

    @staticmethod
    def notify_analysts(alert_title: str, severity: str, details: str):
        """Notify all relevant analysts of a new high-severity alert."""
        if severity.lower() in ["high", "critical"]:
            # Email Notification
            NotificationService.send_email_alert(
                recipient="soc-team@example.com",
                subject=f"[{severity.upper()}] New Alert: {alert_title}",
                message_body=details,
            )
            # Slack Notification
            NotificationService.send_slack_alert(
                message=f"*[{severity.upper()}] New Alert:* {alert_title}\n{details}"
            )
