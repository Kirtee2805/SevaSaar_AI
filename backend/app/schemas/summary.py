from typing import List, Optional
from pydantic import BaseModel, Field

class SymptomDetail(BaseModel):
    name: str
    duration: Optional[str] = "Not provided"
    severity: Optional[str] = "Not provided"

class MedicalSummarySchema(BaseModel):
    language: Optional[str] = "en"
    chiefComplaint: str = Field(description="One-line summary of primary medical complaint")
    symptoms: List[str] = Field(default_factory=list, description="Array of extracted symptom names")
    symptomsDetails: Optional[List[SymptomDetail]] = Field(default_factory=list)
    duration: str = Field(default="Unspecified duration", description="Duration of symptoms")
    severity: Optional[str] = "Not provided"
    existingConditions: List[str] = Field(default_factory=list)
    currentMedicines: List[str] = Field(default_factory=list)
    knownAllergies: List[str] = Field(default_factory=list)
    relevantContext: Optional[List[str]] = Field(default_factory=list)
    missingInformation: List[str] = Field(default_factory=list, description="Clinical facts missing from patient input")
    normalizedComplaint: Optional[str] = None
    
    # Aliases for compatibility with different dashboard naming conventions
    conditions: Optional[List[str]] = None
    medicines: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    missing: Optional[List[str]] = None

    # Emergency triage flags
    emergency: bool = False
    emergencyReason: Optional[str] = None
    matchedRules: Optional[List[str]] = Field(default_factory=list)
    emergencyPriority: Optional[str] = "ROUTINE"

    # Meta
    modelUsed: Optional[str] = None
    modelBrand: Optional[str] = None
    isFallback: Optional[bool] = False

    def model_post_init(self, __context):
        # Sync duplicate fields so both styles (medicines vs currentMedicines) work seamlessly
        if self.conditions is None:
            self.conditions = self.existingConditions
        elif not self.existingConditions:
            self.existingConditions = self.conditions

        if self.medicines is None:
            self.medicines = self.currentMedicines
        elif not self.currentMedicines:
            self.currentMedicines = self.medicines

        if self.allergies is None:
            self.allergies = self.knownAllergies
        elif not self.knownAllergies:
            self.knownAllergies = self.allergies

        if self.missing is None:
            self.missing = self.missingInformation
        elif not self.missingInformation:
            self.missingInformation = self.missing

