import { NextRequest, NextResponse } from 'next/server';
import { getPatientsStore } from '@/lib/mockData';

/**
 * API ENDPOINT: GET /api/patients
 * Returns all patient records with support for filtering by status (Waiting, Completed, Emergency) and search terms.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const searchQuery = searchParams.get('search')?.toLowerCase();

    let list = getPatientsStore();

    if (statusFilter && statusFilter !== 'All') {
      list = list.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery) {
      list = list.filter(p =>
        p.details.name.toLowerCase().includes(searchQuery) ||
        p.tokenNumber.toLowerCase().includes(searchQuery) ||
        p.details.phone.includes(searchQuery) ||
        p.summary.chiefComplaint.toLowerCase().includes(searchQuery) ||
        p.details.location.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      total: list.length,
      data: list
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve patient list' },
      { status: 500 }
    );
  }
}
