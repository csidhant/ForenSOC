import os
import time
import shutil
import asyncio

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from app.database import SessionLocal
from app.services.log_parser import LogParserService
from app.crud.event import EventCRUD
from app.services.detection_engine import DetectionEngine
from app.config import get_settings

settings = get_settings()

class AutoIngestHandler(FileSystemEventHandler):
    """
    Handles new file events in the 'ingest_drop' directory.
    Automatically ingests text files as logs.
    """
    def on_created(self, event):
        if event.is_directory:
            return
        
        # We need to run the async handler in a thread-safe way or using an event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.async_handle_created(event))
        loop.close()

    async def async_handle_created(self, event):

        if event.is_directory:
            return
        
        file_path = event.src_path
        filename = os.path.basename(file_path)
        
        # We only auto-ingest .log and .txt files
        if not filename.endswith(('.log', '.txt')):
            return

        print(f"[AUTO-INGEST] Detected new file: {filename}")
        time.sleep(1) # Wait for file write to complete
        
        db = SessionLocal()
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Create Raw Event
            raw_event = EventCRUD.create_raw_event(
                db,
                log_source=f"auto_watch_{filename}",
                raw_data=content,
                case_id=None
            )
            
            # Normalize
            normalized_data = LogParserService.parse(content, raw_event.log_source)
            normalized_event = EventCRUD.create_normalized_event(
                db,
                raw_event_id=raw_event.id,
                event_timestamp=normalized_data.get("event_timestamp"),
                log_source=normalized_data.get("log_source") or raw_event.log_source,
                source_ip=normalized_data.get("source_ip"),
                dest_ip=normalized_data.get("dest_ip"),
                source_port=normalized_data.get("source_port"),
                dest_port=normalized_data.get("dest_port"),
                username=normalized_data.get("username"),
                hostname=normalized_data.get("hostname"),
                event_type=normalized_data.get("event_type"),
                severity=normalized_data.get("severity"),
                description=normalized_data.get("description"),
                case_id=None,
                raw_log=content
            )
            
            # Process Detection
            engine = DetectionEngine(db)
            alerts = await engine.process_event(normalized_event)

            
            print(f"[AUTO-INGEST] Successfully processed {filename}. Generated {len(alerts)} alerts.")
            
            # Move processed file to an 'archive' folder to avoid re-processing
            archive_dir = os.path.join(os.path.dirname(file_path), 'processed_archive')
            os.makedirs(archive_dir, exist_ok=True)
            shutil.move(file_path, os.path.join(archive_dir, filename))
            
        except Exception as e:
            print(f"[AUTO-INGEST] Error processing {filename}: {e}")
        finally:
            db.close()

import subprocess
import json

class LocalMachineCollector:
    """
    Polls the local Windows Event Logs (Security) for recent events.
    """
    def __init__(self, db_session_factory):
        self.db_factory = db_session_factory
        self.last_check_time = time.time() - 60 # Start by looking at last 60 seconds

    def get_or_create_auto_case(self, db):
        """Finds or creates a persistent case for local monitoring."""
        from app.models.case import Case
        from app.crud.user import UserCRUD
        
        case = db.query(Case).filter(Case.title == "Automated Local Monitoring").first()
        if not case:
            admin = UserCRUD.get_user_by_username(db, "admin")
            case = Case(
                case_number="AUTO-001",
                title="Automated Local Monitoring",
                description="Continuous automated monitoring of the local Windows environment.",
                severity="Low",
                status="open",
                created_by=admin.id if admin else 1
            )
            db.add(case)
            db.commit()
            db.refresh(case)
        return case

    async def poll_security_logs(self):

        print(f"[LOCAL-COLLECTOR] Checking Windows Security Logs...")
        
        ps_command = (
            "Get-WinEvent -LogName Security -MaxEvents 5 | "
            "Select-Object TimeCreated, Id, Message | "
            "ConvertTo-Json"
        )
        
        try:
            result = subprocess.run(
                ["powershell", "-Command", ps_command],
                capture_output=True, text=True, check=False
            )
            
            if not result.stdout or result.stdout.strip() == "":
                return

            events = json.loads(result.stdout)
            if isinstance(events, dict):
                events = [events]
                
            db = self.db_factory()
            try:
                # Auto-assign to the Monitoring Case
                monitor_case = self.get_or_create_auto_case(db)
                
                for event in events:
                    raw_content = f"WinEvent ID {event.get('Id')}: {event.get('Message')}"
                    
                    raw_event = EventCRUD.create_raw_event(
                        db,
                        log_source="local_windows_security",
                        raw_data=raw_content,
                        case_id=monitor_case.id # <--- AUTO ASSIGNED
                    )
                    
                    normalized_data = LogParserService.parse(raw_content, "local_windows_security")
                    normalized_event = EventCRUD.create_normalized_event(
                        db,
                        raw_event_id=raw_event.id,
                        event_timestamp=normalized_data.get("event_timestamp"),
                        log_source="local_windows_security",
                        event_type=normalized_data.get("event_type") or f"WinEvent_{event.get('Id')}",
                        severity="Info",
                        description=f"Automated scan of local Windows Security Log: {event.get('Id')}",
                        raw_log=raw_content,
                        case_id=monitor_case.id # <--- AUTO ASSIGNED
                    )
                    
                    engine = DetectionEngine(db)
                    await engine.process_event(normalized_event)

                
                db.commit()
            finally:
                db.close()
                
        except Exception as e:
            print(f"[LOCAL-COLLECTOR] Error polling Windows logs: {e}")

async def start_auto_watcher():
    """Starts the directory watcher and the local collector."""
    watch_dir = os.path.join(os.getcwd(), 'ingest_drop')

    os.makedirs(watch_dir, exist_ok=True)
    
    print(f"[*] Starting ForenSOC Automation Engine...")
    print(f"[*] Folder Watcher active on: {watch_dir}")
    
    event_handler = AutoIngestHandler()
    observer = Observer()
    observer.schedule(event_handler, watch_dir, recursive=False)
    observer.start()
    
    # Initialize the local Windows collector
    local_collector = LocalMachineCollector(SessionLocal)
    
    try:
        while True:
            # Check local logs every 60 seconds
            await local_collector.poll_security_logs()
            await asyncio.sleep(60) 
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    asyncio.run(start_auto_watcher())

