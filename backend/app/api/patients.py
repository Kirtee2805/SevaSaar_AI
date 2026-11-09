import json
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database.connection import get_db
from app.database.models import Patient
from app.schemas.patient import CreatePatientRequest

router = APIRouter(prefix="/api", tags=["Patients"])

@router.post("/patient")
def create_patient(payload: CreatePatientRequest, db: Session = Depends(get_db)):
    try:
        # Generate token number
        count = db.query(Patient).count()
        token_seq = str(count + 1).zfill(3)
        token_number = f"SEVA-{token_seq}"
        patient_id = f"pat-{int(datetime.now(timezone.utc).timestamp() * 1000)}"

        is_emergency = bool(payload.summary.emergency)
        status = "Emergency" if is_emergency else "Waiting"
        assigned_doctor = "Triage Specialist / On-call Medical Officer" if is_emergency else "General OPD Doctor"

        new_patient = Patient(
            id=patient_id,
            token_number=token_number,
            created_at=datetime.now(timezone.utc),
            language=payload.language,
            name=payload.details.name,
            age=str(payload.details.age),
            gender=payload.details.gender,
            phone=payload.details.phone,
            location=payload.details.location,
            raw_complaint=payload.rawComplaint,
            chief_complaint=payload.summary.chiefComplaint,
            symptoms_json=json.dumps(payload.summary.symptoms, ensure_ascii=False),
            duration=payload.summary.duration,
            medicines_json=json.dumps(payload.summary.medicines, ensure_ascii=False),
            conditions_json=json.dumps(payload.summary.conditions, ensure_ascii=False),
            allergies_json=json.dumps(payload.summary.allergies, ensure_ascii=False),
            missing_json=json.dumps(payload.summary.missing, ensure_ascii=False),
            emergency=is_emergency,
            emergency_reason=payload.summary.emergencyReason,
            status=status,
            assigned_doctor=assigned_doctor
        )

        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)

        return {
            "success": True,
            "message": "Patient intake registered successfully",
            "data": new_patient.to_dict()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to register patient: {str(e)}")

@router.get("/patients")
def list_patients(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Patient)

        if status and status.lower() != "all":
            query = query.filter(Patient.status.ilike(status))

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Patient.name.ilike(search_term),
                    Patient.token_number.ilike(search_term),
                    Patient.phone.ilike(search_term),
                    Patient.chief_complaint.ilike(search_term),
                    Patient.location.ilike(search_term)
                )
            )

        patients = query.order_by(desc(Patient.created_at)).all()
        result_list = [p.to_dict() for p in patients]

        # Prioritize: Emergency first, then Waiting, then Completed
        def sort_priority(item):
            s = item.get("status", "")
            if s == "Emergency":
                return 0
            if s == "Waiting":
                return 1
            return 2

        result_list.sort(key=sort_priority)

        return {
            "success": True,
            "total": len(result_list),
            "data": result_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve patients: {str(e)}")

@router.get("/patient/{id_or_token}")
def get_patient(id_or_token: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        or_(Patient.id == id_or_token, Patient.token_number == id_or_token)
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    return {
        "success": True,
        "data": patient.to_dict()
    }

