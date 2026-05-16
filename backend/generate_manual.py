from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER

def generate_student_manual():
    doc = SimpleDocTemplate("ForenSOC_Students_Guide.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#2C3E50"),
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    sub_title_style = ParagraphStyle(
        'SubTitleStyle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.grey,
        alignment=TA_CENTER,
        spaceAfter=30
    )
    
    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor("#2980B9"),
        spaceBefore=20,
        spaceAfter=10
    )
    
    body_style = styles['Normal']
    body_style.fontSize = 11
    body_style.leading = 14

    content = []

    # Title Section
    content.append(Paragraph("🛡️ ForenSOC: The Student's Guide", title_style))
    content.append(Paragraph("Advanced Cybersecurity & Digital Forensics Made Simple", sub_title_style))
    content.append(Spacer(1, 12))

    # Introduction
    content.append(Paragraph("1. What is ForenSOC?", heading_style))
    content.append(Paragraph(
        "Think of ForenSOC as a <b>Super-Powered Digital Detective Agency</b>. "
        "In the digital world, hackers leave 'footprints' in files called Logs. "
        "ForenSOC is the tool that automatically finds those footprints, analyzes them, and tells you exactly what happened.",
        body_style
    ))

    # Core Features
    content.append(Paragraph("2. Cool Features You Can Use", heading_style))
    features = [
        ["Feature", "Simple Explanation"],
        ["Live Collector", "Automatically watches your own PC for threats while you work."],
        ["Auto-Ingest", "A 'Magic Folder' where you drop log files for instant analysis."],
        ["Smart Analyst", "Explains scary technical alerts in plain English."],
        ["Forensic Vault", "Securely saves evidence like a police locker."],
        ["Incident Timeline", "A storybook view of exactly when an attack happened."]
    ]
    
    t = Table(features, colWidths=[120, 330])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#34495E")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#ECF0F1")),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    content.append(t)

    # How to use it
    content.append(Paragraph("3. How to Use It (Step-by-Step)", heading_style))
    steps = [
        "<b>Step 1: Start the Engines.</b> Double-click the <i>run-forensoc.bat</i> file. Three windows will open. Don't close them!",
        "<b>Step 2: Log In.</b> Open your browser to <i>http://localhost:3000</i>. Use 'admin' for both username and password.",
        "<b>Step 3: Watch the Live Feed.</b> Your computer is already sending data! Go to the <i>Timeline</i> tab to see your PC's activity.",
        "<b>Step 4: Test the Magic.</b> Drag any log file into the <i>backend/ingest_drop/</i> folder and watch the Dashboard update instantly.",
        "<b>Step 5: Get the Proof.</b> Click <i>Generate Report</i> to get a professional PDF file of your findings."
    ]
    for step in steps:
        content.append(Paragraph(f"• {step}", body_style))
        content.append(Spacer(1, 6))

    # Cross Platform
    content.append(Paragraph("4. Using It Anywhere", heading_style))
    content.append(Paragraph(
        "<b>On Windows:</b> Use the .bat file. It handles everything for you automatically.<br/><br/>"
        "<b>On Linux/Mac:</b> Use the terminal. Run <i>uvicorn app.main:app</i> for the backend and <i>npm run dev</i> for the frontend.<br/><br/>"
        "<b>In Virtual Machines (VMs):</b> Simply enable 'Shared Folders' and drop any logs from your VM into the <i>ingest_drop</i> folder on your main PC.",
        body_style
    ))

    # Closing
    content.append(Spacer(1, 30))
    content.append(Paragraph("<i>Welcome to the world of Digital Forensics. Happy Investigating!</i>", sub_title_style))

    doc.build(content)
    print("PDF Manual Generated: ForenSOC_Students_Guide.pdf")

if __name__ == "__main__":
    generate_student_manual()
