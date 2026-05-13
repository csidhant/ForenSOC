"""
Main FastAPI application for ForenSOC.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.config import get_settings
from app.database import engine, SessionLocal
from app.models.base import Base
from app.models.detection import DetectionRule

# Create all tables
Base.metadata.create_all(bind=engine)

settings = get_settings()

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Advanced Integrated SOC and Digital Forensics Platform",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "health": "/health",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


def custom_openapi():
    """Customize OpenAPI schema."""
    if not app.openapi_schema:
        app.openapi_schema = get_openapi(
            title=settings.APP_NAME,
            version=settings.APP_VERSION,
            description="Advanced Integrated SOC and Digital Forensics Platform",
            routes=app.routes,
        )
    return app.openapi_schema


app.openapi = custom_openapi


def init_default_roles_and_admin():
    """Initialize essential role definitions and default admin user."""
    from app.crud.user import RoleCRUD, UserCRUD

    db = SessionLocal()
    try:
        default_roles = [
            ("admin", "Administrator"),
            ("analyst", "Security Analyst"),
            ("investigator", "Investigation Analyst"),
            ("viewer", "Read-only Viewer"),
        ]

        for role_name, description in default_roles:
            if not RoleCRUD.get_role_by_name(db, role_name):
                RoleCRUD.create_role(db, role_name, description)

        admin_user = UserCRUD.get_user_by_username(db, settings.ADMIN_USERNAME)
        if not admin_user:
            admin_role = RoleCRUD.get_role_by_name(db, "admin")
            if admin_role:
                UserCRUD.create_user(
                    db,
                    username=settings.ADMIN_USERNAME,
                    email=settings.ADMIN_EMAIL,
                    password=settings.ADMIN_PASSWORD,
                    role_id=admin_role.id,
                )

        # Initialize default detection rules
        init_default_detection_rules(db)

    finally:
        db.close()


def init_default_detection_rules(db):
    """Initialize default detection rules."""
    from app.services.detection_engine import RuleManager

    rule_manager = RuleManager(db)

    default_rules = [
        {
            "name": "SSH Brute Force Detection",
            "description": "Detects multiple failed SSH login attempts from the same IP",
            "severity": "High",
            "rule_type": "ssh_brute_force",
            "pattern": {
                "event_type": "failed_login",
                "threshold": 5
            },
            "event_type": "failed_login",
            "threshold": 5,
            "time_window_seconds": 300,
            "mitre_tactic": "Credential Access",
            "mitre_technique": "Brute Force",
            "mitre_id": "T1110",
        },
        {
            "name": "Suspicious Web Request",
            "description": "Detects web requests with suspicious patterns",
            "severity": "Medium",
            "rule_type": "suspicious_web",
            "pattern": {
                "event_type": "http_request",
                "path_contains": ["/admin", "/wp-admin", "/phpmyadmin"]
            },
            "event_type": "http_request",
            "threshold": 1,
            "time_window_seconds": 60,
            "mitre_tactic": "Discovery",
            "mitre_technique": "Network Service Scanning",
            "mitre_id": "T1046",
        },
        {
            "name": "Multiple Failed Logins",
            "description": "Detects multiple authentication failures",
            "severity": "Medium",
            "rule_type": "multiple_failed_logins",
            "pattern": {
                "event_type": "failed_login",
                "threshold": 3
            },
            "event_type": "failed_login",
            "threshold": 3,
            "time_window_seconds": 600,
            "mitre_tactic": "Credential Access",
            "mitre_technique": "Brute Force",
            "mitre_id": "T1110",
        },
    ]

    for rule_data in default_rules:
        # Check if rule already exists
        existing = db.query(DetectionRule).filter(DetectionRule.name == rule_data["name"]).first()
        if not existing:
            try:
                rule_manager.create_rule(rule_data)
                print(f"Created detection rule: {rule_data['name']}")
            except Exception as e:
                print(f"Failed to create rule {rule_data['name']}: {e}")


@app.on_event("startup")
async def startup_event():
    init_default_roles_and_admin()


# Import API routers
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.cases import router as cases_router
from app.api.alerts import router as alerts_router
from app.api.logs import router as logs_router
from app.api.detection import router as detection_router
from app.api.evidence import router as evidence_router
from app.api.timeline import router as timeline_router
from app.api.reports import router as reports_router
from app.api.forensics import router as forensics_router
from app.api.mitre import router as mitre_router

# Register routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(cases_router)
app.include_router(alerts_router)
app.include_router(logs_router)
app.include_router(detection_router)
app.include_router(evidence_router)
app.include_router(timeline_router)
app.include_router(reports_router)
app.include_router(forensics_router)
app.include_router(mitre_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
