import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_patient_pdf(
    patient_name: str,
    age: str,
    gender: str,
    phone: str,
    location: str,
    token_number: str,
    raw_complaint: str,
    language: str,
    chief_complaint: str,
    symptoms: list[str],
    duration: str,
    medicines: list[str],
    conditions: list[str],
    allergies: list[str],
    missing: list[str],
    is_emergency: bool = False,
    emergency_reason: str = None
) -> io.BytesIO:
    """
    Generates a professional A4 clinical patient intake PDF using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        textColor=colors.HexColor('#1e3a8a'),
        leading=18
    )

    subtitle_style = ParagraphStyle(
        'HeaderSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#475569'),
        leading=12
    )

    token_style = ParagraphStyle(
        'TokenTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=colors.HexColor('#1e3a8a'),
        alignment=2
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=colors.HexColor('#1e3a8a'),
        leading=14,
        spaceAfter=4
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.HexColor('#0f172a'),
        leading=12
    )

    body_text = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#334155'),
        leading=12
    )

    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        textColor=colors.HexColor('#64748b'),
        alignment=1,
        leading=10
    )

    elements = []

    # 1. Header Banner Table
    header_data = [
        [
            Paragraph("<b>SEVASAAR AI • PATIENT INTAKE REPORT</b>", title_style),
            Paragraph(f"<b>Token: {token_number}</b>", token_style)
        ],
        [
            Paragraph("Multilingual Triage Assistant • Hospital OPD Intake Console", subtitle_style),
            Paragraph(f"Date: {datetime.now().strftime('%d-%b-%Y %I:%M %p')}", ParagraphStyle('DateText', parent=subtitle_style, alignment=2))
        ]
    ]
    t_header = Table(header_data, colWidths=[380, 160])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    elements.append(t_header)
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1e3a8a'), spaceAfter=10))

    # 2. Emergency Alert (if emergency)
    if is_emergency:
        alert_data = [
            [
                Paragraph("<b>⚠️ CRITICAL EMERGENCY TRIAGE ALERT</b>", ParagraphStyle('AlertH', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#991b1b'))),
            ],
            [
                Paragraph(f"<b>Indicator:</b> {emergency_reason or 'Immediate Medical Attention Recommended'}", ParagraphStyle('AlertB', fontName='Helvetica', fontSize=8.5, textColor=colors.HexColor('#b91c1c')))
            ]
        ]
        t_alert = Table(alert_data, colWidths=[540])
        t_alert.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fef2f2')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#ef4444')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(t_alert)
        elements.append(Spacer(1, 10))

    # 3. Patient Demographics Box
    demo_data = [
        [
            Paragraph("<b>Patient Name:</b>", body_bold),
            Paragraph(patient_name or "Anonymous", body_text),
            Paragraph("<b>Age / Gender:</b>", body_bold),
            Paragraph(f"{age} yrs / {gender}", body_text)
        ],
        [
            Paragraph("<b>Phone:</b>", body_bold),
            Paragraph(phone or "N/A", body_text),
            Paragraph("<b>Location:</b>", body_bold),
            Paragraph(location or "N/A", body_text)
        ]
    ]
    t_demo = Table(demo_data, colWidths=[85, 185, 85, 185])
    t_demo.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_demo)
    elements.append(Spacer(1, 10))

    # 4. Original Patient Input
    elements.append(Paragraph(f"Original Patient Description ({language.upper()})", section_heading))
    clean_raw = (raw_complaint or "None recorded").replace("\n", " ")[:250]
    p_raw = Paragraph(f'<i>"{clean_raw}"</i>', body_text)
    t_raw = Table([[p_raw]], colWidths=[540])
    t_raw.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_raw)
    elements.append(Spacer(1, 10))

    # 5. AI Structured Clinical Summary
    elements.append(Paragraph("AI Structured Clinical Summary (Gemma AI)", section_heading))
    summary_table_data = [
        [Paragraph("<b>Chief Complaint:</b>", body_bold), Paragraph(chief_complaint or "Not provided", body_text)],
        [Paragraph("<b>Symptoms:</b>", body_bold), Paragraph(", ".join(symptoms) if symptoms else "None", body_text)],
        [Paragraph("<b>Duration:</b>", body_bold), Paragraph(duration or "Unspecified", body_text)],
        [Paragraph("<b>Current Medicines:</b>", body_bold), Paragraph(", ".join(medicines) if medicines else "None reported", body_text)],
        [Paragraph("<b>Existing Conditions:</b>", body_bold), Paragraph(", ".join(conditions) if conditions else "None reported", body_text)],
        [Paragraph("<b>Known Allergies:</b>", body_bold), Paragraph(", ".join(allergies) if allergies else "None reported", body_text)]
    ]
    t_summary = Table(summary_table_data, colWidths=[130, 410])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ffffff')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 10))

    # 6. Missing Clinical Information Highlight
    if missing:
        missing_text = " • ".join(missing)
        missing_data = [
            [Paragraph("<b>MISSING CLINICAL INFORMATION (Doctor Alert):</b>", ParagraphStyle('MH', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#92400e')))],
            [Paragraph(f"• {missing_text}", ParagraphStyle('MB', fontName='Helvetica', fontSize=8.5, textColor=colors.HexColor('#78350f')))]
        ]
        t_missing = Table(missing_data, colWidths=[540])
        t_missing.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fef3c7')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#f59e0b')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(t_missing)
        elements.append(Spacer(1, 15))

    # 7. Responsible AI Notice & Disclaimer
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceAfter=8))
    elements.append(Paragraph(
        "<b>RESPONSIBLE AI NOTICE:</b> Generated by SevaSaar AI to assist healthcare staff. "
        "Does NOT provide medical diagnosis, treatment recommendations, or prescriptions. "
        "All clinical actions remain strictly the responsibility of the attending medical officer.",
        disclaimer_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer

