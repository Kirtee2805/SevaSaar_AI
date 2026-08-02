import jsPDF from 'jspdf';
import { MedicalSummary, PatientDetails, Language } from '@/types';

/**
 * ==============================================================================
 * PDF EXPORT UTILITY (lib/pdfExporter.ts)
 * ==============================================================================
 *
 * Generates a clean, production-grade clinical PDF intake report containing:
 * - Hospital Header & SevaSaar AI Branding
 * - Patient Demographics & Token Info
 * - Original Multilingual Patient Description
 * - Gemma AI Structured Clinical Summary
 * - Emergency Triage Rules Assessment
 * - Responsible AI Disclaimer
 */

export function exportPatientSummaryPDF(
  details: PatientDetails,
  summary: MedicalSummary,
  rawComplaint: string,
  language: Language,
  tokenNumber: string = 'OPD-101'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 15;

  // Header Banner
  doc.setFillColor(30, 58, 138); // Dark blue #1e3a8a
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SEVASAAR AI • PATIENT INTAKE REPORT', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Multilingual Triage Assistant • Hospital OPD Intake Console', margin, 18);

  doc.setFont('helvetica', 'bold');
  doc.text(`Token: ${tokenNumber}`, pageWidth - margin - 25, 15);

  y = 34;

  // Patient Demographics Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient Name: ${details.name || 'Anonymous'}`, margin + 4, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Age/Gender: ${details.age} yrs / ${details.gender}`, margin + 4, y + 14);
  doc.text(`Phone: ${details.phone || 'N/A'}  |  Location: ${details.location || 'N/A'}`, margin + 80, y + 14);
  doc.text(`Date/Time: ${new Date().toLocaleString()}`, margin + 80, y + 7);

  y += 28;

  // Emergency Alert Box (If Triggered)
  if (summary.emergency) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 3, 3, 'FD');

    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CRITICAL EMERGENCY TRIAGE ALERT', margin + 4, y + 6);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const reasonText = summary.emergencyReason || 'Immediate Medical Attention Recommended';
    doc.text(`Indicator: ${reasonText}`, margin + 4, y + 12);

    y += 24;
  }

  // Original Patient Input Section
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 3, 3, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Original Patient Description (${language.toUpperCase()})`, margin + 4, y + 6);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const cleanRaw = rawComplaint.replace(/[\r\n]+/g, ' ').substring(0, 180);
  doc.text(`"${cleanRaw}${rawComplaint.length > 180 ? '...' : ''}"`, margin + 4, y + 14);

  y += 30;

  // AI Structured Clinical Summary Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('AI STRUCTURED CLINICAL SUMMARY (Gemma AI)', margin, y);
  y += 6;

  // Chief Complaint
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Chief Complaint:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(summary.chiefComplaint || 'None recorded', margin + 35, y);
  y += 7;

  // Symptoms
  doc.setFont('helvetica', 'bold');
  doc.text('Extracted Symptoms:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(summary.symptoms.join(', ') || 'None', margin + 35, y);
  y += 7;

  // Duration
  doc.setFont('helvetica', 'bold');
  doc.text('Symptom Duration:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(summary.duration || 'Unspecified', margin + 35, y);
  y += 7;

  // Current Medicines
  doc.setFont('helvetica', 'bold');
  doc.text('Current Medicines:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(summary.medicines.join(', ') || 'None reported', margin + 35, y);
  y += 7;

  // Existing Conditions
  doc.setFont('helvetica', 'bold');
  doc.text('Existing Conditions:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(summary.conditions.join(', ') || 'None reported', margin + 35, y);
  y += 7;

  // Known Allergies
  doc.setFont('helvetica', 'bold');
  doc.text('Known Allergies:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(summary.allergies.join(', ') || 'None reported', margin + 35, y);
  y += 10;

  // Missing Information Highlight Section
  if (summary.missing && summary.missing.length > 0) {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 3, 3, 'FD');

    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('MISSING CLINICAL INFORMATION (Doctor Alert):', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const missingItemsStr = summary.missing.map(m => `• ${m}`).join('   ');
    doc.text(missingItemsStr.substring(0, 120), margin + 4, y + 13);

    y += 26;
  }

  // Footer & Responsible AI Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('RESPONSIBLE AI NOTICE: Generated by SevaSaar AI to assist medical staff.', margin, pageHeight - 14);
  doc.text('Does NOT provide medical diagnosis, treatment recommendations, or prescriptions.', margin, pageHeight - 10);
  doc.text(`Page 1 of 1 • Generated ${new Date().toLocaleString()}`, pageWidth - margin - 50, pageHeight - 10);

  // Save PDF
  doc.save(`SevaSaar_Intake_${details.name.replace(/\s+/g, '_')}_${tokenNumber}.pdf`);
}
