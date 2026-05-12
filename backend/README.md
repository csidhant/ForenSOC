# ForenSOC Backend

FastAPI-based backend for the ForenSOC integrated SOC and Digital Forensics Platform.

## Features

- **Log Management**: Ingest, normalize, and search security logs
- **Detection Engine**: Rule-based detection with MITRE ATT&CK mapping
- **Evidence Management**: Hash verification and chain of custody tracking
- **Network Forensics**: PCAP analysis with Zeek and Suricata
- **Memory Forensics**: Memory dump analysis with Volatility 3
- **File Forensics**: File system analysis and ransomware detection
- **Browser Forensics**: Browser history extraction and analysis
- **Timeline Reconstruction**: Event correlation and timeline building
- **Report Generation**: Professional PDF incident reports

## Quick Start

### Development Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run the application
python -m uvicorn app.main:app --reload
```

### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## Project Structure

```
backend/
├── app/
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── crud/            # Database operations
│   ├── api/             # Route handlers
│   ├── services/        # Business logic
│   ├── utils/           # Utilities
│   ├── tasks/           # Async tasks
│   ├── rules/           # Detection rules
│   ├── main.py          # FastAPI app
│   ├── config.py        # Configuration
│   └── database.py      # DB setup
├── tests/               # Test suite
├── requirements.txt     # Dependencies
├── .env.example        # Configuration template
└── Dockerfile          # Docker image
```

## Database

### SQLite (Default/MVP)
Lightweight, file-based database suitable for development and small deployments.

### PostgreSQL (Production)
For production deployments, update `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/forensoc
```

## Development

### Running Tests

```bash
pytest
pytest --cov=app  # With coverage
```

### Code Quality

```bash
black app/       # Format
pylint app/      # Lint
mypy app/        # Type check
```

## Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Migration message"

# Run migrations
alembic upgrade head

# Downgrade
alembic downgrade -1
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - Register user (admin only)
- `GET /api/auth/me` - Get current user

### Logs
- `POST /api/logs/ingest` - Upload logs
- `GET /api/logs/search` - Search logs
- `GET /api/logs/{log_id}` - Get log details

### Alerts
- `GET /api/alerts` - List alerts
- `GET /api/alerts/{alert_id}` - Get alert details
- `PATCH /api/alerts/{alert_id}` - Update alert
- `POST /api/alerts/{alert_id}/convert-to-case` - Convert to case

### Cases
- `GET /api/cases` - List cases
- `POST /api/cases` - Create case
- `GET /api/cases/{case_id}` - Get case details
- `GET /api/cases/{case_id}/timeline` - Get case timeline

### Evidence
- `POST /api/evidence/upload` - Upload evidence
- `GET /api/evidence` - List evidence
- `POST /api/evidence/{evidence_id}/verify-hash` - Verify integrity

### Forensics
- `POST /api/pcap/upload` - Upload PCAP
- `POST /api/memory/upload` - Upload memory dump
- `POST /api/files/scan` - Scan files
- `POST /api/browser/upload-history` - Upload browser history

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/{report_id}` - Download report

See `ARCHITECTURE_AND_API.md` for complete API specification.

## Configuration

Key environment variables in `.env`:

```
DATABASE_URL=sqlite:///./forensoc.db
SECRET_KEY=your-secret-key
DEBUG=false
API_V1_STR=/api
```

See `.env.example` for all available settings.

## Docker

Build and run with Docker:

```bash
docker build -t forensoc-backend .
docker run -p 8000:8000 forensoc-backend
```

Or use Docker Compose from project root:

```bash
docker-compose up backend
```

## Contributing

1. Follow PEP 8 style guide
2. Write tests for new features
3. Update documentation
4. Submit pull request

## License

ForenSOC - Advanced Integrated SOC and Digital Forensics Platform

## Support

For issues and questions, refer to the main project documentation.
