import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePatientRecord } from '@/lib/mockData';

/**
 * API ENDPOINT: POST /api/save-summary
 * Allows Receptionists or Doctors to modify and save an edited medical summary or status.
 */

const SaveSummarySchema = z.object({
  patientId: z.string().min(1),
  summary: z.object({
    chiefComplaint: z.string().optional(),
    symptoms: z.array(z.string()).optional(),
    duration: z.string().optional(),
    medicines: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    missing: z.array(z.string()).optional(),
    emergency: z.boolean().optional(),
    emergencyReason: z.string().nullable().optional()
  }),
  status: z.enum(['Waiting', 'Completed', 'Emergency']).optional(),
  notes: z.string().optional(),
  userRole: z.enum(['patient', 'receptionist', 'doctor', 'admin']).optional().default('receptionist')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = SaveSummarySchema.parse(body);

    const updated = updatePatientRecord(
      validatedData.patientId,
      validatedData.summary,
      validatedData.status,
      validatedData.notes,
      validatedData.userRole
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Patient record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Medical summary updated successfully',
      data: updated
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update summary' },
      { status: 500 }
    );
  }
}
