import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.database.models import Patient

INITIAL_PATIENTS = [
    {
        "id": "pat-101",
        "token_number": "SEVA-001",
        "created_at": datetime.now(timezone.utc) - timedelta(minutes=30),
        "language": "gu",
        "name": "Rameshbhai Patel",
        "age": "58",
        "gender": "Male",
        "phone": "+91 98765 43210",
        "location": "Anand, Gujarat",
        "raw_complaint": "છેલ્લા ૨ દિવસથી છાતીમાં સખત દુખાવો થાય છે અને શ્વાસ લેવામાં પણ તકલીફ પડે છે. થોડું ચાલવાથી પણ શ્વાસ ચડી જાય છે. અગાઉ હાઈ બીપી ની દવા ચાલતી હતી પર્વત માં બંધ કરી દીધી છે.",
        "chief_complaint": "Chest pain & severe shortness of breath for 2 days",
        "symptoms": ["Chest Pain", "Breathing Difficulty", "Exertional Dyspnea", "Fatigue"],
        "duration": "2 Days",
        "medicines": ["Amlodipine 5mg (discontinued)"],
        "conditions": ["Hypertension (High BP)"],
        "allergies": ["No known drug allergies"],
        "missing": ["Recent ECG / Blood Pressure readings", "Diabetes status"],
        "emergency": True,
        "emergency_reason": "Chest Pain with Breathing Difficulty / Shortness of Breath",
        "status": "Emergency",
        "notes": "Patient escorted directly to Triage Bay 1.",
        "assigned_doctor": "Dr. A. Sharma (Cardiology)"
    },
    {
        "id": "pat-102",
        "token_number": "SEVA-002",
        "created_at": datetime.now(timezone.utc) - timedelta(minutes=45),
        "language": "hi",
        "name": "Sunita Sharma",
        "age": "34",
        "gender": "Female",
        "phone": "+91 98123 76543",
        "location": "Jaipur, Rajasthan",
        "raw_complaint": "मुझे पिछले 4 दिनों से तेज बुखार है, साथ में सिरदर्द और गले में खराश है। पेट में भी हल्का दर्द रहता है और खाने का मन नहीं करता। Paracetamol ली थी पर आराम नहीं मिला।",
        "chief_complaint": "High grade fever with sore throat and headache for 4 days",
        "symptoms": ["High Fever", "Headache", "Sore Throat", "Mild Abdominal Pain", "Anorexia"],
        "duration": "4 Days",
        "medicines": ["Paracetamol 650mg (Self-prescribed)"],
        "conditions": ["None reported"],
        "allergies": ["Sulfonamides"],
        "missing": ["Exact body temperature log", "CBC / Dengue / Typhoid test reports"],
        "emergency": False,
        "emergency_reason": None,
        "status": "Waiting",
        "notes": None,
        "assigned_doctor": "Dr. V. Mehta (General Medicine)"
    },
    {
        "id": "pat-103",
        "token_number": "SEVA-003",
        "created_at": datetime.now(timezone.utc) - timedelta(minutes=15),
        "language": "mixed",
        "name": "Pribhu Singh",
        "age": "62",
        "gender": "Male",
        "phone": "+91 97234 56789",
        "location": "Vadodara, Gujarat",
        "raw_complaint": "Sir 3 days se right leg me severe swelling and severe pain chalu hua hai. Diabetes hai mereko for 10 years. Metformin tablet daily leta hu.",
        "chief_complaint": "Right leg swelling and acute pain for 3 days",
        "symptoms": ["Right Leg Swelling", "Acute Leg Pain", "Localized Inflammation"],
        "duration": "3 Days",
        "medicines": ["Metformin 500mg daily"],
        "conditions": ["Type 2 Diabetes Mellitus (10 years)"],
        "allergies": ["Penicillin"],
        "missing": ["Fasting / PP Blood Glucose level", "Peripheral arterial Doppler test"],
        "emergency": False,
        "emergency_reason": None,
        "status": "Waiting",
        "notes": None,
        "assigned_doctor": "Dr. S. Kulkarni (Diabetology)"
    },
    {
        "id": "pat-104",
        "token_number": "SEVA-004",
        "created_at": datetime.now(timezone.utc) - timedelta(minutes=90),
        "language": "en",
        "name": "Anita Desai",
        "age": "29",
        "gender": "Female",
        "phone": "+91 99090 12345",
        "location": "Ahmedabad, Gujarat",
        "raw_complaint": "Persistent migraine headache for 2 weeks, worsening in bright sunlight. Mild nausea in the morning. No fever or vomiting.",
        "chief_complaint": "Chronic migraine headache with photophobia for 2 weeks",
        "symptoms": ["Migraine Headache", "Photophobia", "Morning Nausea"],
        "duration": "2 Weeks",
        "medicines": ["Naproxen as needed"],
        "conditions": ["History of episodic migraine"],
        "allergies": ["Aspirin"],
        "missing": ["Vision / Ophthalmic examination", "Blood pressure measurement"],
        "emergency": False,
        "emergency_reason": None,
        "status": "Completed",
        "notes": "Prescription issued. Advised follow-up after 7 days.",
        "assigned_doctor": "Dr. R. Joshi (Neurology)"
    }
]

def seed_initial_patients(db: Session):
    existing_count = db.query(Patient).count()
    if existing_count > 0:
        return

    for item in INITIAL_PATIENTS:
        patient = Patient(
            id=item["id"],
            token_number=item["token_number"],
            created_at=item["created_at"],
            language=item["language"],
            name=item["name"],
            age=item["age"],
            gender=item["gender"],
            phone=item["phone"],
            location=item["location"],
            raw_complaint=item["raw_complaint"],
            chief_complaint=item["chief_complaint"],
            symptoms_json=json.dumps(item["symptoms"], ensure_ascii=False),
            duration=item["duration"],
            medicines_json=json.dumps(item["medicines"], ensure_ascii=False),
            conditions_json=json.dumps(item["conditions"], ensure_ascii=False),
            allergies_json=json.dumps(item["allergies"], ensure_ascii=False),
            missing_json=json.dumps(item["missing"], ensure_ascii=False),
            emergency=item["emergency"],
            emergency_reason=item["emergency_reason"],
            status=item["status"],
            notes=item["notes"],
            assigned_doctor=item["assigned_doctor"]
        )
        db.add(patient)

    db.commit()
