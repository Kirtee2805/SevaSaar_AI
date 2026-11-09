from fastapi import APIRouter, HTTPException
from app.schemas.patient import GenerateSummaryRequest
from app.services.extraction_service import extract_patient_summary

router = APIRouter(prefix="/api", tags=["AI Intake Summary"])

@router.post("/generate-summary")
async def api_generate_summary(payload: GenerateSummaryRequest):
    try:
        result = await extract_patient_summary(
            raw_complaint=payload.rawComplaint,
            language_hint=payload.language or "en",
            speech_transcript=payload.speechTranscript
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process patient summary: {str(e)}")

