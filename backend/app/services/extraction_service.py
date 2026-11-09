import time
from typing import Dict, Any, Optional
from app.services.normalization_service import normalize_text
from app.services.language_service import detect_language
from app.services.gemma_service import call_gemma_model, generate_heuristic_fallback
from app.safety.emergency_rules import check_emergency_rules
from app.schemas.summary import MedicalSummarySchema

async def extract_patient_summary(
    raw_complaint: str,
    language_hint: Optional[str] = "en",
    speech_transcript: Optional[str] = None
) -> Dict[str, Any]:
    """
    Complete end-to-end extraction pipeline:
    Normalization -> Language ID -> LangChain Gemma Inference -> Pydantic Validation -> Deterministic Emergency Rule Check
    """
    start_time = time.time()
    normalized = normalize_text(raw_complaint)
    detected_lang = detect_language(normalized)

    effective_lang = language_hint if language_hint in ["gu", "hi", "en", "mixed"] else detected_lang

    # Call Gemma model via LangChain prompt
    llm_output = await call_gemma_model(normalized, effective_lang)

    if llm_output:
        model_used = llm_output.get("_model_used", "Gemma AI")
        model_brand = "Gemma" if "gemma" in model_used.lower() else "Gemini"
        is_fallback = False
        summary_data = {k: v for k, v in llm_output.items() if not k.startswith("_")}
    else:
        model_used = "SevaSaar Clinical Rule Extractor"
        model_brand = "SevaSaar"
        is_fallback = True
        summary_data = generate_heuristic_fallback(normalized, effective_lang)

    # Validate against Pydantic schema
    try:
        summary_obj = MedicalSummarySchema(**summary_data)
    except Exception:
        # Resilient recovery
        fallback_data = generate_heuristic_fallback(normalized, effective_lang)
        summary_obj = MedicalSummarySchema(**fallback_data)

    # Deterministic Emergency Rules Evaluation (CANNOT BE OVERRIDDEN BY LLM)
    emergency_result = check_emergency_rules(
        raw_text=normalized,
        symptoms=summary_obj.symptoms,
        speech_transcript=speech_transcript or ""
    )

    # Embed emergency check
    summary_obj.emergency = emergency_result.isEmergency
    summary_obj.emergencyReason = emergency_result.message if emergency_result.isEmergency else None
    summary_obj.matchedRules = emergency_result.matchedRules
    summary_obj.emergencyPriority = emergency_result.priority
    summary_obj.modelUsed = model_used
    summary_obj.modelBrand = model_brand
    summary_obj.isFallback = is_fallback
    summary_obj.language = effective_lang
    summary_obj.normalizedComplaint = normalized

    latency = round(time.time() - start_time, 2)

    return {
        "success": True,
        "data": summary_obj.model_dump(),
        "emergencyRuleCheck": emergency_result.model_dump(),
        "meta": {
            "processedBy": model_used,
            "modelBrand": model_brand,
            "isFallback": is_fallback,
            "latencySeconds": latency,
            "disclaimer": "SevaSaar AI does not diagnose diseases or recommend treatments."
        }
    }

