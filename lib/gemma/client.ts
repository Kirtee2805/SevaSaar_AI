import { generatePatientSummaryClient, StructuredGemmaSummary } from './gemmaClient';
import { checkEmergencyRules } from '@/lib/emergencyRules';
import { GemmaSummaryRequest, GemmaSummaryResult } from './types';
import { MedicalSummary } from '@/types';

export { GEMMA_CONFIG } from './gemmaClient';

/**
 * Wrapper for API Route compatibility returning MedicalSummary with emergency checks
 */
export async function generateMedicalSummary(
  request: GemmaSummaryRequest
): Promise<GemmaSummaryResult> {
  const structuredData: StructuredGemmaSummary = await generatePatientSummaryClient(request);
  const emergencyRulesResult = checkEmergencyRules(request.rawComplaint, structuredData.symptoms);

  const isEmergency = Boolean(emergencyRulesResult.emergency || emergencyRulesResult.isEmergency);
  const reasonText = isEmergency
    ? (emergencyRulesResult.reason || emergencyRulesResult.rulesTriggered?.join(' | ') || null)
    : null;

  const summary: MedicalSummary = {
    chiefComplaint: structuredData.chiefComplaint,
    symptoms: structuredData.symptoms,
    duration: structuredData.duration,
    medicines: structuredData.medicines,
    conditions: structuredData.conditions,
    allergies: structuredData.allergies,
    missing: structuredData.missing,
    emergency: isEmergency,
    emergencyReason: reasonText
  };

  return {
    summary,
    isMock: true,
  };
}
