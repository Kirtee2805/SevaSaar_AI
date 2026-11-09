import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.connection import get_db
from app.database.models import Patient
from app.schemas.patient import SaveSummaryRequest
from app.utils.pdf_generator import generate_patient_pdf

router = APIRouter(prefix="/api", tags=["Doctor & Clinical Workflows"])

@router.post("/save-summary")
def save_summary(payload: SaveSummaryRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == payload.patientId).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    try:
        if payload.summary:
            s = payload.summary
            if "chiefComplaint" in s and s["chiefComplaint"] is not None:
                patient.chief_complaint = s["chiefComplaint"]
            if "symptoms" in s and s["symptoms"] is not None:
                patient.symptoms = s["symptoms"]
            if "duration" in s and s["duration"] is not None:
                patient.duration = s["duration"]
            if "medicines" in s and s["medicines"] is not None:
                patient.medicines = s["medicines"]
            if "conditions" in s and s["conditions"] is not None:
                patient.conditions = s["conditions"]
            if "allergies" in s and s["allergies"] is not None:
                patient.allergies = s["allergies"]
            if "missing" in s and s["missing"] is not None:
                patient.missing = s["missing"]
            if "emergency" in s and s["emergency"] is not None:
                patient.emergency = bool(s["emergency"])
            if "emergencyReason" in s:
                patient.emergency_reason = s["emergencyReason"]

        if payload.status:
            patient.status = payload.status

        if payload.notes is not None:
            patient.notes = payload.notes

        db.commit()
        db.refresh(patient)

        return {
            "success": True,
            "message": "Medical summary updated successfully",
            "data": patient.to_dict()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update summary: {str(e)}")

@router.get("/patient/{id_or_token}/pdf")
def export_patient_pdf(id_or_token: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        or_(Patient.id == id_or_token, Patient.token_number == id_or_token)
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    pdf_buffer = generate_patient_pdf(
        patient_name=patient.name,
        age=patient.age,
        gender=patient.gender,
        phone=patient.phone,
        location=patient.location,
        token_number=patient.token_number,
        raw_complaint=patient.raw_complaint,
        language=patient.language,
        chief_complaint=patient.chief_complaint,
        symptoms=patient.symptoms,
        duration=patient.duration,
        medicines=patient.medicines,
        conditions=patient.conditions,
        allergies=patient.allergies,
        missing=patient.missing,
        is_emergency=patient.emergency,
        emergency_reason=patient.emergency_reason
    )

    filename = f"SevaSaar_Intake_{patient.name.replace(' ', '_')}_{patient.token_number}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

