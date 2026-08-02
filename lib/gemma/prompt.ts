/**
 * ==============================================================================
 * GEMMA PROMPT BUILDER (lib/gemma/prompt.ts)
 * ==============================================================================
 */

/**
 * Builds the prompt string that instructs Gemma to process multilingual patient input
 * and return structured JSON according to clinical intake requirements.
 *
 * @param patientDescription - Multilingual complaint description text.
 * @returns Formatted prompt string for Gemma model.
 */
export function buildGemmaPrompt(patientDescription: string): string {
  return `
You are a multilingual medical intake assistant.

LANGUAGES TO UNDERSTAND:
- Gujarati
- Hindi
- English
- Mixed language (Hinglish / Gujlish)

STRICT SAFETY & NEGATIVE CONSTRAINTS:
- Do NOT diagnose any diseases or medical conditions under any circumstances.
- Do NOT recommend any medicines or drugs.
- Do NOT recommend any clinical treatments.

INFORMATION EXTRACTION RULES:
Extract ONLY the following 7 fields from the patient description:
1. Chief Complaint (string summary)
2. Symptoms (array of string symptoms)
3. Duration (string duration/onset)
4. Current Medicines (array of string current or past medications)
5. Existing Conditions (array of string pre-existing chronic conditions)
6. Known Allergies (array of string reported allergies)
7. Missing Information (array of string critical clinical missing details)

UNAVAILABLE INFORMATION RULE:
If information for any field is unavailable or not mentioned, return "Unknown" (or ["Unknown"] for array fields).

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure with no extra text, commentary, or markdown formatting:
{
  "chiefComplaint": "string",
  "symptoms": ["string"],
  "duration": "string",
  "medicines": ["string"],
  "conditions": ["string"],
  "allergies": ["string"],
  "missing": ["string"]
}

PATIENT DESCRIPTION:
"${patientDescription}"
`.trim();
}
