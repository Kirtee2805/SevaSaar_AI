export interface GenAIModelInfo {
  modelName: string;
  modelBrand: 'Gemma' | 'Gemini' | 'Unknown';
  isFallback: boolean;
}

export interface StructuredPatientIntake {
  language: string;
  chiefComplaint: string;
  symptoms: string[];
  symptomsDetails?: {
    name: string;
    duration: string;
    severity: string;
  }[];
  duration: string;
  severity?: string;
  existingConditions: string[];
  currentMedicines: string[];
  knownAllergies: string[];
  relevantContext: string[];
  missingInformation: string[];
  normalizedComplaint: string;
}

export interface GenAISummaryResult {
  success: boolean;
  modelUsed: string;
  modelBrand: 'Gemma' | 'Gemini' | 'Unknown';
  isFallback: boolean;
  summary: StructuredPatientIntake;
}
