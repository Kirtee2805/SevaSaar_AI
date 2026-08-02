import { Language, MedicalSummary, PatientDetails } from '@/types';

/**
 * ==============================================================================
 * GEMMA SERVICE TYPES (lib/gemma/types.ts)
 * ==============================================================================
 */

/**
 * Structured patient summary data returned by Gemma AI
 */
export interface PatientSummaryResult {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  medicines: string[];
  conditions: string[];
  allergies: string[];
  missing: string[];
}

export type PatientSummary = PatientSummaryResult | null;
export type StructuredGemmaSummary = PatientSummaryResult;

export interface GemmaSummaryRequest {
  rawComplaint: string;
  language: Language;
  patientDetails?: Partial<Omit<PatientDetails, 'gender'>> & { gender?: string };
}

export interface GemmaSummaryResult {
  summary: MedicalSummary;
  rawLLMOutput?: string;
  promptUsed?: string;
  isMock: boolean;
}

export class GemmaError extends Error {
  constructor(
    message: string,
    public readonly code: 'API_KEY_MISSING' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'INVALID_INPUT' | 'UNKNOWN',
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'GemmaError';
  }
}
