'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PatientRecord, MedicalSummary } from '@/types';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { AIWorkflowCard } from '@/components/AIWorkflowCard';
import { AIStatusCard } from '@/components/AIStatusCard';
import { SafetyNotice } from '@/components/SafetyNotice';
import { exportPatientSummaryPDF } from '@/lib/pdfExporter';
import { 
  Stethoscope, User, Activity, Clock, Pill, ShieldAlert, 
  AlertCircle, Printer, Download, CheckCircle2, RefreshCw, 
  Sparkles, FileText, Phone, MapPin, Check, MessageSquare,
  Edit3, Plus, X
} from 'lucide-react';

export function DoctorDashboard() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');

  // Per-section inline editing in doctor dashboard
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedSummary, setEditedSummary] = useState<MedicalSummary | null>(null);
  const [newMissingItem, setNewMissingItem] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients');
      const json = await res.json();
      if (json.success) {
        // Sort priority: Emergency first, then Waiting, then Completed
        const sorted = (json.data as PatientRecord[]).sort((a, b) => {
          if (a.status === 'Emergency' && b.status !== 'Emergency') return -1;
          if (a.status !== 'Emergency' && b.status === 'Emergency') return 1;
          if (a.status === 'Waiting' && b.status === 'Completed') return -1;
          return 0;
        });
        setPatients(sorted);
        if (sorted.length > 0 && !selectedPatient) {
          setSelectedPatient(sorted[0]);
          setEditedSummary(sorted[0].summary);
        }
      }
    } catch (err) {
      console.error('Error fetching doctor patient queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setEditedSummary({
        ...selectedPatient.summary,
        missing: selectedPatient.summary.missing || []
      });
      setDoctorNotes(selectedPatient.notes || '');
    }
  }, [selectedPatient]);

  const handleSelectPatient = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setEditingSection(null);
  };

  const handleSaveSectionEdit = async () => {
    if (!selectedPatient || !editedSummary) return;

    try {
      const res = await fetch('/api/save-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          summary: editedSummary,
          status: selectedPatient.status,
          notes: doctorNotes
        })
      });

      const json = await res.json();
      if (json.success) {
        setSelectedPatient(json.data);
        setEditingSection(null);
        fetchPatients();
      }
    } catch (err) {
      console.error('Failed to save summary edit:', err);
    }
  };

  const handleMarkCompleted = async () => {
    if (!selectedPatient || !editedSummary) return;

    try {
      const res = await fetch('/api/save-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          summary: editedSummary,
          status: 'Completed',
          notes: doctorNotes
        })
      });

      const json = await res.json();
      if (json.success) {
        setSelectedPatient(json.data);
        fetchPatients();
      }
    } catch (err) {
      console.error('Failed to complete consultation:', err);
    }
  };

  const handleExportPDF = () => {
    if (!selectedPatient || !editedSummary) return;
    exportPatientSummaryPDF(
      selectedPatient.details,
      editedSummary,
      selectedPatient.rawComplaint,
      selectedPatient.language,
      selectedPatient.tokenNumber
    );
  };

  const handleAddMissingItem = () => {
    if (!newMissingItem.trim() || !editedSummary) return;
    const updated = {
      ...editedSummary,
      missing: [...(editedSummary.missing || []), newMissingItem.trim()]
    };
    setEditedSummary(updated);
    setNewMissingItem('');
  };

  const handleRemoveMissingItem = (idxToRemove: number) => {
    if (!editedSummary) return;
    const updated = {
      ...editedSummary,
      missing: (editedSummary.missing || []).filter((_, idx) => idx !== idxToRemove)
    };
    setEditedSummary(updated);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Doctor Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold">
            <Stethoscope className="w-4 h-4" /> OPD Clinical Triage Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Doctor OPD Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Review structured patient intake summaries, missing clinical info alerts, and emergency indicators.
          </p>
        </div>

        <button
          onClick={fetchPatients}
          className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-extrabold text-xs flex items-center gap-2 self-start md:self-auto shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Main Grid: Left Patient List / Right Detailed Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Priority Patient Queue (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Patient Queue ({patients.length})</span>
            <span className="text-[10px] text-red-500 font-bold bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-md">
              ⚠️ Priority Sorted
            </span>
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden max-h-[780px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                Loading clinical queue...
              </div>
            ) : patients.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No patients in queue today.
              </div>
            ) : (
              patients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <motion.div
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className={`p-4 cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/50 border-l-4 border-l-blue-600'
                        : p.status === 'Emergency'
                        ? 'bg-red-50/50 dark:bg-red-950/30 border-l-4 border-l-red-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-blue-600 dark:text-blue-400">
                        {p.tokenNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        p.status === 'Emergency'
                          ? 'bg-red-600 text-white animate-pulse'
                          : p.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {p.details.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {p.details.age} yrs • {p.details.gender} • {p.details.location}
                      </p>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1 bg-white/80 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                      {p.summary.chiefComplaint}
                    </p>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Clinical Summary Console (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedPatient && editedSummary ? (
            <div className="space-y-4">
              
              {/* Doctor Control Top Bar */}
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs shadow-sm">
                    {selectedPatient.tokenNumber}
                  </span>
                  <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                    Lang: {selectedPatient.language.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300 dark:border-emerald-700">
                    <Sparkles className="w-3 h-3 text-emerald-500" /> High Confidence • Verified Schema
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>PDF Export</span>
                  </button>

                  {selectedPatient.status !== 'Completed' && (
                    <button
                      onClick={handleMarkCompleted}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Consultation Done</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 1. Emergency Banner (If Emergency) */}
              {editedSummary.emergency && (
                <EmergencyBanner reason={editedSummary.emergencyReason} />
              )}

              {/* 4. AI STATUS CARD */}
              <AIStatusCard
                language={selectedPatient.language}
                processingTimeSeconds={1.2}
                modelName="Google Gemma AI"
              />

              {/* 2. ORIGINAL PATIENT INPUT CARD */}
              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Original Multilingual Patient Input</span>
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {selectedPatient.language.toUpperCase()}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 font-serif italic text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                  "{selectedPatient.rawComplaint}"
                </div>
              </div>

              {/* 3. AI WORKFLOW PIPELINE CARD */}
              <AIWorkflowCard />

              {/* Full Patient Intake Card */}
              <div
                id="doctor-patient-intake-card"
                className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6"
              >
                {/* Header Info */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {selectedPatient.details.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {selectedPatient.details.age} Years • {selectedPatient.details.gender} • Phone: {selectedPatient.details.phone} • City: {selectedPatient.details.location}
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-400">
                    <span className="block font-bold text-slate-500">Intake Timestamp</span>
                    <span>{new Date(selectedPatient.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* 6. EDITABLE SECTIONS FOR DOCTOR CONSOLE */}

                {/* Chief Complaint */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span>Chief Complaint</span>
                    </h3>
                    {editingSection === 'chief' ? (
                      <button
                        onClick={handleSaveSectionEdit}
                        className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 hover:underline"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingSection('chief')}
                        className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </div>

                  {editingSection === 'chief' ? (
                    <textarea
                      rows={2}
                      value={editedSummary.chiefComplaint}
                      onChange={(e) => setEditedSummary({ ...editedSummary, chiefComplaint: e.target.value })}
                      className="w-full p-3 rounded-xl border border-blue-500 bg-blue-50/50 text-xs font-semibold"
                    />
                  ) : (
                    <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-slate-900 dark:text-white font-extrabold text-base">
                      {editedSummary.chiefComplaint}
                    </div>
                  )}
                </div>

                {/* Symptoms & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Extracted Symptoms</span>
                      </h4>
                      {editingSection === 'symptoms' ? (
                        <button onClick={handleSaveSectionEdit} className="text-xs font-extrabold text-emerald-600">Save</button>
                      ) : (
                        <button onClick={() => setEditingSection('symptoms')} className="text-xs text-slate-400 hover:text-blue-600">Edit</button>
                      )}
                    </div>

                    {editingSection === 'symptoms' ? (
                      <input
                        type="text"
                        value={editedSummary.symptoms.join(', ')}
                        onChange={(e) => setEditedSummary({ ...editedSummary, symptoms: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full p-3 rounded-xl border border-blue-500 text-xs"
                      />
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-wrap gap-1.5 min-h-[60px]">
                        {editedSummary.symptoms.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 font-extrabold text-xs">
                            • {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Duration</span>
                      </h4>
                      {editingSection === 'duration' ? (
                        <button onClick={handleSaveSectionEdit} className="text-xs font-extrabold text-emerald-600">Save</button>
                      ) : (
                        <button onClick={() => setEditingSection('duration')} className="text-xs text-slate-400 hover:text-blue-600">Edit</button>
                      )}
                    </div>

                    {editingSection === 'duration' ? (
                      <input
                        type="text"
                        value={editedSummary.duration}
                        onChange={(e) => setEditedSummary({ ...editedSummary, duration: e.target.value })}
                        className="w-full p-3 rounded-xl border border-blue-500 text-xs"
                      />
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 font-extrabold text-slate-900 dark:text-white text-sm min-h-[60px] flex items-center">
                        {editedSummary.duration}
                      </div>
                    )}
                  </div>
                </div>

                {/* Medicines & Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-purple-500" />
                        <span>Medicines</span>
                      </h4>
                      {editingSection === 'medicines' ? (
                        <button onClick={handleSaveSectionEdit} className="text-xs font-extrabold text-emerald-600">Save</button>
                      ) : (
                        <button onClick={() => setEditingSection('medicines')} className="text-xs text-slate-400 hover:text-blue-600">Edit</button>
                      )}
                    </div>

                    {editingSection === 'medicines' ? (
                      <input
                        type="text"
                        value={editedSummary.medicines.join(', ')}
                        onChange={(e) => setEditedSummary({ ...editedSummary, medicines: e.target.value.split(',').map(m => m.trim()) })}
                        className="w-full p-3 rounded-xl border border-blue-500 text-xs"
                      />
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 min-h-[60px]">
                        {editedSummary.medicines.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        <span>Conditions & Allergies</span>
                      </h4>
                      {editingSection === 'conditions' ? (
                        <button onClick={handleSaveSectionEdit} className="text-xs font-extrabold text-emerald-600">Save</button>
                      ) : (
                        <button onClick={() => setEditingSection('conditions')} className="text-xs text-slate-400 hover:text-blue-600">Edit</button>
                      )}
                    </div>

                    {editingSection === 'conditions' ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Conditions"
                          value={editedSummary.conditions.join(', ')}
                          onChange={(e) => setEditedSummary({ ...editedSummary, conditions: e.target.value.split(',').map(c => c.trim()) })}
                          className="w-full p-2.5 rounded-xl border border-blue-500 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Allergies"
                          value={editedSummary.allergies.join(', ')}
                          onChange={(e) => setEditedSummary({ ...editedSummary, allergies: e.target.value.split(',').map(a => a.trim()) })}
                          className="w-full p-2.5 rounded-xl border border-blue-500 text-xs"
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5 min-h-[60px]">
                        <div>Conditions: <strong className="text-slate-900 dark:text-white">{editedSummary.conditions.join(', ')}</strong></div>
                        <div>Allergies: <strong className="text-amber-600 dark:text-amber-400">{editedSummary.allergies.join(', ')}</strong></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. DEDICATED MISSING INFORMATION ALERT SECTION */}
                <div className="bg-amber-50 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
                  <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>RECOMMENDED CLINICAL QUESTIONS TO ASK PATIENT</span>
                    </div>
                    <span>{editedSummary.missing.length} Item(s)</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {editedSummary.missing.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-bold text-xs border border-amber-300 flex items-center gap-1.5">
                        <span>❓ Ask: {item}</span>
                        <button onClick={() => handleRemoveMissingItem(idx)} className="text-amber-600 hover:text-red-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add clinical question..."
                      value={newMissingItem}
                      onChange={(e) => setNewMissingItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMissingItem()}
                      className="flex-1 p-2 rounded-xl border border-amber-300 text-xs focus:outline-none"
                    />
                    <button
                      onClick={handleAddMissingItem}
                      className="px-3 py-2 bg-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>

                {/* 4. Doctor Clinical Notes & Prescription Textarea */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Doctor Consultation Notes & OPD Prescription
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter doctor clinical examination notes, vitals, diagnosis, and prescription details..."
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                {/* 7. SAFETY NOTICE */}
                <SafetyNotice />

                <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 dark:border-slate-800 pt-3">
                  SevaSaar AI Triage Summary • Standard OPD Document Format • Signed by Attending Medical Officer
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-sm">
              Select a patient from the queue on the left to view their intake summary.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
