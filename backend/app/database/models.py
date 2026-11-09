import json
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text
from app.database.connection import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(64), primary_key=True, default=lambda: f"pat-{int(datetime.now(timezone.utc).timestamp() * 1000)}")
    token_number = Column(String(32), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    language = Column(String(16), nullable=False, default="en")

    # Demographics
    name = Column(String(128), nullable=False)
    age = Column(String(16), nullable=False)
    gender = Column(String(32), nullable=False)
    phone = Column(String(32), nullable=False)
    location = Column(String(128), nullable=False)

    # Complaint & Extracted Clinical Summary
    raw_complaint = Column(Text, nullable=False)
    chief_complaint = Column(Text, nullable=False)
    symptoms_json = Column(Text, nullable=False, default="[]")
    duration = Column(String(64), nullable=False, default="Unspecified")
    medicines_json = Column(Text, nullable=False, default="[]")
    conditions_json = Column(Text, nullable=False, default="[]")
    allergies_json = Column(Text, nullable=False, default="[]")
    missing_json = Column(Text, nullable=False, default="[]")

    # Emergency Indicators
    emergency = Column(Boolean, default=False, nullable=False)
    emergency_reason = Column(Text, nullable=True)

    # OPD Status & Clinical Documentation
    status = Column(String(32), default="Waiting", nullable=False) # Waiting, Completed, Emergency
    notes = Column(Text, nullable=True)
    assigned_doctor = Column(String(128), nullable=True)

    # Convenience properties to convert JSON strings <-> lists
    @property
    def symptoms(self) -> list[str]:
        try:
            return json.loads(self.symptoms_json or "[]")
        except Exception:
            return []

    @symptoms.setter
    def symptoms(self, val: list[str]):
        self.symptoms_json = json.dumps(val or [], ensure_ascii=False)

    @property
    def medicines(self) -> list[str]:
        try:
            return json.loads(self.medicines_json or "[]")
        except Exception:
            return []

    @medicines.setter
    def medicines(self, val: list[str]):
        self.medicines_json = json.dumps(val or [], ensure_ascii=False)

    @property
    def conditions(self) -> list[str]:
        try:
            return json.loads(self.conditions_json or "[]")
        except Exception:
            return []

    @conditions.setter
    def conditions(self, val: list[str]):
        self.conditions_json = json.dumps(val or [], ensure_ascii=False)

    @property
    def allergies(self) -> list[str]:
        try:
            return json.loads(self.allergies_json or "[]")
        except Exception:
            return []

    @allergies.setter
    def allergies(self, val: list[str]):
        self.allergies_json = json.dumps(val or [], ensure_ascii=False)

    @property
    def missing(self) -> list[str]:
        try:
            return json.loads(self.missing_json or "[]")
        except Exception:
            return []

    @missing.setter
    def missing(self, val: list[str]):
        self.missing_json = json.dumps(val or [], ensure_ascii=False)

    def to_dict(self):
        return {
            "id": self.id,
            "tokenNumber": self.token_number,
            "createdAt": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat(),
            "language": self.language,
            "details": {
                "name": self.name,
                "age": self.age,
                "gender": self.gender,
                "phone": self.phone,
                "location": self.location
            },
            "rawComplaint": self.raw_complaint,
            "summary": {
                "chiefComplaint": self.chief_complaint,
                "symptoms": self.symptoms,
                "duration": self.duration,
                "medicines": self.medicines,
                "conditions": self.conditions,
                "allergies": self.allergies,
                "missing": self.missing,
                "emergency": self.emergency,
                "emergencyReason": self.emergency_reason
            },
            "status": self.status,
            "notes": self.notes,
            "assignedDoctor": self.assigned_doctor
        }
