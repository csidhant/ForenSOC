"""
Log parser service for ingesting and normalizing raw log data.
"""

import re
from datetime import datetime
from typing import Dict, Optional


class LogParserService:
    """Service to parse raw log text into normalized event fields."""

    @staticmethod
    def parse(raw_data: str, log_source: str = "unknown") -> Dict[str, Optional[str]]:
        """Parse raw log content and return normalized event values."""
        text = raw_data.strip()
        if not text:
            return LogParserService._generic_parse(raw_data, log_source)

        source_lower = log_source.lower()
        if "auth" in source_lower or "sshd" in text.lower():
            return LogParserService._parse_auth_log(text, log_source)
        if "apache" in source_lower or "nginx" in source_lower or re.search(r'"\s\d{3}\s\d+', text):
            return LogParserService._parse_web_log(text, log_source)
        if "syslog" in source_lower or "syslog" in text.lower():
            return LogParserService._generic_parse(raw_data, log_source)

        return LogParserService._generic_parse(raw_data, log_source)

    @staticmethod
    def _parse_auth_log(raw_data: str, log_source: str) -> Dict[str, Optional[str]]:
        timestamp = LogParserService._parse_syslog_timestamp(raw_data)
        event_type = "authentication"
        severity = "Medium"
        description = raw_data
        username = None
        source_ip = None
        hostname = None

        if re.search(r'failed password|authentication failure|invalid user', raw_data, re.IGNORECASE):
            event_type = "failed_login"
            severity = "High"
        elif re.search(r'accepted password|accepted publickey|accepted keyboard-interactive', raw_data, re.IGNORECASE):
            event_type = "successful_login"
            severity = "Low"

        user_match = re.search(r'for (?P<username>[\w\-_.]+)', raw_data)
        if user_match:
            username = user_match.group("username")

        ip_match = re.search(r'(?:from|rhost=)(?P<ip>\d{1,3}(?:\.\d{1,3}){3})', raw_data)
        if ip_match:
            source_ip = ip_match.group("ip")

        host_match = re.search(r'(?P<hostname>[\w\-_.]+)\s*(?:sshd|sudo|su)?', raw_data)
        if host_match:
            hostname = host_match.group("hostname")

        return {
            "event_timestamp": timestamp,
            "log_source": log_source,
            "source_ip": source_ip,
            "dest_ip": None,
            "source_port": None,
            "dest_port": None,
            "username": username,
            "hostname": hostname,
            "event_type": event_type,
            "severity": severity,
            "description": description,
        }

    @staticmethod
    def _parse_web_log(raw_data: str, log_source: str) -> Dict[str, Optional[str]]:
        timestamp = datetime.utcnow()
        event_type = "web_request"
        severity = "Low"
        description = raw_data
        source_ip = None
        dest_ip = None
        source_port = None
        dest_port = None
        username = None
        hostname = None

        log_match = re.search(
            r'(?P<remote>\d{1,3}(?:\.\d{1,3}){3})\s+-\s+(?P<user>[^\s]+)\s+\[(?P<time>[^\]]+)\]\s+"(?P<method>GET|POST|PUT|DELETE|HEAD|OPTIONS)\s+(?P<path>[^\s]+)\s+HTTP/[0-9.]+'
            r'"\s+(?P<status>\d{3})\s+(?P<size>\d+)',
            raw_data,
        )
        if log_match:
            source_ip = log_match.group("remote")
            username = log_match.group("user") if log_match.group("user") != "-" else None
            description = f"{log_match.group('method')} {log_match.group('path')} -> {log_match.group('status')}"
            status = int(log_match.group("status"))
            if status >= 500:
                severity = "High"
            elif status >= 400:
                severity = "Medium"
            event_type = "http_request"
            try:
                timestamp = datetime.strptime(log_match.group("time"), "%d/%b/%Y:%H:%M:%S %z")
            except ValueError:
                timestamp = datetime.utcnow()

        return {
            "event_timestamp": timestamp,
            "log_source": log_source,
            "source_ip": source_ip,
            "dest_ip": dest_ip,
            "source_port": source_port,
            "dest_port": dest_port,
            "username": username,
            "hostname": hostname,
            "event_type": event_type,
            "severity": severity,
            "description": description,
        }

    @staticmethod
    def _generic_parse(raw_data: str, log_source: str) -> Dict[str, Optional[str]]:
        return {
            "event_timestamp": datetime.utcnow(),
            "log_source": log_source,
            "source_ip": None,
            "dest_ip": None,
            "source_port": None,
            "dest_port": None,
            "username": None,
            "hostname": None,
            "event_type": "log_entry",
            "severity": "Info",
            "description": raw_data,
        }

    @staticmethod
    def _parse_syslog_timestamp(raw_data: str) -> datetime:
        match = re.match(r"^(?P<ts>\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})", raw_data)
        if not match:
            return datetime.utcnow()

        timestamp_str = f"{match.group('ts')} {datetime.utcnow().year}"
        try:
            return datetime.strptime(timestamp_str, "%b %d %H:%M:%S %Y")
        except ValueError:
            return datetime.utcnow()
