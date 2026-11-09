import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.services.language_service import detect_language, get_bcp47_tag
from app.services.normalization_service import normalize_text

def test_detect_gujarati_script():
    text = "મને ૨ દિવસથી તાવ અને માથાનો દુખાવો છે"
    lang = detect_language(text)
    assert lang == "gu"
    assert get_bcp47_tag(lang) == "gu-IN"

def test_detect_hindi_script():
    text = "मुझे पिछले तीन दिनों से बुखार और सिरदर्द है"
    lang = detect_language(text)
    assert lang == "hi"
    assert get_bcp47_tag(lang) == "hi-IN"

def test_detect_english():
    text = "I have had a high fever and sore throat for 3 days"
    lang = detect_language(text)
    assert lang == "en"
    assert get_bcp47_tag(lang) == "en-IN"

def test_detect_romanized_mixed():
    text = "Sir 2 days se severe headache and pet me dard hai"
    lang = detect_language(text)
    assert lang == "mixed"

def test_text_normalization():
    raw = "   Patient has   fever\n\n\n\nand   cough   "
    normalized = normalize_text(raw)
    assert "   " not in normalized
    assert normalized == "Patient has fever\n\nand cough"

