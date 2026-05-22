"""
Tests for the detection rules and scan engine in ForenSOC.
"""

import pytest
from app.services.detection_engine import DetectionEngine, RuleManager
from app.models.detection import DetectionRule
from app.models.event import NormalizedEvent
from datetime import datetime

def test_rule_creation_and_scan(db):
    # 1. Create a dummy detection rule
    rule_manager = RuleManager(db)
    rule_data = {
        "name": "Test Brute Force Detection",
        "description": "Detects multiple failed logins",
        "severity": "High",
        "rule_type": "ssh_brute_force",
        "pattern": {"event_type": "failed_login"},
        "event_type": "failed_login",
        "threshold": 1,
        "time_window_seconds": 300
    }
    rule = rule_manager.create_rule(rule_data)
    
    assert rule.id is not None
    assert rule.name == "Test Brute Force Detection"
    
    # 2. Add a dummy normalized event
    event = NormalizedEvent(
        event_type="failed_login",
        log_source="SSH",
        source_ip="192.168.1.100",
        event_timestamp=datetime.now(),
        created_at=datetime.now()
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    # 3. Scan historical events
    engine = DetectionEngine(db)
    # The scan_historical_events is async, let's run it in an async context or since we are testing async:
    # We can use pytest-asyncio if installed, or just use anyio/asyncio runner
    
@pytest.mark.asyncio
async def test_async_historical_scan(db):
    rule_manager = RuleManager(db)
    rule_data = {
        "name": "SSH Brute Force Test",
        "description": "Failed logins brute force",
        "severity": "Critical",
        "rule_type": "ssh_brute_force",
        "pattern": {"event_type": "failed_login"},
        "event_type": "failed_login",
        "threshold": 1,
        "time_window_seconds": 300
    }
    rule = rule_manager.create_rule(rule_data)
    
    # Create and add a normalized event matching the rule
    event = NormalizedEvent(
        event_type="failed_login",
        log_source="SSH",
        source_ip="192.168.1.50",
        event_timestamp=datetime.now(),
        created_at=datetime.now()
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    engine = DetectionEngine(db)
    alerts = await engine.scan_historical_events(24)
    
    # Check that alerts were successfully scanned and generated
    assert len(alerts) >= 1
    assert alerts[0].detection_rule_id == rule.id
    assert alerts[0].source_ip == "192.168.1.50"
