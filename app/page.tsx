'use client';

import React, { useState } from 'react';
import { Role, Language, PatientDetails, MedicalSummary, PatientRecord } from '@/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Patient Steps
import { WelcomeStep } from '@/components/patient/WelcomeStep';
import { LanguageStep } from '@/components/patient/LanguageStep';
import { DetailsStep } from '@/components/patient/DetailsStep';
import { ComplaintStep } from '@/components/patient/ComplaintStep';
import { LoadingStep } from '@/components/patient/LoadingStep';
import { SummaryStep } from '@/components/patient/SummaryStep';
import { ConfirmationStep } from '@/components/patient/ConfirmationStep';

// Dashboards
import { ReceptionistDashboard } from '@/components/receptionist/ReceptionistDashboard';
import { DoctorDashboard } from '@/components/doctor/DoctorDashboard';

export default function HomePage() {
  const [currentRole, setCurrentRole] = useState<Role>('patient');
  
  // Patient Intake Step Flow State (1: Welcome, 2: Language, 3: Details, 4: Complaint, 5: Loading, 6: Summary, 7: Confirmation)
  const [patientStep, setPatientStep] = useState<number>(1);
  
  // Patient Intake Form Data
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('gu');
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    location: ''
  });
  const [rawComplaint, setRawComplaint] = useState<string>('');
  const [generatedSummary, setGeneratedSummary] = useState<MedicalSummary | null>(null);
  const [createdRecord, setCreatedRecord] = useState<PatientRecord | null>(null);

  // Trigger API POST /api/generate-summary
  const handleGenerateSummary = async () => {
    setPatientStep(5); // Go to loading screen
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          patientDetails,
          rawComplaint
        })
      });

      const json = await res.json();
      if (json.success) {
        setGeneratedSummary(json.data);
      } else {
        alert('Failed to generate summary: ' + json.error);
        setPatientStep(4);
      }
    } catch (err) {
      console.error('API Error:', err);
      alert('An error occurred while connecting to the AI summary service.');
      setPatientStep(4);
    }
  };

  // Trigger API POST /api/patient to submit intake record
  const handleConfirmAndSubmit = async () => {
    if (!generatedSummary) return;

    try {
      const res = await fetch('/api/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          details: patientDetails,
          rawComplaint,
          summary: generatedSummary
        })
      });

      const json = await res.json();
      if (json.success) {
        setCreatedRecord(json.data);
        setPatientStep(7); // Go to confirmation page
      } else {
        alert('Submission error: ' + json.error);
      }
    } catch (err) {
      console.error('Submit API Error:', err);
      alert('Failed to submit patient intake assessment.');
    }
  };

  const handleResetPatientForm = () => {
    setPatientStep(1);
    setRawComplaint('');
    setGeneratedSummary(null);
    setCreatedRecord(null);
    setPatientDetails({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      location: ''
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        currentLanguage={selectedLanguage}
        isEmergency={Boolean(generatedSummary?.emergency)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Role View: Patient Flow */}
        {currentRole === 'patient' && (
          <div>
            {patientStep === 1 && (
              <WelcomeStep
                onStart={() => setPatientStep(2)}
                selectedLanguage={selectedLanguage}
                onSelectLanguage={setSelectedLanguage}
              />
            )}

            {patientStep === 2 && (
              <LanguageStep
                selectedLanguage={selectedLanguage}
                onSelectLanguage={setSelectedLanguage}
                onNext={() => setPatientStep(3)}
                onBack={() => setPatientStep(1)}
              />
            )}

            {patientStep === 3 && (
              <DetailsStep
                details={patientDetails}
                onChangeDetails={setPatientDetails}
                onNext={() => setPatientStep(4)}
                onBack={() => setPatientStep(2)}
              />
            )}

            {patientStep === 4 && (
              <ComplaintStep
                language={selectedLanguage}
                rawComplaint={rawComplaint}
                onChangeComplaint={setRawComplaint}
                onSubmit={handleGenerateSummary}
                onBack={() => setPatientStep(3)}
              />
            )}

            {patientStep === 5 && (
              <LoadingStep
                onComplete={() => setPatientStep(6)}
              />
            )}

            {patientStep === 6 && generatedSummary && (
              <SummaryStep
                summary={generatedSummary}
                details={patientDetails}
                language={selectedLanguage}
                rawComplaint={rawComplaint}
                onUpdateSummary={setGeneratedSummary}
                onConfirm={handleConfirmAndSubmit}
                onBack={() => setPatientStep(4)}
              />
            )}

            {patientStep === 7 && createdRecord && (
              <ConfirmationStep
                record={createdRecord}
                onReturnHome={() => setPatientStep(1)}
                onNewAssessment={handleResetPatientForm}
              />
            )}
          </div>
        )}

        {/* Role View: Receptionist Dashboard */}
        {currentRole === 'receptionist' && (
          <ReceptionistDashboard />
        )}

        {/* Role View: Doctor Dashboard */}
        {currentRole === 'doctor' && (
          <DoctorDashboard />
        )}

      </main>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}
