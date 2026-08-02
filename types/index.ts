export type Language = 'en' | 'hi' | 'gu' | 'mixed';

export type Role = 'patient' | 'receptionist' | 'doctor';

export type PatientStatus = 'Waiting' | 'Completed' | 'Emergency';

export interface PatientDetails {
  name: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phone: string;
  location: string; // Village / City
}

export interface MedicalSummary {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  medicines: string[];
  conditions: string[];
  allergies: string[];
  missing: string[];
  emergency: boolean;
  emergencyReason?: string | null;
}

export interface EmergencyCheckResult {
  isEmergency: boolean;
  rulesTriggered: string[];
  message: string;
  disclaimer: string;
}

export interface PatientRecord {
  id: string;
  tokenNumber: string;
  createdAt: string;
  language: Language;
  details: PatientDetails;
  rawComplaint: string;
  summary: MedicalSummary;
  status: PatientStatus;
  notes?: string;
  assignedDoctor?: string;
}

export interface GenerateSummaryPayload {
  language: Language;
  patientDetails: PatientDetails;
  rawComplaint: string;
}
