import { PatientRecord, MedicalSummary } from '@/types';
import { checkEmergencyRules } from './emergencyRules';

/**
 * Mock Patient Data Store for SevaSaar AI Healthcare Portal
 * Includes realistic multilingual complaints (Gujarati, Hindi, English, Mixed)
 */

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pat-101',
    tokenNumber: 'SEVA-001',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    language: 'gu',
    details: {
      name: 'Rameshbhai Patel',
      age: 58,
      gender: 'Male',
      phone: '+91 98765 43210',
      location: 'Anand, Gujarat'
    },
    rawComplaint: 'છેલ્લા ૨ દિવસથી છાતીમાં સખત દુખાવો થાય છે અને શ્વાસ લેવામાં પણ તકલીફ પડે છે. થોડું ચાલવાથી પણ શ્વાસ ચડી જાય છે. અગાઉ હાઈ બીપી ની દવા ચાલતી હતી પર્વત માં બંધ કરી દીધી છે.',
    summary: {
      chiefComplaint: 'Chest pain & severe shortness of breath for 2 days',
      symptoms: ['Chest Pain', 'Breathing Difficulty', 'Exertional Dyspnea', 'Fatigue'],
      duration: '2 Days',
      medicines: ['Amlodipine 5mg (discontinued)'],
      conditions: ['Hypertension (High BP)'],
      allergies: ['No known drug allergies'],
      missing: ['Recent ECG / Blood Pressure readings', 'Diabetes status'],
      emergency: true,
      emergencyReason: 'Chest Pain with Breathing Difficulty / Shortness of Breath'
    },
    status: 'Emergency',
    notes: 'Patient escorted directly to Triage Bay 1.',
    assignedDoctor: 'Dr. A. Sharma (Cardiology)'
  },
  {
    id: 'pat-102',
    tokenNumber: 'SEVA-002',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    language: 'hi',
    details: {
      name: 'Sunita Sharma',
      age: 34,
      gender: 'Female',
      phone: '+91 98123 76543',
      location: 'Jaipur, Rajasthan'
    },
    rawComplaint: 'मुझे पिछले 4 दिनों से तेज बुखार है, साथ में सिरदर्द और गले में खराश है। पेट में भी हल्का दर्द रहता है और खाने का मन नहीं करता। Paracetamol ली थी पर आराम नहीं मिला।',
    summary: {
      chiefComplaint: 'High grade fever with sore throat and headache for 4 days',
      symptoms: ['High Fever', 'Headache', 'Sore Throat', 'Mild Abdominal Pain', 'Anorexia'],
      duration: '4 Days',
      medicines: ['Paracetamol 650mg (Self-prescribed)'],
      conditions: ['None reported'],
      allergies: ['Sulfonamides'],
      missing: ['Exact body temperature log', 'CBC / Dengue / Typhoid test reports'],
      emergency: false,
      emergencyReason: null
    },
    status: 'Waiting',
    assignedDoctor: 'Dr. V. Mehta (General Medicine)'
  },
  {
    id: 'pat-103',
    tokenNumber: 'SEVA-003',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    language: 'mixed',
    details: {
      name: 'Pribhu Singh',
      age: 62,
      gender: 'Male',
      phone: '+91 97234 56789',
      location: 'Vadodara, Gujarat'
    },
    rawComplaint: 'Sir 3 days se right leg me severe swelling and severe pain chalu hua hai. Diabetes hai mereko for 10 years. Metformin tablet daily leta hu.',
    summary: {
      chiefComplaint: 'Right leg swelling and acute pain for 3 days',
      symptoms: ['Right Leg Swelling', 'Acute Leg Pain', 'Localized Inflammation'],
      duration: '3 Days',
      medicines: ['Metformin 500mg daily'],
      conditions: ['Type 2 Diabetes Mellitus (10 years)'],
      allergies: ['Penicillin'],
      missing: ['Fasting / PP Blood Glucose level', 'Peripheral arterial Doppler test'],
      emergency: false,
      emergencyReason: null
    },
    status: 'Waiting',
    assignedDoctor: 'Dr. S. Kulkarni (Diabetology)'
  },
  {
    id: 'pat-104',
    tokenNumber: 'SEVA-004',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    language: 'en',
    details: {
      name: 'Anita Desai',
      age: 29,
      gender: 'Female',
      phone: '+91 99090 12345',
      location: 'Ahmedabad, Gujarat'
    },
    rawComplaint: 'Persistent migraine headache for 2 weeks, worsening in bright sunlight. Mild nausea in the morning. No fever or vomiting.',
    summary: {
      chiefComplaint: 'Chronic migraine headache with photophobia for 2 weeks',
      symptoms: ['Migraine Headache', 'Photophobia', 'Morning Nausea'],
      duration: '2 Weeks',
      medicines: ['Naproxen as needed'],
      conditions: ['History of episodic migraine'],
      allergies: ['Aspirin'],
      missing: ['Vision / Ophthalmic examination', 'Blood pressure measurement'],
      emergency: false,
      emergencyReason: null
    },
    status: 'Completed',
    notes: 'Prescription issued. Advised follow-up after 7 days.',
    assignedDoctor: 'Dr. R. Joshi (Neurology)'
  }
];

