export type Language = 'en' | 'hi' | 'gu' | 'mixed';

export type Role = 'patient' | 'receptionist' | 'doctor';

export type PatientStatus = 'Waiting' | 'Completed' | 'Emergency';

export type UserRole = 'patient' | 'receptionist' | 'doctor' | 'admin';

export interface AuditEntry {
  timestamp: string;
  userRole: UserRole;
  action: string;
  details: string;
}

export interface PatientDetails {
  name: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phone: string;
  location: string; // Village / City
}

export interface SymptomDetail {
  name: string;
  duration: string;
  severity: string;
}

export interface MedicalSummary {
  language?: string;
  chiefComplaint: string;
  symptoms: string[];
  symptomsDetails?: SymptomDetail[];
  duration: string;
  medicines: string[];
  conditions: string[];
  allergies: string[];
  existingConditions?: string[];
  currentMedicines?: string[];
  knownAllergies?: string[];
  relevantContext?: string[];
  normalizedComplaint?: string;
  missing: string[];
  emergency: boolean;
  emergencyReason?: string | null;
  matchedRules?: string[];
  emergencyPriority?: string;
  modelUsed?: string;
  modelBrand?: string;
}

export interface EmergencyCheckResult {
  isEmergency: boolean;
  matchedRules: string[];
  priority: 'IMMEDIATE' | 'URGENT' | 'ROUTINE';
  message: string;
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
  createdByRole?: UserRole;
  updatedByRole?: UserRole;
  auditTrail?: AuditEntry[];
}

export interface GenerateSummaryPayload {
  language: Language;
  patientDetails: PatientDetails;
  rawComplaint: string;
}
