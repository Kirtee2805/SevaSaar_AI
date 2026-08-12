import { GoogleGenAI } from '@google/genai';
import { buildGemmaPrompt } from './prompt';
import { GenAISummaryResult, StructuredPatientIntake } from './types';

const GEMMA_CONFIG = {
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMMA_API_KEY || '',
  primaryModel: process.env.GEMMA_MODEL_NAME || '',
  fallbackModels: [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemma-4-31b-it'
  ]
};

function getGenAIClient(): GoogleGenAI | null {
  if (!GEMMA_CONFIG.apiKey) {
    console.error('[GemmaService] GOOGLE_API_KEY or GEMMA_API_KEY is required.');
    return null;
  }

  return new GoogleGenAI({ apiKey: GEMMA_CONFIG.apiKey });
}

function getModelBrand(modelName: string): 'Gemma' | 'Gemini' | 'Unknown' {
  const normalized = modelName.toLowerCase();
  if (normalized.startsWith('gemma')) return 'Gemma';
  if (normalized.startsWith('gemini')) return 'Gemini';
  return 'Unknown';
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : 'Not provided';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(String)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

function normalizeSymptomDetails(value: unknown): StructuredPatientIntake['symptomsDetails'] {
  if (!Array.isArray(value)) return [];
  return value.map(item => {
    const detail = item as Record<string, unknown>;
    return {
      name: normalizeString(detail?.name),
      duration: normalizeString(detail?.duration),
      severity: normalizeString(detail?.severity)
    };
  });
}

function parseModelResponse(rawText: string): unknown {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(cleaned);
}

function validateStructuredIntake(data: unknown): StructuredPatientIntake {
  if (typeof data !== 'object' || data === null) {
    throw new Error('GenAI output is not a valid object');
  }

  const intake = data as Record<string, unknown>;

  return {
    language: normalizeString(intake.language),
    chiefComplaint: normalizeString(intake.chiefComplaint),
    symptoms: normalizeStringArray(intake.symptoms),
    symptomsDetails: normalizeSymptomDetails(intake.symptomsDetails),
    duration: normalizeString(intake.duration),
    severity: normalizeString(intake.severity),
    existingConditions: normalizeStringArray(intake.existingConditions),
    currentMedicines: normalizeStringArray(intake.currentMedicines),
    knownAllergies: normalizeStringArray(intake.knownAllergies),
    relevantContext: normalizeStringArray(intake.relevantContext),
    missingInformation: normalizeStringArray(intake.missingInformation),
    normalizedComplaint: normalizeString(intake.normalizedComplaint)
  };
}

function buildModelCandidates(): string[] {
  const candidates: string[] = [];
  if (GEMMA_CONFIG.primaryModel) {
    candidates.push(GEMMA_CONFIG.primaryModel);
  }
  for (const model of GEMMA_CONFIG.fallbackModels) {
    if (!candidates.includes(model)) {
      candidates.push(model);
    }
  }
  return candidates;
}

async function callModel(modelName: string, prompt: string): Promise<{ text: string; modelName: string } | null> {
  const ai = getGenAIClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.0,
        responseMimeType: 'application/json'
      }
    });

    if (!response.text || !response.text.trim()) {
      console.warn(`[GemmaService] ${modelName} returned empty response`);
      return null;
    }

    return { text: response.text, modelName };
  } catch (error) {
    console.warn(`[GemmaService] ${modelName} failed:`, (error as Error)?.message || error);
    return null;
  }
}

export async function generatePatientSummary(
  patientDescription: string,
  patientLanguage: string
): Promise<GenAISummaryResult | null> {
  if (!patientDescription || typeof patientDescription !== 'string' || patientDescription.trim().length < 3) {
    console.warn('[GemmaService] Invalid patient description');
    return null;
  }

  const prompt = buildGemmaPrompt(patientDescription.trim(), patientLanguage);
  const candidates = buildModelCandidates();

  for (const modelName of candidates) {
    const response = await callModel(modelName, prompt);
    if (!response) continue;

    try {
      const parsed = parseModelResponse(response.text);
      const summary = validateStructuredIntake(parsed);
      return {
        success: true,
        modelUsed: response.modelName,
        modelBrand: getModelBrand(response.modelName),
        isFallback: response.modelName !== GEMMA_CONFIG.primaryModel,
        summary
      };
    } catch (error) {
      console.warn(`[GemmaService] Failed to parse or validate response from ${response.modelName}:`, error);
    }
  }

  console.warn('[GemmaService] No model produced valid structured output');
  return null;
}