// Memory store simulation for client/server demo
let mockPatientsStore: PatientRecord[] = [...INITIAL_PATIENTS];

export function getPatientsStore(): PatientRecord[] {
  return mockPatientsStore;
}

export function addPatientRecord(record: PatientRecord): PatientRecord {
  mockPatientsStore = [record, ...mockPatientsStore];
  return record;
}

export function updatePatientRecord(id: string, updatedSummary: Partial<MedicalSummary>, status?: PatientRecord['status']): PatientRecord | null {
  const index = mockPatientsStore.findIndex(p => p.id === id);
  if (index === -1) return null;

  mockPatientsStore[index] = {
    ...mockPatientsStore[index],
    summary: {
      ...mockPatientsStore[index].summary,
      ...updatedSummary
    },
    ...(status ? { status } : {})
  };

  return mockPatientsStore[index];
}

/**
 * Mock AI Generator Function for /api/generate-summary
 * Extracts structured medical data from patient's free text.
 * 
 * Future Gemma AI Integration Point:
 * Replace this mock heuristic parser with call to Google Gemma 2/3 / Vertex AI / Gemini API.
 */
export function generateMockSummaryFromText(rawComplaint: string, language: string): MedicalSummary {
  const lower = rawComplaint.toLowerCase();

  // Run emergency rules engine
  const emergencyCheck = checkEmergencyRules(rawComplaint);

  // Extract symptoms heuristically for demo fallback
  const detectedSymptoms: string[] = [];
  if (lower.includes('chest pain') || lower.includes('છાતી') || lower.includes('छाती')) detectedSymptoms.push('Chest Pain');
  if (lower.includes('breath') || lower.includes('સાંસ') || lower.includes('शायदे') || lower.includes('शार्टनेस')) detectedSymptoms.push('Breathing Difficulty');
  if (lower.includes('fever') || lower.includes('તાવ') || lower.includes('बुखार')) detectedSymptoms.push('Fever');
  if (lower.includes('headache') || lower.includes('માથું') || lower.includes('सिरदर्द')) detectedSymptoms.push('Headache');
  if (lower.includes('pain') || lower.includes('દુખાવો') || lower.includes('दर्द')) detectedSymptoms.push('Body Pain');
  if (lower.includes('cough') || lower.includes('ઉધરસ') || lower.includes('खांसी')) detectedSymptoms.push('Cough');

  if (detectedSymptoms.length === 0) {
    detectedSymptoms.push('Generalized Malfunction / Pain', 'Fatigue');
  }

  // Extract duration heuristically
  let duration = 'Recent onset (1-3 days)';
  if (lower.includes('day') || lower.includes('દિવસ') || lower.includes('दिन')) {
    const match = rawComplaint.match(/(\d+)\s*(day|days|દિવસ|दिन)/i);
    if (match) duration = `${match[1]} Days`;
  } else if (lower.includes('week') || lower.includes('અઠવાડિયા') || lower.includes('हफ्ते')) {
    duration = '1-2 Weeks';
  }

  // Extract medicines
  const medicines: string[] = [];
  if (lower.includes('paracetamol') || lower.includes('crocin')) medicines.push('Paracetamol 650mg');
  if (lower.includes('bp') || lower.includes('amlodipine')) medicines.push('Anti-hypertensive medication');
  if (lower.includes('metformin') || lower.includes('sugar') || lower.includes('dava')) medicines.push('Metformin / Oral Anti-diabetic');
  if (medicines.length === 0) medicines.push('None reported or self-medication unverified');

  // Extract conditions
  const conditions: string[] = [];
  if (lower.includes('bp') || lower.includes('hypertension')) conditions.push('Hypertension');
  if (lower.includes('sugar') || lower.includes('diabetes') || lower.includes('મધુપ્રમેહ')) conditions.push('Type 2 Diabetes');
  if (lower.includes('asthma') || lower.includes('અસ્થમા')) conditions.push('Asthma');
  if (conditions.length === 0) conditions.push('No major chronic conditions disclosed');

  // Extract allergies
  const allergies: string[] = ['Unspecified drug allergy status'];

  // Missing info identification
  const missing: string[] = ['Exact vital signs (BP, Pulse, SpO2, Temp)'];
  if (!lower.includes('bp') && !lower.includes('hypertension')) missing.push('Hypertension history');
  if (!lower.includes('diabetes') && !lower.includes('sugar')) missing.push('Diabetes status');
  if (medicines.includes('None reported or self-medication unverified')) missing.push('Exact list of current prescribed medicines');

  return {
    chiefComplaint: rawComplaint.length > 80 ? rawComplaint.substring(0, 77) + '...' : rawComplaint,
    symptoms: detectedSymptoms,
    duration,
    medicines,
    conditions,
    allergies,
    missing,
    emergency: Boolean(emergencyCheck.emergency || emergencyCheck.isEmergency),
    emergencyReason: (emergencyCheck.emergency || emergencyCheck.isEmergency)
      ? (emergencyCheck.reason || emergencyCheck.rulesTriggered?.join(', ') || null)
      : null
  };
}
