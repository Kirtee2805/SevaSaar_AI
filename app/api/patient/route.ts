import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addPatientRecord, getPatientsStore } from '@/lib/mockData';
import { PatientRecord } from '@/types';

/**
 * API ENDPOINT: POST /api/patient
 * Submits a new patient intake assessment and returns the created record with Token Number.
 */

const CreatePatientSchema = z.object({
  language: z.enum(['en', 'hi', 'gu', 'mixed']),
  details: z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.union([z.number(), z.string()]),
    gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
    phone: z.string().min(5, 'Valid phone number is required'),
    location: z.string().min(1, 'Village or City is required')
  }),
  rawComplaint: z.string().min(3),
  summary: z.object({
    chiefComplaint: z.string(),
    symptoms: z.array(z.string()),
    duration: z.string(),
    medicines: z.array(z.string()),
    conditions: z.array(z.string()),
    allergies: z.array(z.string()),
    missing: z.array(z.string()),
    emergency: z.boolean(),
    emergencyReason: z.string().nullable().optional()
  })
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreatePatientSchema.parse(body);

    const store = getPatientsStore();
    const tokenSeq = (store.length + 1).toString().padStart(3, '0');
    const tokenNumber = `SEVA-${tokenSeq}`;
    const id = `pat-${Date.now()}`;

    const newRecord: PatientRecord = {
      id,
      tokenNumber,
      createdAt: new Date().toISOString(),
      language: validatedData.language,
      details: validatedData.details,
      rawComplaint: validatedData.rawComplaint,
      summary: validatedData.summary,
      status: validatedData.summary.emergency ? 'Emergency' : 'Waiting',
      assignedDoctor: validatedData.summary.emergency ? 'Triage Specialist / On-call Medical Officer' : 'General OPD Doctor'
    };

    const savedRecord = addPatientRecord(newRecord);

    return NextResponse.json({
      success: true,
      message: 'Patient intake registered successfully',
      data: savedRecord
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Server Error creating patient record' },
      { status: 500 }
    );
  }
}
