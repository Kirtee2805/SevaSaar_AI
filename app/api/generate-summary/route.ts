import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePatientSummary } from '@/lib/gemma/gemmaService';
import { generateMockSummaryFromText } from '@/lib/mockData';
import { checkEmergencyRules } from '@/lib/emergencyRules';

/**
 * ==============================================================================
 * API ENDPOINT: POST /api/generate-summary
 * ==============================================================================
 *
 * 1. Receives patient complaint text.
 * 2. Calls Gemma via `generatePatientSummary(rawComplaint)` to get structured JSON.
 * 3. Passes the structured JSON (symptoms) & raw text into `checkEmergencyRules()`.
 * 4. Merges Gemma outputs with emergency rule outputs.
 * 5. Returns merged structured JSON without modifying frontend.
 */

const GenerateSummarySchema = z.object({
  language: z.enum(['en', 'hi', 'gu', 'mixed']).optional().default('en'),
  patientDetails: z.object({
    name: z.string().optional(),
    age: z.union([z.number(), z.string()]).optional(),
    gender: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
  }).optional(),
  rawComplaint: z.string().min(1, 'Complaint description is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = GenerateSummarySchema.parse(body);

    const { rawComplaint, language } = validatedData;

    // 1. Call Gemma service for structured JSON extraction
    let gemmaJSON = await generatePatientSummary(rawComplaint);

    let isMockFallback = false;
    if (!gemmaJSON) {
      console.warn('[API /api/generate-summary] generatePatientSummary returned null. Using fallback generator.');
      const fallbackResult = generateMockSummaryFromText(rawComplaint, language || 'en');
      gemmaJSON = {
        chiefComplaint: fallbackResult.chiefComplaint,
        symptoms: fallbackResult.symptoms,
        duration: fallbackResult.duration,
        conditions: fallbackResult.conditions,
        medicines: fallbackResult.medicines,
        allergies: fallbackResult.allergies,
        missing: fallbackResult.missing,
      };
      isMockFallback = true;
    }

    // 2. Pass Gemma extracted symptoms and raw complaint into emergencyRules()
    const emergencyEval = checkEmergencyRules(rawComplaint, gemmaJSON.symptoms);

    // 3. Merge Gemma outputs + emergency rule outputs
    const mergedOutput = {
      chiefComplaint: gemmaJSON.chiefComplaint,
      symptoms: gemmaJSON.symptoms,
      duration: gemmaJSON.duration,
      medicines: gemmaJSON.medicines,
      conditions: gemmaJSON.conditions,
      allergies: gemmaJSON.allergies,
      missingInformation: gemmaJSON.missing,
      missing: gemmaJSON.missing, // Maintains 100% compatibility with frontend MedicalSummary type
      emergency: emergencyEval.emergency,
      emergencyReason: emergencyEval.emergency ? emergencyEval.reason : null
    };

    return NextResponse.json({
      success: true,
      data: mergedOutput,
      emergencyRuleCheck: emergencyEval,
      meta: {
        processedBy: isMockFallback
          ? 'SevaSaar Fallback Generator (Gemma API parse failed)'
          : 'Google Gemma AI Service (gemmaService.ts)',
        disclaimer: 'SevaSaar AI does not diagnose diseases or recommend treatments.'
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[API /api/generate-summary] Unexpected Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process patient summary' },
      { status: 500 }
    );
  }
}
