# ForenSOC - Setup & Development Guide

## Quick Start

### Prerequisites
- Python 3.9+
- Git
- Docker & Docker Compose (optional)

### Step 1: Clone the Repository
```bash
cd "c:\Users\Acer\Desktop\new ideal"
```

### Step 2: Backend Setup (Development)

#### 2.1 Create Virtual Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

#### 2.2 Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2.3 Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings if needed
```

#### 2.4 Create Database (SQLite for MVP)
```bash
# SQLite database will be created automatically on first run
# For PostgreSQL, update DATABASE_URL in .env
```

#### 2.5 Run Backend
```bash
# From backend directory
python -m uvicorn app.main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000
API Documentation: http://localhost:8000/api/docs

### Step 3: Frontend Setup (React + TypeScript)

#### 3.1 Install Node.js
- Download and install Node.js 16+ from https://nodejs.org/
- Verify installation: `node --version` and `npm --version`

#### 3.2 Install Dependencies
```bash
cd frontend-react
npm install
```

#### 3.3 Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings (optional - defaults should work)
# VITE_API_BASE_URL=http://localhost:8000/api
```

#### 3.4 Run Development Server
```bash
# From frontend-react directory
npm run dev
```

Frontend will be available at: http://localhost:3000

**Features**:
- Modern React 18 + TypeScript interface
- Material-UI 5 components for professional look
- Dark/Light theme toggle
- Real-time state management with Zustand
- Responsive mobile-friendly design
- Case and alert management
- Professional dashboard with statistics

### Step 4: Verify Installation

1. Check Backend Health:
   ```bash
   curl http://localhost:8000/health
   ```

2. View API Documentation:
   - Swagger UI: http://localhost:8000/api/docs
   - ReDoc: http://localhost:8000/api/redoc

3. Access Frontend:
   - Open http://localhost:8501 in your browser
   - Should show dashboard with "API Connected" status

---

## Docker Setup (Optional)

### Using Docker Compose

```bash
# From project root directory
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- FastAPI backend on port 8000
- React frontend on port 3000

To stop:
```bash
docker-compose down
```

### Building React Frontend Docker Image

Build the React frontend Docker image:
```bash
cd frontend-react
docker build -t forensoc-react-frontend:latest .
```

Run the React frontend container:
```bash
docker run -p 3000:3000 forensoc-react-frontend:latest
```

Access at: http://localhost:3000

To view logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Project Structure

```
ForenSOC/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── crud/              # Database operations
│   │   ├── api/               # API route handlers
│   │   ├── services/          # Business logic services
│   │   ├── utils/             # Utility functions
│   │   ├── tasks/             # Celery async tasks
│   │   ├── rules/             # Detection rules
│   │   ├── main.py            # FastAPI application entry
│   │   ├── config.py          # Configuration
│   │   └── database.py        # Database connection
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── .gitignore
├── frontend/                  # Streamlit UI
│   ├── streamlit_app.py      # Main application
│   ├── pages/                # Streamlit pages
│   ├── components/           # Reusable components
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── docs/                      # Documentation
```

---

## Development Workflow

### 1. Add a New Model
1. Create model in `backend/app/models/<module>.py`
2. Add relationship in related models
3. Import in `backend/app/models/__init__.py`
4. Create migration with Alembic
5. Run migration

### 2. Add a New API Endpoint
1. Create Pydantic schema in `backend/app/schemas/<module>.py`
2. Create CRUD operations in `backend/app/crud/<module>.py`
3. Create or update service in `backend/app/services/<module>.py`
4. Create route in `backend/app/api/<module>.py`
5. Import route in `backend/app/main.py`

### 3. Add UI Page
1. Create page in `frontend/pages/<number>_PageName.py`
2. Import components from `frontend/components/`
3. Make API calls to backend
4. Restart Streamlit

### 4. Run Tests
```bash
cd backend
pytest
# With coverage:
pytest --cov=app tests/
```

### 5. Code Quality
```bash
# Format code
black app/

# Lint
pylint app/

# Type checking
mypy app/
```

---

## Common Issues & Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.9+)
- Check port 8000 is available
- Check for errors in terminal output
- Verify all dependencies installed: `pip list`

### Frontend shows "API Disconnected"
- Ensure backend is running on http://localhost:8000
- Check firewall/network settings
- Verify CORS settings in `backend/app/config.py`

### Database errors
- For SQLite: Delete `forensoc.db` to reset
- For PostgreSQL: Check connection string in `.env`
- Verify database is running

### Import errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check PYTHONPATH includes project root

---

## Next Steps

1. **Authentication**: Implement user login and JWT tokens
2. **Log Parser**: Create log ingestion service
3. **Detection Engine**: Implement rule-based detection
4. **Evidence Management**: Complete evidence upload and hashing
5. **PCAP Analysis**: Integrate Zeek and Suricata
6. **Memory Forensics**: Integrate Volatility 3
7. **Timeline Building**: Implement event correlation
8. **Report Generation**: Create PDF reports

---

## Documentation

- **Design Document**: `PROJECT_DESIGN.md` - Architecture and modules overview
- **Database Schema**: `DATABASE_SCHEMA.md` - Database design and tables
- **API Specification**: `ARCHITECTURE_AND_API.md` - Complete API endpoints
- **Implementation Roadmap**: `IMPLEMENTATION_ROADMAP.md` - Phase breakdown

---

## Support & Contribution

For issues, questions, or contributions, please refer to the project documentation and design documents.

---

**ForenSOC v1.0.0** - Advanced Integrated SOC and Digital Forensics Platform
