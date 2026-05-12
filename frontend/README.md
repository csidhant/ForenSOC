# ForenSOC Frontend

Streamlit-based web interface for the ForenSOC integrated SOC and Digital Forensics Platform.

## Features

- **Dashboard**: Real-time overview of alerts and cases
- **Log Explorer**: Search and analyze security logs
- **Alert Management**: View, assign, and track security alerts
- **Case Management**: Create and manage investigation cases
- **Evidence Vault**: Upload and manage forensic evidence
- **Network Forensics**: Analyze PCAP files and network traffic
- **Memory Forensics**: Analyze memory dumps with Volatility 3
- **File Forensics**: Scan and analyze file systems
- **Browser Forensics**: Extract and analyze browser artifacts
- **Timeline**: Reconstruct incident timelines
- **Reports**: Generate professional incident reports

## Quick Start

### Development Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
streamlit run streamlit_app.py
```

The application will be available at: http://localhost:8501

## Project Structure

```
frontend/
├── streamlit_app.py     # Main application
├── pages/               # Streamlit pages
│   ├── 1_Dashboard.py
│   ├── 2_Log_Explorer.py
│   ├── 3_Alerts.py
│   ├── 4_Cases.py
│   ├── 5_Evidence.py
│   ├── 6_Network_Forensics.py
│   ├── 7_Memory_Forensics.py
│   ├── 8_File_Forensics.py
│   ├── 9_Browser_Forensics.py
│   ├── 10_Timeline.py
│   ├── 11_Reports.py
│   └── 12_Settings.py
├── components/          # Reusable components
├── requirements.txt     # Dependencies
└── Dockerfile          # Docker image
```

## Requirements

- Python 3.9+
- Streamlit 1.28+
- Backend API running on http://localhost:8000

## Configuration

### Streamlit Config

The `.streamlit/config.toml` file contains Streamlit settings. Create if needed:

```toml
[theme]
primaryColor = "#FF6B6B"
backgroundColor = "#FFFFFF"
secondaryBackgroundColor = "#F0F2F6"
textColor = "#262730"
font = "sans serif"

[client]
showErrorDetails = true
```

## Pages

### Dashboard
Overview of system status with key metrics:
- Total alerts by severity
- Open cases
- Recent incidents
- System health

### Log Explorer
Search and filter security logs:
- Filter by source, IP, event type
- Time range selection
- Detailed log view

### Alerts
Alert management interface:
- List all alerts with severity indicators
- Filter by status, severity, assignment
- Assign to analysts
- Add notes and convert to cases

### Cases
Investigation case management:
- Create and update cases
- View case timeline
- Link evidence and alerts
- Generate reports

### Evidence Vault
Digital evidence management:
- Upload and organize evidence
- Hash verification
- Chain of custody tracking
- Download and export

### Network Forensics
PCAP analysis:
- Upload PCAP files
- View Zeek and Suricata output
- Analyze flows and alerts
- Detect suspicious activity

### Memory Forensics
Memory dump analysis:
- Upload memory dumps
- Run Volatility 3 plugins
- View process information
- Detect suspicious processes

### File Forensics
File system analysis:
- Scan directories or disk images
- Detect modified files
- Identify ransomware indicators
- Extract suspicious files

### Browser Forensics
Browser history analysis:
- Extract URLs and downloads
- Identify suspicious sites
- Correlate with timeline
- Export findings

### Timeline
Event correlation and timeline:
- View chronological event sequence
- Filter by event type and severity
- Correlate events across sources
- Export timeline

### Reports
Report generation and management:
- Generate PDF reports
- Choose sections to include
- View generated reports
- Download and share

### Settings
Application configuration:
- User preferences
- API settings
- Display options

## Development

### Creating a New Page

1. Create file in `pages/` directory:
   ```python
   # pages/13_NewPage.py
   import streamlit as st
   
   st.title("New Page Title")
   st.write("Content here")
   ```

2. Page will automatically appear in navigation (Streamlit magic)

### Creating Reusable Components

1. Create component in `components/` directory:
   ```python
   # components/alerts_table.py
   import streamlit as st
   
   def show_alerts(alerts):
       st.dataframe(alerts)
   ```

2. Import and use in pages:
   ```python
   from components.alerts_table import show_alerts
   show_alerts(data)
   ```

## API Integration

All pages communicate with the FastAPI backend:

```python
import requests

API_URL = "http://localhost:8000/api"

# Example: Get alerts
response = requests.get(f"{API_URL}/alerts")
alerts = response.json()
```

Ensure backend is running before starting frontend.

## Docker

Build and run with Docker:

```bash
docker build -t forensoc-frontend .
docker run -p 8501:8501 forensoc-frontend
```

Or use Docker Compose from project root:

```bash
docker-compose up frontend
```

## Troubleshooting

### "API Disconnected" Error
- Ensure backend is running: `python -m uvicorn app.main:app --reload`
- Check backend is accessible at http://localhost:8000
- Verify CORS settings in backend config

### Page Not Showing
- Streamlit auto-discovers pages in `pages/` directory
- File must be named with format: `#_PageName.py`
- Restart Streamlit: `Ctrl+C` and rerun

### Slow Performance
- Check backend API response times
- Reduce data fetched (add pagination)
- Use Streamlit caching: `@st.cache_data`

## Best Practices

1. **Caching**: Use `@st.cache_data` for expensive operations
2. **Error Handling**: Always handle API errors gracefully
3. **Loading States**: Show loading spinners during API calls
4. **Data Validation**: Validate user input before sending to API
5. **Responsive Design**: Use columns and containers for layout

## Contributing

1. Follow Streamlit best practices
2. Use consistent styling and naming
3. Add comments for complex logic
4. Test with different screen sizes
5. Submit pull request with description

## License

ForenSOC - Advanced Integrated SOC and Digital Forensics Platform

## Support

For issues and questions, refer to the main project documentation.
