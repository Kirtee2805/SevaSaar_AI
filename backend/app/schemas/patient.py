from typing import List, Optional, Union, Literal
from pydantic import BaseModel, Field

class OptionalPatientDetails(BaseModel):
    name: Optional[str] = None
    age: Optional[Union[int, str]] = None
    gender: Optional[str] = "Male"
    phone: Optional[str] = None
    location: Optional[str] = None

class PatientDetails(BaseModel):
    name: str = Field(min_length=1, description="Full patient name")
    age: Union[int, str] = Field(description="Patient age in years")
    gender: Literal["Male", "Female", "Other", "Prefer not to say"]
    phone: str = Field(min_length=5, description="Contact phone number")
    location: str = Field(min_length=1, description="Village or City")

class SummaryPayload(BaseModel):
    chiefComplaint: str
    symptoms: List[str] = Field(default_factory=list)
    duration: str = "Unspecified duration"
    medicines: List[str] = Field(default_factory=list)
    conditions: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    missing: List[str] = Field(default_factory=list)
    emergency: bool = False
    emergencyReason: Optional[str] = None

class CreatePatientRequest(BaseModel):
    language: Literal["en", "hi", "gu", "mixed"] = "en"
    details: PatientDetails
    rawComplaint: str = Field(min_length=3)
    summary: SummaryPayload
    userRole: Optional[Literal["patient", "receptionist", "doctor", "admin"]] = "patient"

class GenerateSummaryRequest(BaseModel):
    language: Optional[Literal["en", "hi", "gu", "mixed"]] = "en"
    patientDetails: Optional[OptionalPatientDetails] = None
    rawComplaint: str = Field(min_length=1)
    speechTranscript: Optional[str] = None
    transcriptionLanguage: Optional[Literal["en", "hi", "gu", "mixed"]] = None

class SaveSummaryRequest(BaseModel):
    patientId: str
    summary: Optional[dict] = None
    status: Optional[Literal["Waiting", "Completed", "Emergency"]] = None
    notes: Optional[str] = None
    userRole: Optional[Literal["patient", "receptionist", "doctor", "admin"]] = "doctor"

class PatientResponse(BaseModel):
    id: str
    tokenNumber: str
    createdAt: str
    language: str
    details: PatientDetails
    rawComplaint: str
    summary: SummaryPayload
    status: str
    notes: Optional[str] = None
    assignedDoctor: Optional[str] = None
