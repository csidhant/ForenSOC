import requests
from typing import Dict, Any, List


class ThreatIntelService:
    """Service for interacting with public threat intelligence feeds."""

    # Using AlienVault OTX as an example integration
    OTX_API_URL = "https://otx.alienvault.com/api/v1/indicators"

    @classmethod
    def check_ip(cls, ip_address: str) -> Dict[str, Any]:
        """Check IP address against OTX."""
        try:
            response = requests.get(
                f"{cls.OTX_API_URL}/IPv4/{ip_address}/general", timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                pulse_count = data.get("pulse_info", {}).get("count", 0)
                return {
                    "indicator": ip_address,
                    "type": "IP",
                    "malicious": pulse_count > 0,
                    "pulse_count": pulse_count,
                    "source": "AlienVault OTX",
                    "details": f"Found in {pulse_count} pulses.",
                }
            return {"indicator": ip_address, "malicious": False, "error": "Not found"}
        except Exception as e:
            return {"indicator": ip_address, "malicious": False, "error": str(e)}

    @classmethod
    def check_hash(cls, file_hash: str) -> Dict[str, Any]:
        """Check file hash (MD5, SHA1, SHA256) against OTX."""
        hash_type = "file"
        try:
            response = requests.get(
                f"{cls.OTX_API_URL}/{hash_type}/{file_hash}/general", timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                pulse_count = data.get("pulse_info", {}).get("count", 0)
                return {
                    "indicator": file_hash,
                    "type": "FileHash",
                    "malicious": pulse_count > 0,
                    "pulse_count": pulse_count,
                    "source": "AlienVault OTX",
                }
            return {"indicator": file_hash, "malicious": False, "error": "Not found"}
        except Exception as e:
            return {"indicator": file_hash, "malicious": False, "error": str(e)}

    @classmethod
    def check_virustotal(cls, file_hash: str) -> Dict[str, Any]:
        """Check file hash against VirusTotal API."""
        # Simulated VirusTotal Integration
        # In production, use VT API v3 with an API key
        return {
            "indicator": file_hash,
            "type": "FileHash",
            "source": "VirusTotal",
            "malicious": False,
            "details": "Simulated clean result"
        }

    @classmethod
    def check_shodan(cls, ip_address: str) -> Dict[str, Any]:
        """Check IP address against Shodan API."""
        # Simulated Shodan Integration
        # In production, use Shodan API with an API key
        return {
            "indicator": ip_address,
            "type": "IP",
            "source": "Shodan",
            "malicious": False,
            "details": "Simulated benign IP",
            "open_ports": [80, 443]
        }
