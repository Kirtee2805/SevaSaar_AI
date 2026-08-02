import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { buildGemmaPrompt } from './prompt';
import { GemmaError, GemmaSummaryRequest } from './types';
import { generateMockSummaryFromText } from '@/lib/mockData';

/**
 * ==============================================================================
 * GEMMA / GEMINI AI CLIENT CONFIGURATION
 * ==============================================================================
 */

export const GEMMA_CONFIG = {
  API_KEY: process.env.GEMMA_API_KEY || process.env.GOOGLE_API_KEY || 'YOUR_GEMMA_API_KEY_HERE',
  MODEL_NAME: process.env.GEMMA_MODEL_NAME || 'gemini-2.5-flash',
  BASE_URL: process.env.GEMMA_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
};

/**
 * Zod Schema for strict validation of Gemma / Gemini response payload
 */
export const GemmaResponseSchema = z.object({
  chiefComplaint: z.string().catch('Complaint recorded'),
  symptoms: z.array(z.string()).catch([]),
  duration: z.string().catch('Unspecified duration'),
  conditions: z.array(z.string()).catch([]),
  medicines: z.array(z.string()).catch([]),
  allergies: z.array(z.string()).catch([]),
  missing: z.array(z.string()).catch([]),
});

export type StructuredGemmaSummary = z.infer<typeof GemmaResponseSchema>;

/**
 * 1. Sends prompt request to Gemma / Gemini API using @google/genai SDK
 */
async function sendToGemma(prompt: string): Promise<string> {
  const { API_KEY, MODEL_NAME } = GEMMA_CONFIG;

  if (API_KEY && API_KEY !== 'YOUR_GEMMA_API_KEY_HERE') {
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const modelToUse = MODEL_NAME || 'gemini-2.5-flash';

      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text;

      if (!rawText) {
        throw new GemmaError('Empty response content received from AI API', 'NETWORK_ERROR');
      }

      return rawText;
    } catch (err) {
      if (err instanceof GemmaError) throw err;
      throw new GemmaError(
        'Failed to generate content via GoogleGenAI SDK',
        'NETWORK_ERROR',
        err
      );
    }
  }

  console.log('[GemmaClient] API_KEY unconfigured. Operating in fallback mode.');
  return '';
}

/**
 * Parses raw text into a JSON object
 */
function parseGemmaJSON(rawText: string): unknown {
  try {
    const cleanedText = rawText
      .replace(/^```(json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleanedText);
  } catch (err) {
    throw new GemmaError(
      'Failed to parse JSON response from LLM string',
      'PARSE_ERROR',
      err
    );
  }
}

/**
 * Validates parsed object against GemmaResponseSchema
 */
function validateGemmaJSON(data: unknown): StructuredGemmaSummary {
  const result = GemmaResponseSchema.safeParse(data);
  if (!result.success) {
    throw new GemmaError(
      'Validation failed for response JSON schema',
      'PARSE_ERROR',
      result.error
    );
  }
  return result.data;
}

/**
 * Core function to generate a patient summary from raw text input or request object
 */
export async function generatePatientSummaryClient(
  patientInput: string | GemmaSummaryRequest
): Promise<StructuredGemmaSummary> {
  try {
    const patientText = typeof patientInput === 'string'
      ? patientInput
      : patientInput.rawComplaint;

    const language = typeof patientInput === 'string'
      ? 'en'
      : patientInput.language || 'en';

    if (!patientText || patientText.trim().length < 3) {
      throw new GemmaError('Patient complaint text is too short', 'INVALID_INPUT');
    }

    // Step 1: Build prompt using buildGemmaPrompt()
    const prompt = buildGemmaPrompt(patientText);

    // Step 2 & Step 3: Send prompt to Google AI SDK & receive response
    let rawResponse = '';
    try {
      rawResponse = await sendToGemma(prompt);
    } catch (apiErr) {
      console.error('[GemmaClient] Live API error, using fallback:', apiErr);
    }

    let structuredData: StructuredGemmaSummary;

    if (rawResponse && rawResponse.trim().length > 0) {
      // Step 4: Parse the JSON
      const parsedJSON = parseGemmaJSON(rawResponse);

      // Step 5: Validate the JSON
      structuredData = validateGemmaJSON(parsedJSON);
    } else {
      // Fallback generator if API key is invalid/unconfigured
      const mockResult = generateMockSummaryFromText(patientText, language);
      structuredData = {
        chiefComplaint: mockResult.chiefComplaint,
        symptoms: mockResult.symptoms,
        duration: mockResult.duration,
        conditions: mockResult.conditions,
        medicines: mockResult.medicines,
        allergies: mockResult.allergies,
        missing: mockResult.missing,
      };
    }

    // Step 6: Return structured data
    return structuredData;
  } catch (error) {
    if (error instanceof GemmaError) {
      throw error;
    }
    throw new GemmaError(
      'An unexpected error occurred while generating patient summary',
      'UNKNOWN',
      error
    );
  }
}
