import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import engine, Base, SessionLocal
from app.database.seed_data import seed_initial_patients

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_patients(db)
    finally:
        db.close()

def test_full_patient_intake_and_doctor_lifecycle():
    # 1. Patient writes or speaks complaint in Gujarati
    raw_complaint = "છેલ્લા 3 દિવસથી સખત તાવ આવે છે, માથું દુખે છે અને શરદી છે. પેરાસિટામોલ લીધી હતી."
    
    # 2. Call /api/detect-language
    lang_res = client.post("/api/detect-language", json={"text": raw_complaint})
    assert lang_res.status_code == 200
    assert lang_res.json()["language"] == "gu"
    assert lang_res.json()["bcp47"] == "gu-IN"

    # 3. Call /api/generate-summary
    summary_res = client.post("/api/generate-summary", json={
        "language": "gu",
        "rawComplaint": raw_complaint
    })
    assert summary_res.status_code == 200
    summary_data = summary_res.json()["data"]
    assert "chiefComplaint" in summary_data
    assert len(summary_data["symptoms"]) > 0
    assert summary_data["emergency"] is False # fever is not emergency

    # 4. Patient registers intake via /api/patient
    intake_payload = {
        "language": "gu",
        "details": {
            "name": "Bhavikbhai Patel",
            "age": 42,
            "gender": "Male",
            "phone": "+91 98980 11223",
            "location": "Nadiad, Gujarat"
        },
        "rawComplaint": raw_complaint,
        "summary": {
            "chiefComplaint": summary_data["chiefComplaint"],
            "symptoms": summary_data["symptoms"],
            "duration": summary_data["duration"],
            "medicines": summary_data["currentMedicines"],
            "conditions": summary_data["existingConditions"],
            "allergies": summary_data["knownAllergies"],
            "missing": summary_data["missingInformation"],
            "emergency": False,
            "emergencyReason": None
        }
    }
    create_res = client.post("/api/patient", json=intake_payload)
    assert create_res.status_code == 200
    created = create_res.json()["data"]
    token = created["tokenNumber"]
    patient_id = created["id"]
    assert token.startswith("SEVA-")
    assert created["status"] == "Waiting"

    # 5. Receptionist views patient in queue
    queue_res = client.get("/api/patients?status=Waiting")
    assert queue_res.status_code == 200
    queue_data = queue_res.json()["data"]
    assert any(p["id"] == patient_id for p in queue_data)

    # 6. Receptionist updates summary / correction
    receptionist_edit_res = client.post("/api/save-summary", json={
        "patientId": patient_id,
        "summary": {
            "chiefComplaint": "High fever with cephalalgia for 3 days"
        },
        "userRole": "receptionist"
    })
    assert receptionist_edit_res.status_code == 200
    assert receptionist_edit_res.json()["data"]["summary"]["chiefComplaint"] == "High fever with cephalalgia for 3 days"

    # 7. Doctor adds examination notes and marks consultation completed
    doctor_update_res = client.post("/api/save-summary", json={
        "patientId": patient_id,
        "status": "Completed",
        "notes": "Vitals: BP 120/80, Temp 101F, SpO2 98%. Advised Tab Paracetamol 650mg TDS x 3 days. Ample fluids.",
        "userRole": "doctor"
    })
    assert doctor_update_res.status_code == 200
    assert doctor_update_res.json()["data"]["status"] == "Completed"
    assert "Tab Paracetamol" in doctor_update_res.json()["data"]["notes"]

    # 8. Doctor exports clinical PDF report
    pdf_res = client.get(f"/api/patient/{token}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000  # Valid non-empty PDF binary
    assert pdf_res.content.startswith(b"%PDF")
