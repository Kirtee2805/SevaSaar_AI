import json
import logging
import re
from typing import Optional, Dict, Any
from app.config import settings
from app.chains.patient_intake_chain import get_intake_prompt_template
from app.schemas.summary import MedicalSummarySchema
from app.services.language_service import detect_language

logger = logging.getLogger("gemma_service")

FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemma-2-9b-it"
]

def generate_heuristic_fallback(raw_complaint: str, language: str) -> Dict[str, Any]:
    """
    Deterministic clinical fact extractor for offline / unconfigured API scenarios.
    Ensures the hospital portal remains 100% functional without external network connectivity.
    """
    lower = raw_complaint.lower()

    # Detect symptoms
    symptoms = []
    if any(k in lower for k in ["chest pain", "छाती", "છાતી", "heart pain", "seene me dard"]):
        symptoms.append("Chest Pain")
    if any(k in lower for k in ["breath", "સાંસ", "सांस", "શ્વાસ", "shortness of breath"]):
        symptoms.append("Breathing Difficulty")
    if any(k in lower for k in ["fever", "તાવ", "बुखार", "temperature", "chills"]):
        symptoms.append("Fever")
    if any(k in lower for k in ["headache", "માથું", "सिरदर्द", "sir dard"]):
        symptoms.append("Headache")
    if any(k in lower for k in ["pain", "દુખાવો", "दर्द", "body pain", "swelling"]):
        symptoms.append("Localized Pain / Swelling")
    if any(k in lower for k in ["cough", "ઉધરસ", "खांसी", "khansi"]):
        symptoms.append("Cough")
    if any(k in lower for k in ["vomit", "उल्टी", "ઉલટી", "nausea"]):
        symptoms.append("Nausea / Vomiting")
    if any(k in lower for k in ["dizziness", "चक्कर", "ચક્કર"]):
        symptoms.append("Dizziness")

    if not symptoms:
        symptoms = ["Generalized Discomfort", "Fatigue"]

    # Detect duration
    duration = "Recent onset (1-3 days)"
    match_days = re.search(r"(\d+)\s*(day|days|दिन|દિવસ)", lower)
    if match_days:
        duration = f"{match_days.group(1)} Days"
    else:
        match_weeks = re.search(r"(\d+)\s*(week|weeks|हफ्ते|અઠવાડિયા)", lower)
        if match_weeks:
            duration = f"{match_weeks.group(1)} Weeks"

    # Detect medicines
    medicines = []
    if any(k in lower for k in ["paracetamol", "crocin", "dolo"]):
        medicines.append("Paracetamol (Over-the-counter)")
    if any(k in lower for k in ["bp", "amlodipine", "telmisartan"]):
        medicines.append("Antihypertensive medication")
    if any(k in lower for k in ["metformin", "sugar", "diabetes", "insulin"]):
        medicines.append("Oral Antidiabetic medication")
    if not medicines:
        medicines = ["None reported or unverified"]

    # Detect conditions
    conditions = []
    if any(k in lower for k in ["bp", "hypertension", "હાઈ બીપી"]):
        conditions.append("Hypertension")
    if any(k in lower for k in ["diabetes", "sugar", "ડાયાબિટીસ"]):
        conditions.append("Type 2 Diabetes")
    if any(k in lower for k in ["asthma", "અસ્થમા"]):
        conditions.append("Bronchial Asthma")
    if not conditions:
        conditions = ["No major chronic conditions disclosed"]

    # Missing clinical info
    missing = ["Vital Signs (BP, Heart Rate, SpO2, Temperature)"]
    if "Hypertension" not in conditions:
        missing.append("Blood pressure history")
    if "Type 2 Diabetes" not in conditions:
        missing.append("Diabetes / Blood sugar history")
    if "None reported or unverified" in medicines:
        missing.append("Exact list of active prescription medicines")

    chief_complaint = raw_complaint[:85] + "..." if len(raw_complaint) > 85 else raw_complaint

    return {
        "language": language,
        "chiefComplaint": chief_complaint,
        "symptoms": symptoms,
        "duration": duration,
        "severity": "Moderate",
        "existingConditions": conditions,
        "currentMedicines": medicines,
        "knownAllergies": ["Unspecified allergy status"],
        "missingInformation": missing,
        "normalizedComplaint": raw_complaint
    }

async def call_gemma_model(patient_description: str, patient_language: str) -> Optional[Dict[str, Any]]:
    """
    Invokes Google Gemma / Gemini API with LangChain prompt template.
    Falls back gracefully if API key is not present.
    """
    api_key = settings.GOOGLE_API_KEY
    if not api_key:
        logger.info("[GemmaService] No GOOGLE_API_KEY / GEMMA_API_KEY configured. Utilizing deterministic heuristic engine.")
        return None

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        prompt_template = get_intake_prompt_template()
        formatted_prompt = prompt_template.format(
            patient_language=patient_language,
            patient_description=patient_description
        )

        model_candidates = [settings.GEMMA_MODEL_NAME] + [m for m in FALLBACK_MODELS if m != settings.GEMMA_MODEL_NAME]

        for model_name in model_candidates:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=formatted_prompt,
                    config={
                        "temperature": 0.0,
                        "response_mime_type": "application/json"
                    }
                )

                if response.text and response.text.strip():
                    cleaned = re.sub(r"^```(?:json)?\s*", "", response.text.strip(), flags=re.IGNORECASE)
                    cleaned = re.sub(r"\s*```$", "", cleaned)
                    parsed = json.loads(cleaned)
                    parsed["_model_used"] = model_name
                    parsed["_is_fallback"] = False
                    return parsed
            except Exception as model_err:
                logger.warning(f"[GemmaService] Model {model_name} invocation failed: {model_err}")
                continue

    except Exception as err:
        logger.error(f"[GemmaService] General GenAI error: {err}")

    return None

