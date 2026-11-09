import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.safety.emergency_rules import check_emergency_rules

def test_chest_pain_and_breathing_emergency_english():
    result = check_emergency_rules(
        raw_text="I have severe chest pain and shortness of breath since morning",
        symptoms=["Chest Pain", "Breathing Difficulty"]
    )
    assert result.isEmergency is True
    assert result.priority == "IMMEDIATE"
    assert any("Chest Pain" in r for r in result.matchedRules)

def test_chest_pain_emergency_gujarati():
    result = check_emergency_rules(
        raw_text="છેલ્લા ૨ દિવસથી છાતીમાં સખત દુખાવો થાય છે અને શ્વાસ ચડે છે",
        symptoms=[]
    )
    assert result.isEmergency is True
    assert result.priority == "IMMEDIATE"

def test_heavy_bleeding_emergency_hindi():
    result = check_emergency_rules(
        raw_text="मरीज को बहुत भारी खून बह रहा है और खून की उल्टी हो रही है",
        symptoms=["Vomiting"]
    )
    assert result.isEmergency is True
    assert result.priority == "IMMEDIATE"

def test_loss_of_consciousness_hinglish():
    result = check_emergency_rules(
        raw_text="Patient achanak behosh ho gaya aur gir gaya",
        symptoms=[]
    )
    assert result.isEmergency is True
    assert result.priority == "IMMEDIATE"

def test_stroke_indicators():
    result = check_emergency_rules(
        raw_text="Sudden facial drooping and arm weakness with slurred speech",
        symptoms=["Arm Weakness"]
    )
    assert result.isEmergency is True

def test_non_emergency_routine_complaint():
    result = check_emergency_rules(
        raw_text="I have mild cold and runny nose for two days with occasional sneeze and mild throat scratchiness",
        symptoms=["Runny Nose", "Sneezing"]
    )
    assert result.isEmergency is False
    assert result.priority == "ROUTINE"
