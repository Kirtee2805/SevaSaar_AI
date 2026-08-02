'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MedicalSummary, PatientDetails, Language } from '@/types';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { AIWorkflowCard } from '@/components/AIWorkflowCard';
import { AIStatusCard } from '@/components/AIStatusCard';
import { SafetyNotice } from '@/components/SafetyNotice';
import { exportPatientSummaryPDF } from '@/lib/pdfExporter';
import { 
  FileText, Edit3, Check, Download, AlertCircle, Pill, Activity, 
  Clock, ShieldAlert, Sparkles, CheckCircle2, User, MapPin, Phone,
  MessageSquare, Layers, X, Plus
} from 'lucide-react';

interface SummaryStepProps {
  summary: MedicalSummary;
  details: PatientDetails;
  language: Language;
  rawComplaint?: string;
  onUpdateSummary: (updated: MedicalSummary) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function SummaryStep({
  summary,
  details,
  language,
  rawComplaint = '',
  onUpdateSummary,
  onConfirm,
  onBack
}: SummaryStepProps) {
  // Per-section edit mode state
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Editable summary state
  const [editedSummary, setEditedSummary] = useState<MedicalSummary>({
    ...summary,
    missing: summary.missing || []
  });

  const [newMissingItem, setNewMissingItem] = useState('');

  const handleSaveSection = (sectionName: string) => {
    onUpdateSummary(editedSummary);
    setEditingSection(null);
  };

  const handleAddMissingItem = () => {
    if (!newMissingItem.trim()) return;
    const updated = {
      ...editedSummary,
      missing: [...(editedSummary.missing || []), newMissingItem.trim()]
    };
    setEditedSummary(updated);
    onUpdateSummary(updated);
    setNewMissingItem('');
  };

  const handleRemoveMissingItem = (idxToRemove: number) => {
    const updated = {
      ...editedSummary,
      missing: (editedSummary.missing || []).filter((_, idx) => idx !== idxToRemove)
    };
    setEditedSummary(updated);
    onUpdateSummary(updated);
  };

  const handleDownloadPDF = () => {
    exportPatientSummaryPDF(details, editedSummary, rawComplaint, language, 'OPD-101');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-12"
    >
      
      {/* 1. EMERGENCY ALERT SECTION (Top Full-Width Banner if Emergency) */}
      {editedSummary.emergency && (
        <EmergencyBanner reason={editedSummary.emergencyReason} />
      )}

      {/* Header Bar & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold">
            <FileText className="w-4 h-4" /> Step 4 of 4 • Clinical Summary Review
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Doctor Intake Summary
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Verify extracted symptoms and missing information before final OPD submission.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Clinical PDF</span>
        </button>
      </div>

      {/* 4. AI STATUS CARD */}
      <AIStatusCard
        language={language}
        processingTimeSeconds={1.2}
        modelName="Google Gemma AI"
      />

      {/* 2. ORIGINAL PATIENT INPUT CARD (Demonstrates Gemma Multilingual Intake) */}
      {rawComplaint && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Original Patient Description (Multilingual Input)</span>
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold uppercase">
              {language} Input
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 font-serif text-slate-800 dark:text-slate-200 text-sm italic leading-relaxed">
            "{rawComplaint}"
          </div>
        </motion.div>
      )}

      {/* 3. AI WORKFLOW CARD */}
      <AIWorkflowCard />

      {/* Main Structured Intake Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        
        {/* Patient Demographics Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {details.name || 'Anonymous Patient'}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-extrabold text-xs">
              {details.age || 'Unspecified'} yrs • {details.gender}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {details.phone || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {details.location || 'N/A'}
            </span>
          </div>
        </div>

        {/* 6. EDITABLE SECTIONS WITH PER-SECTION EDIT ICONS */}

        {/* SECTION 1: Chief Complaint */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Chief Complaint</span>
            </h3>
            {editingSection === 'chiefComplaint' ? (
              <button
                type="button"
                onClick={() => handleSaveSection('chiefComplaint')}
                className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 hover:underline"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection('chiefComplaint')}
                className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {editingSection === 'chiefComplaint' ? (
            <textarea
              rows={2}
              value={editedSummary.chiefComplaint}
              onChange={(e) => setEditedSummary({ ...editedSummary, chiefComplaint: e.target.value })}
              className="w-full p-3.5 rounded-2xl border border-blue-500 bg-blue-50/50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-slate-900 dark:text-white font-extrabold text-base">
              {editedSummary.chiefComplaint}
            </div>
          )}
        </div>

        {/* SECTION 2 & 3: Symptoms & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Symptoms List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Extracted Symptoms</span>
              </h3>
              {editingSection === 'symptoms' ? (
                <button
                  type="button"
                  onClick={() => handleSaveSection('symptoms')}
                  className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 hover:underline"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingSection('symptoms')}
                  className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            {editingSection === 'symptoms' ? (
              <input
                type="text"
                placeholder="Comma separated symptoms"
                value={editedSummary.symptoms.join(', ')}
                onChange={(e) => setEditedSummary({ ...editedSummary, symptoms: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full p-3.5 rounded-2xl border border-blue-500 bg-blue-50/50 dark:bg-slate-800 text-xs font-semibold"
              />
            ) : (
              <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 min-h-[60px]">
                {editedSummary.symptoms.map((sym, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800"
                  >
                    • {sym}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Symptom Duration</span>
              </h3>
              {editingSection === 'duration' ? (
                <button
                  type="button"
                  onClick={() => handleSaveSection('duration')}
                  className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 hover:underline"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingSection('duration')}
                  className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            {editingSection === 'duration' ? (
              <input
                type="text"
                value={editedSummary.duration}
                onChange={(e) => setEditedSummary({ ...editedSummary, duration: e.target.value })}
                className="w-full p-3.5 rounded-2xl border border-blue-500 bg-blue-50/50 dark:bg-slate-800 text-xs font-semibold"
              />
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 font-extrabold text-slate-900 dark:text-white text-sm min-h-[60px] flex items-center">
                {editedSummary.duration}
              </div>
            )}
          </div>

        </div>

        {/* SECTION 4 & 5: Current Medicines, Conditions, & Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Medicines */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-600" />
                <span>Current Medicines</span>
              </h3>
              {editingSection === 'medicines' ? (
                <button
                  type="button"
                  onClick={() => handleSaveSection('medicines')}
                  className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 hover:underline"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingSection('medicines')}
                  className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            {editingSection === 'medicines' ? (
              <input
                type="text"
                placeholder="Comma separated medicines"
                value={editedSummary.medicines.join(', ')}
                onChange={(e) => setEditedSummary({ ...editedSummary, medicines: e.target.value.split(',').map(m => m.trim()) })}
                className="w-full p-3.5 rounded-2xl border border-blue-500 bg-blue-50/50 dark:bg-slate-800 text-xs font-semibold"
              />
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 min-h-[70px]">
                {editedSummary.medicines.map((med, idx) => (
                  <div key={idx} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>{med}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conditions & Allergies */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Existing Conditions & Allergies</span>
              </h3>
              {editingSection === 'conditions' ? (
                <button
                  type="button"
                  onClick={() => handleSaveSection('conditions')}
                  className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 hover:underline"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingSection('conditions')}
                  className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            {editingSection === 'conditions' ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Conditions (comma separated)"
                  value={editedSummary.conditions.join(', ')}
                  onChange={(e) => setEditedSummary({ ...editedSummary, conditions: e.target.value.split(',').map(c => c.trim()) })}
                  className="w-full p-3 rounded-xl border border-blue-500 text-xs"
                />
                <input
                  type="text"
                  placeholder="Allergies (comma separated)"
                  value={editedSummary.allergies.join(', ')}
                  onChange={(e) => setEditedSummary({ ...editedSummary, allergies: e.target.value.split(',').map(a => a.trim()) })}
                  className="w-full p-3 rounded-xl border border-blue-500 text-xs"
                />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs min-h-[70px]">
                <div>
                  <span className="font-extrabold text-slate-400 uppercase text-[10px] block">Chronic Conditions:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{editedSummary.conditions.join(', ')}</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-400 uppercase text-[10px] block">Known Allergies:</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">{editedSummary.allergies.join(', ')}</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 5. DEDICATED MISSING INFORMATION SECTION (With Reception/Doctor Inline Editing) */}
        <div className="bg-amber-50 dark:bg-amber-950/40 p-6 rounded-3xl border border-amber-200 dark:border-amber-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Dedicated Missing Information Checklist</span>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
              {editedSummary.missing.length} Item(s)
            </span>
          </div>

          <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
            Staff can review or resolve missing patient details before clinical consultation:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {editedSummary.missing.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 font-extrabold text-xs border border-amber-300 dark:border-amber-700 shadow-sm flex items-center gap-2"
              >
                <span>• {item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMissingItem(idx)}
                  className="text-amber-500 hover:text-red-600 transition-colors"
                  title="Remove item"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Missing Detail Field */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add missing clinical detail (e.g. Age not confirmed)..."
              value={newMissingItem}
              onChange={(e) => setNewMissingItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMissingItem()}
              className="flex-1 p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddMissingItem}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Detail
            </button>
          </div>
        </div>

        {/* 7. RESPONSIBLE AI SAFETY NOTICE */}
        <SafetyNotice />

        {/* Clinical Disclaimer Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-[10px] text-slate-400 text-center">
          SevaSaar AI Clinical Summary • Generated on {new Date().toLocaleString()} • Human Triage Verification Required
        </div>

      </div>

      {/* Action Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-sm hover:bg-slate-100"
        >
          Back & Edit Complaint
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base shadow-xl shadow-emerald-500/20 flex items-center gap-2.5 transition-transform hover:scale-105"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Confirm & Submit Assessment</span>
        </button>
      </div>

    </motion.div>
  );
}
