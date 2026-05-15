"""
Sigma rule loader for ForenSOC.
Parses Sigma YAML files and converts them to ForenSOC DetectionRules.
"""

import yaml
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.detection import DetectionRule
from app.services.detection_engine import RuleManager

class SigmaLoader:
    """Helper to parse and import Sigma rules."""

    @staticmethod
    def parse_sigma_yaml(yaml_content: str) -> Dict[str, Any]:
        """Parse a single Sigma YAML string into a ForenSOC rule format."""
        try:
            data = yaml.safe_load(yaml_content)
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML content: {e}")

        # Map Sigma fields to ForenSOC DetectionRule fields
        # This is a simplified mapping
        name = data.get('title', 'Untitled Sigma Rule')
        description = data.get('description', '')
        status = data.get('status', 'stable')
        level = data.get('level', 'medium') # low, medium, high, critical
        
        # Severity mapping
        severity_map = {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'critical': 'Critical'
        }
        severity = severity_map.get(level.lower(), 'Medium')

        # MITRE ATT&CK mapping
        mitre_tags = [t for t in data.get('tags', []) if t.startswith('attack.')]
        mitre_id = None
        mitre_tactic = None
        mitre_technique = None

        for tag in mitre_tags:
            if tag.startswith('attack.t'): # Technique ID
                mitre_id = tag.split('.')[-1].upper()
            elif tag.startswith('attack.initial_access'): # Tactics (example)
                mitre_tactic = 'Initial Access'
            # Add more tactic mappings as needed

        # Pattern mapping (Simplified)
        # In a real engine, we'd need a Sigma-to-SQL or Sigma-to-Query translator
        # Here we just store the Sigma detection block as a JSON pattern
        detection = data.get('detection', {})
        
        return {
            "name": name,
            "description": description,
            "severity": severity,
            "rule_type": "sigma",
            "pattern": detection,
            "event_type": data.get('logsource', {}).get('service'),
            "mitre_id": mitre_id,
            "mitre_tactic": mitre_tactic,
            "mitre_technique": mitre_technique,
            "enabled": True
        }

    @staticmethod
    def import_sigma_rule(db: Session, yaml_content: str, created_by: Optional[int] = None) -> DetectionRule:
        """Parse and save a Sigma rule to the database."""
        rule_data = SigmaLoader.parse_sigma_yaml(yaml_content)
        manager = RuleManager(db)
        return manager.create_rule(rule_data, created_by=created_by)
