import geocoder
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

class GeoIPService:
    @staticmethod
    @lru_cache(maxsize=1024)
    def get_location(ip_address: str):
        """
        Resolves an IP address to geographic coordinates.
        Uses the 'freegeoip' or 'ipinfo' provider via geocoder.
        """
        if not ip_address or ip_address in ["127.0.0.1", "localhost", "::1"]:
            return None

        try:
            # We use ipinfo as a primary provider (no key needed for basic lookups)
            g = geocoder.ip(ip_address)
            if g.ok:
                return {
                    "ip": ip_address,
                    "city": g.city,
                    "country": g.country,
                    "lat": g.lat,
                    "lng": g.lng,
                    "address": g.address
                }
            return None
        except Exception as e:
            logger.error(f"GeoIP lookup failed for {ip_address}: {e}")
            return None

geoip_service = GeoIPService()
