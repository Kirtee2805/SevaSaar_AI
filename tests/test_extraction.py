import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.services.extraction_service import extract_patient_summary

@pytest.mark.asyncio
async def test_extract_patient_summary_offline_fallback():
    raw_complaint = "Patient has severe headache and fever for 3 days. Takes paracetamol daily."
    result = await extract_patient_summary(raw_complaint, "en")

    assert result["success"] is True
    data = result["data"]
    assert "Fever" in data["symptoms"] or "Headache" in data["symptoms"]
    assert "3 Days" in data["duration"]
    assert "paracetamol" in str(data["currentMedicines"]).lower()
    assert isinstance(data["missingInformation"], list)
    assert len(data["missingInformation"]) > 0

@pytest.mark.asyncio
async def test_extract_patient_summary_emergency_trigger():
    raw_complaint = "સખત છાતીમાં દુખાવો છે અને શ્વાસ લેવામાં તકલીફ પડે છે છેલ્લા 2 દિવસથી"
    result = await extract_patient_summary(raw_complaint, "gu")

    assert result["success"] is True
    data = result["data"]
    assert data["emergency"] is True
    assert data["emergencyReason"] is not None
    assert result["emergencyRuleCheck"]["isEmergency"] is True

