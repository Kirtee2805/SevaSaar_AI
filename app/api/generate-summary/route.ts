import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePatientSummary } from '@/lib/gemma/gemmaService';
import { generateMockSummaryFromText } from '@/lib/mockData';
import { checkEmergencyRules } from '@/lib/emergencyRules';

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
  speechTranscript: z.string().optional(),
  transcriptionLanguage: z.enum(['en', 'hi', 'gu', 'mixed']).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = GenerateSummarySchema.parse(body);

    const { rawComplaint, language, speechTranscript } = validatedData;
    const inputLanguage = language || 'en';

    const genAIResult = await generatePatientSummary(rawComplaint, inputLanguage);
    let generatedSummary = genAIResult?.summary;
    let modelUsed = genAIResult?.modelUsed || 'Fallback generator';
    let modelBrand = genAIResult?.modelBrand || 'Unknown';
    let isFallback = genAIResult?.isFallback ?? true;

    if (!generatedSummary) {
      console.warn('[API /api/generate-summary] generatePatientSummary returned null. Using fallback generator.');
      const fallbackResult = generateMockSummaryFromText(rawComplaint, inputLanguage);
      generatedSummary = {
        language: inputLanguage,
        chiefComplaint: fallbackResult.chiefComplaint,
        symptoms: fallbackResult.symptoms,
        symptomsDetails: [],
        duration: fallbackResult.duration,
        severity: 'Not provided',
        existingConditions: fallbackResult.conditions,
        currentMedicines: fallbackResult.medicines,
        knownAllergies: fallbackResult.allergies,
        relevantContext: [],
        missingInformation: fallbackResult.missing,
        normalizedComplaint: rawComplaint
      };
      modelUsed = 'SevaSaar Fallback Generator';
      modelBrand = 'Unknown';
      isFallback = true;
    }

    const emergencyEval = checkEmergencyRules(rawComplaint, generatedSummary.symptoms, speechTranscript || '');

    const mergedOutput = {
      ...generatedSummary,
      modelUsed,
      modelBrand,
      isFallback,
      emergency: emergencyEval.isEmergency,
      emergencyReason: emergencyEval.message,
      matchedRules: emergencyEval.matchedRules,
      emergencyPriority: emergencyEval.priority
    };

    return NextResponse.json({
      success: true,
      data: mergedOutput,
      emergencyRuleCheck: emergencyEval,
      meta: {
        processedBy: modelUsed,
        modelBrand,
        isFallback,
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
