"""
Report model for ForenSOC incident reporting.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, BigInteger, Boolean, func, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Report(BaseModel):
    """Generated incident investigation report."""
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_number = Column(String(50), unique=True, nullable=False, index=True)  # 'RPT-001', 'RPT-002', etc.
    
    # Case association
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False, index=True)
    
    # Report info
    report_type = Column(String(50), default="Incident Report")  # 'Incident Report', 'Forensic Analysis', 'Timeline Report', etc.
    title = Column(String(255), nullable=False)
    
    # File information
    file_path = Column(Text, nullable=False)
    file_size = Column(BigInteger)
    file_hash = Column(String(64))
    
    # Generation info
    generated_at = Column(DateTime, server_default=func.now(), nullable=False)
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    report_date = Column(DateTime)
    
    # Status
    status = Column(String(50), default="Generated")  # 'Generating', 'Generated', 'Reviewed', 'Finalized', 'Archived'
    is_confidential = Column(Boolean, default=False)
    
    # Content metadata
    included_sections = Column(JSON)  # Array of included report sections
    total_pages = Column(Integer)
    
    # Relationships
    case = relationship("Case", back_populates="reports")
    generator = relationship("User", foreign_keys=[generated_by], back_populates="generated_reports")
    
    def __repr__(self):
        return f"<Report {self.report_number}: {self.title}>"
