import re
from typing import List, Optional
from pydantic import BaseModel

class EmergencyRuleResult(BaseModel):
    isEmergency: bool
    matchedRules: List[str]
    priority: str  # 'IMMEDIATE', 'URGENT', 'ROUTINE'
    message: str

def check_emergency_rules(
    raw_text: str = "",
    symptoms: Optional[List[str]] = None,
    speech_transcript: str = ""
) -> EmergencyRuleResult:
    """
    Deterministic Multilingual Emergency Rule Engine.
    Operates independently of LLM / GenAI model.
    Matches across English, Hindi, Gujarati, and Hinglish.
    """
    if symptoms is None:
        symptoms = []

    text_to_eval = " ".join(filter(None, [raw_text, speech_transcript, " ".join(symptoms)])).lower()

    # Rule 1: Chest Pain
    has_chest_pain = bool(
        any(k in text_to_eval for k in [
            "chest pain", "chest pressure", "chest tightness", "heart pain", "cardiac pain",
            "छाती में दर्द", "छाती में जकड़न", "છાતીમાં દુખાવો", "છાતીમાં દબાણ",
            "chhati ma dukhavo", "chhati pain", "seene me dard", "dil me dard", "sine me dard"
        ]) or
        re.search(r"છાતી.*?(દુખાવો|દબાણ|પીડા)", text_to_eval) or
        re.search(r"छाती.*?(दर्द|जकड़न|पीड़ा)", text_to_eval) or
        re.search(r"chest.*?(pain|tightness|pressure)", text_to_eval)
    )

    # Breathing Difficulty
    has_breathing = bool(
        any(k in text_to_eval for k in [
            "breathing difficulty", "shortness of breath", "difficulty breathing", "breathless", "dyspnea",
            "सांस लेने में तकलीफ", "सांस फूलना", "શ્વાસ મેળવવામાં તકલીફ", "શ્વાસ ચડવો", "શ્વાસ ચડે",
            "saans me taklif", "shwas", "shwas chadvo", "sans phulna", "sans lene me takleef"
        ]) or
        re.search(r"શ્વાસ.*?(તકલીફ|ચડ|સમસ્યા)", text_to_eval) or
        re.search(r"सांस.*?(तकलीफ|फूल|दिक्कत)", text_to_eval) or
        re.search(r"breath.*?(difficult|short|trouble)", text_to_eval)
    )

    # Rule 2: Heavy / Profuse Bleeding
    heavy_bleeding_keywords = [
        "heavy bleeding", "profuse bleeding", "blood loss", "coughing blood", "vomiting blood",
        "uncontrolled bleeding", "hemorrhage", "bleeding profusely",
        "भारी खून बहना", "खून की उल्टी", "खून आना", "ज्यादा खून",
        "વધારે લોહી વહેવું", "લોહીની ઉલટી", "લોહી નીકળવું", "સખત લોહી",
        "khoon ki ulti", "khoon nikalna", "lohi vahvu", "lohi ulti"
    ]
    has_heavy_bleeding = any(k in text_to_eval for k in heavy_bleeding_keywords)

    # Rule 3: Loss of Consciousness / Fainting
    consciousness_keywords = [
        "loss of consciousness", "unconscious", "fainted", "fainting", "blackout", "passed out", "syncope",
        "बेहोश", "बेहोशी", "चक्कर आ के गिरना", "अचेत",
        "બેભાન", "ચક્કર આવીને પડી જવું", "બેભાન થવું",
        "behosh", "behoshi", "bebhan", "chakkar aake girna"
    ]
    has_unconscious = any(k in text_to_eval for k in consciousness_keywords)

    # Rule 4: Stroke Warning Signs (Face drooping, arm weakness, slurred speech)
    stroke_keywords = [
        "stroke", "slurred speech", "facial droop", "face drooping", "arm weakness", "sudden paralysis",
        "लकवा", "बोली बंद", "मुंह टेढ़ा", "हाथ पैर में कमजोरी", "पक्षाघात",
        "લકવો", "મોં વાંકુ", "બોલવામાં તકલીફ", "અચાનક નબળાઈ",
        "lakwa", "lakva", "muh tedha", "mo vanku"
    ]
    has_stroke = any(k in text_to_eval for k in stroke_keywords)

    # Rule 5: Severe Head Trauma
    trauma_keywords = [
        "head trauma", "head injury", "severe head injury", "skull fracture", "concussion", "brain injury",
        "सिर में चोट", "सिर पर चोट", "सिर फूटना",
        "માથામાં ચોટ", "માથાનો ઈજા", "માથું ફૂટવું",
        "sar me chot", "sir pe chot", "mathama chot"
    ]
    has_trauma = any(k in text_to_eval for k in trauma_keywords)

    # Rule 6: Seizures / Convulsions
    seizure_keywords = [
        "seizure", "seizures", "convulsion", "convulsions", "epileptic fit", "fits",
        "दौरे", "मिरगी", "झटके आना", "दौरा पड़ना",
        "ખેંચ", "આંચકી", "તાણ આવવી",
        "daure", "mirgi", "jhatke aana", "khench", "aanchki"
    ]
    has_seizure = any(k in text_to_eval for k in seizure_keywords)

    matched_rules: List[str] = []

    # Priority Rules
    if has_chest_pain and has_breathing:
        matched_rules.append("Rule: Chest Pain + Shortness of Breath (Potential Acute Coronary / Cardiac Triage)")
    elif has_chest_pain:
        matched_rules.append("Rule: Acute Chest Pain (Priority ECG Triage)")

    if has_heavy_bleeding:
        matched_rules.append("Rule: Uncontrolled or Severe Hemorrhage (Immediate Trauma Triage)")

    if has_unconscious:
        matched_rules.append("Rule: Loss of Consciousness / Syncope (Immediate Triage)")

    if has_stroke:
        matched_rules.append("Rule: Stroke Warning Indicators (Critical Neuro Triage)")

    if has_trauma:
        matched_rules.append("Rule: Severe Head Trauma (Emergency Observation)")

    if has_seizure:
        matched_rules.append("Rule: Active Seizure / Convulsions (Immediate Airway & Care Triage)")

    is_emergency = len(matched_rules) > 0

    if is_emergency:
        primary_reason = matched_rules[0].replace("Rule: ", "").split("(")[0].strip()
        return EmergencyRuleResult(
            isEmergency=True,
            matchedRules=matched_rules,
            priority="IMMEDIATE",
            message=f"Immediate medical attention recommended: {primary_reason}"
        )

    return EmergencyRuleResult(
        isEmergency=False,
        matchedRules=[],
        priority="ROUTINE",
        message="Standard outpatient consultation queue."
    )
