from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Patient

router = APIRouter(prefix="/api/receptionist", tags=["Receptionist"])

@router.get("/stats")
def get_receptionist_stats(db: Session = Depends(get_db)):
    total = db.query(Patient).count()
    waiting = db.query(Patient).filter(Patient.status == "Waiting").count()
    emergency = db.query(Patient).filter(Patient.status == "Emergency").count()
    completed = db.query(Patient).filter(Patient.status == "Completed").count()

    return {
        "success": True,
        "stats": {
            "total": total,
            "waiting": waiting,
            "emergency": emergency,
            "completed": completed
        }
    }

