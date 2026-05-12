"""
ForenSOC Streamlit Web Interface
Main application entry point
"""

import streamlit as st
from streamlit_option_menu import option_menu
import requests
from datetime import datetime

# Page configuration
st.set_page_config(
    page_title="ForenSOC - Incident Investigation Platform",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS
st.markdown("""
<style>
    [data-testid="stSidebar"] {
        background-color: #1e1e2e;
    }
    .main {
        padding: 2rem;
    }
</style>
""", unsafe_allow_html=True)


# API configuration
API_URL = "http://localhost:8000/api"


def check_api_connection():
    """Check if API is running."""
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        return response.status_code == 200
    except:
        return False


# Sidebar navigation
with st.sidebar:
    st.title("🔍 ForenSOC")
    st.markdown("### Integrated SOC & Digital Forensics Platform")
    st.markdown("---")
    
    # Check API status
    api_status = check_api_connection()
    if api_status:
        st.success("✅ API Connected")
    else:
        st.error("❌ API Disconnected")
        st.info("Make sure the FastAPI backend is running on http://localhost:8000")
    
    st.markdown("---")
    
    # Navigation menu
    selected = option_menu(
        menu_title="Navigation",
        options=[
            "Dashboard",
            "Logs",
            "Alerts",
            "Cases",
            "Evidence",
            "Network Forensics",
            "Memory Forensics",
            "File Forensics",
            "Browser Forensics",
            "Timeline",
            "Reports",
            "Settings",
        ],
        icons=[
            "speedometer2",
            "file-text",
            "exclamation-triangle",
            "folder",
            "lock",
            "globe",
            "cpu",
            "file",
            "chrome",
            "hourglass",
            "file-pdf",
            "gear",
        ],
        menu_icon="list",
        default_index=0,
    )
    
    st.markdown("---")
    st.caption("ForenSOC v1.0.0")


# Main content area
if not api_status:
    st.error("### ⚠️ API Connection Failed")
    st.write("""
    The ForenSOC backend API is not responding. Please ensure that:
    
    1. The FastAPI backend is running:
       ```bash
       cd backend
       python -m uvicorn app.main:app --reload
       ```
    
    2. The backend is accessible at: http://localhost:8000
    3. Check the backend logs for any errors
    """)
else:
    # Route to selected page
    if selected == "Dashboard":
        st.title("📊 Dashboard")
        st.info("Dashboard page coming soon...")
        
        # Placeholder metrics
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Alerts", 142)
        with col2:
            st.metric("Open Cases", 12)
        with col3:
            st.metric("Evidence Files", 89)
        with col4:
            st.metric("Critical Alerts", 3)
    
    elif selected == "Logs":
        st.title("📝 Log Explorer")
        st.info("Log explorer page coming soon...")
    
    elif selected == "Alerts":
        st.title("⚠️ Alerts")
        st.info("Alerts management page coming soon...")
    
    elif selected == "Cases":
        st.title("📁 Cases")
        st.info("Cases management page coming soon...")
    
    elif selected == "Evidence":
        st.title("🔐 Evidence Vault")
        st.info("Evidence vault page coming soon...")
    
    elif selected == "Network Forensics":
        st.title("🌐 Network Forensics")
        st.info("Network forensics page coming soon...")
    
    elif selected == "Memory Forensics":
        st.title("💾 Memory Forensics")
        st.info("Memory forensics page coming soon...")
    
    elif selected == "File Forensics":
        st.title("📂 File System Forensics")
        st.info("File forensics page coming soon...")
    
    elif selected == "Browser Forensics":
        st.title("🌍 Browser Forensics")
        st.info("Browser forensics page coming soon...")
    
    elif selected == "Timeline":
        st.title("⏱️ Timeline")
        st.info("Timeline reconstruction page coming soon...")
    
    elif selected == "Reports":
        st.title("📄 Reports")
        st.info("Report generation page coming soon...")
    
    elif selected == "Settings":
        st.title("⚙️ Settings")
        st.info("Settings page coming soon...")
