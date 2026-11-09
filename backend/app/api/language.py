from fastapi import APIRouter
from pydantic import BaseModel
from app.services.language_service import detect_language, get_bcp47_tag
from app.services.normalization_service import normalize_text

router = APIRouter(prefix="/api", tags=["Language & NLP"])

class DetectLanguageRequest(BaseModel):
    text: str

class NormalizeTextRequest(BaseModel):
    text: str

@router.post("/detect-language")
def api_detect_language(payload: DetectLanguageRequest):
    detected = detect_language(payload.text)
    bcp47 = get_bcp47_tag(detected)
    return {
        "success": True,
        "language": detected,
        "bcp47": bcp47
    }

@router.post("/normalize-text")
def api_normalize_text(payload: NormalizeTextRequest):
    normalized = normalize_text(payload.text)
    return {
        "success": True,
        "normalized": normalized
    }

