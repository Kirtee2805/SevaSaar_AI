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
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_patients(db)
    finally:
        db.close()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_detect_language_api():
    response = client.post("/api/detect-language", json={"text": "મને તાવ આવ્યો છે"})
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "gu"
    assert data["bcp47"] == "gu-IN"

def test_list_patients_api():
    response = client.get("/api/patients")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total"] >= 4
    # Check that emergency patient is sorted first
    first_patient = data["data"][0]
    assert first_patient["status"] == "Emergency"

def test_create_and_retrieve_patient():
    new_patient_payload = {
        "language": "hi",
        "details": {
            "name": "Rohan Verma",
            "age": 28,
            "gender": "Male",
            "phone": "+91 91234 56789",
            "location": "Lucknow"
        },
        "rawComplaint": "गले में खराश और तेज खांसी है 3 दिनों से",
        "summary": {
            "chiefComplaint": "Sore throat and acute cough for 3 days",
            "symptoms": ["Sore Throat", "Cough"],
            "duration": "3 Days",
            "medicines": ["Cough syrup"],
            "conditions": [],
            "allergies": [],
            "missing": ["Fever record"],
            "emergency": False,
            "emergencyReason": None
        }
    }
    create_res = client.post("/api/patient", json=new_patient_payload)
    assert create_res.status_code == 200
    create_data = create_res.json()
    assert create_data["success"] is True
    created_id = create_data["data"]["id"]
    token = create_data["data"]["tokenNumber"]
    assert token.startswith("SEVA-")

    # Retrieve patient by token
    get_res = client.get(f"/api/patient/{token}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["details"]["name"] == "Rohan Verma"

def test_save_summary_api():
    # First get a patient
    res = client.get("/api/patients")
    first_patient = res.json()["data"][0]
    patient_id = first_patient["id"]

    update_payload = {
        "patientId": patient_id,
        "summary": {
            "chiefComplaint": "Updated Chief Complaint for testing"
        },
        "notes": "Doctor examined patient. Prescribed rest."
    }
    save_res = client.post("/api/save-summary", json=update_payload)
    assert save_res.status_code == 200
    data = save_res.json()
    assert data["success"] is True
    assert data["data"]["summary"]["chiefComplaint"] == "Updated Chief Complaint for testing"
    assert data["data"]["notes"] == "Doctor examined patient. Prescribed rest."

def test_receptionist_stats_api():
    response = client.get("/api/receptionist/stats")
    assert response.status_code == 200
    stats = response.json()["stats"]
    assert "total" in stats
    assert "waiting" in stats
    assert "emergency" in stats
    assert "completed" in stats

