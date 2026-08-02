import { NextRequest, NextResponse } from 'next/server';
import { getPatientsStore } from '@/lib/mockData';

/**
 * API ENDPOINT: GET /api/patient/:id
 * Retrieves detailed record of a single patient by ID or Token Number.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const store = getPatientsStore();
    const patient = store.find(p => p.id === id || p.tokenNumber === id);

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
