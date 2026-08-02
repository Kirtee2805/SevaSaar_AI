import { GoogleGenAI } from '@google/genai';
import { buildGemmaPrompt } from './prompt';
import { PatientSummaryResult } from './types';

/**
 * ==============================================================================
 * GEMMA / GEMINI AI SERVICE (lib/gemma/gemmaService.ts)
 * ==============================================================================
 *
 * Integration for Google AI Studio models using official @google/genai SDK.
 * Reads API key safely from environment variables (.env.local).
 */

function getApiKey(): string {
  return process.env.GOOGLE_API_KEY || process.env.GEMMA_API_KEY || '';
}

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('[GemmaService] Error: GOOGLE_API_KEY is missing in environment variables (.env.local).');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Generates a structured patient summary from raw multilingual complaint text.
 *
 * @param patientDescription - Patient complaint text in Gujarati, Hindi, English, or Mixed language.
 * @returns Structured JSON summary object or null if API/parsing fails.
 */
export async function generatePatientSummary(
  patientDescription: string
): Promise<PatientSummaryResult | null> {
  try {
    if (!patientDescription || typeof patientDescription !== 'string' || patientDescription.trim().length < 3) {
      console.warn('[GemmaService] Invalid or empty patient description provided.');
      return null;
    }

    const ai = getGenAIClient();
    if (!ai) {
      return null;
    }

    const prompt = buildGemmaPrompt(patientDescription.trim());
    
    // Candidate models list to maximize reliability across API versions & quota tiers
    const configuredModel = process.env.GEMMA_MODEL_NAME || 'gemini-2.0-flash';
    const candidateModels = Array.from(new Set([
      configuredModel,
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemma-4-31b-it',
      'gemini-2.5-flash-lite'
    ]));

    let responseText = '';
    let lastError: unknown = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });

        if (response.text && response.text.trim().length > 0) {
          responseText = response.text;
          console.log(`[GemmaService] Successfully generated summary using model '${modelName}'`);
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[GemmaService] Model '${modelName}' attempt failed:`, (err as Error)?.message || err);
      }
    }

    if (!responseText) {
      console.warn('[GemmaService] All candidate models failed or returned empty output. Using safety fallback generator.');
      return null;
    }

    // Parse JSON safely
    let parsed: unknown;
    try {
      const cleanedText = responseText
        .replace(/^```(json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[GemmaService] JSON parsing failed on model response:', parseError, 'Raw text:', responseText);
      return null;
    }

    if (typeof parsed !== 'object' || parsed === null) {
      console.error('[GemmaService] Parsed Gemma output is not a valid JSON object.');
      return null;
    }

    const data = parsed as Record<string, unknown>;

    const result: PatientSummaryResult = {
      chiefComplaint: typeof data.chiefComplaint === 'string' ? data.chiefComplaint : 'Unknown',
      symptoms: Array.isArray(data.symptoms) ? data.symptoms.map(String) : [],
      duration: typeof data.duration === 'string' ? data.duration : 'Unknown',
      medicines: Array.isArray(data.medicines) ? data.medicines.map(String) : [],
      conditions: Array.isArray(data.conditions) ? data.conditions.map(String) : [],
      allergies: Array.isArray(data.allergies) ? data.allergies.map(String) : [],
      missing: Array.isArray(data.missing) ? data.missing.map(String) : [],
    };

    return result;

  } catch (error) {
    console.error('[GemmaService] Unexpected error during generatePatientSummary execution:', error);
    return null;
  }
}
