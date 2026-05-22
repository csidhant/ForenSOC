# ============================================================
# ForenSOC Backend — Dockerfile
# Multi-stage build for minimal production image
# ============================================================

FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpq-dev \
    libyara-dev \
    libmagic-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads /app/ingest_drop

# Expose port (Render sets $PORT dynamically)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start command — uses $PORT from environment (Render/Railway inject this)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
