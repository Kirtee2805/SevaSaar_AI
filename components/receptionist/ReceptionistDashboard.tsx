'use client';

import React, { useState, useEffect } from 'react';
import { PatientRecord, MedicalSummary } from '@/types';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { 
  Users, Search, Filter, AlertOctagon, CheckCircle2, Clock, 
  Edit3, Eye, FileText, RefreshCw, Phone, MapPin, Check, Save 
} from 'lucide-react';

export function ReceptionistDashboard() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedChiefComplaint, setEditedChiefComplaint] = useState('');
  const [editedStatus, setEditedStatus] = useState<PatientRecord['status']>('Waiting');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) {
        setPatients(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch patient queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [statusFilter, searchQuery]);

  const handleOpenPatient = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setEditedChiefComplaint(patient.summary.chiefComplaint);
    setEditedStatus(patient.status);
    setIsEditing(false);
  };

  const handleSaveSummary = async () => {
    if (!selectedPatient) return;

    try {
      const res = await fetch('/api/save-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          summary: { chiefComplaint: editedChiefComplaint },
          status: editedStatus
        })
      });

      const json = await res.json();
      if (json.success) {
        setSelectedPatient(json.data);
        setIsEditing(false);
        fetchPatients();
      }
    } catch (err) {
      console.error('Failed to save summary:', err);
    }
  };

  // Stats Counters
  const totalCount = patients.length;
  const waitingCount = patients.filter(p => p.status === 'Waiting').length;
  const emergencyCount = patients.filter(p => p.status === 'Emergency').length;
  const completedCount = patients.filter(p => p.status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold">
            <Users className="w-4 h-4" /> Hospital Reception Queue Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Receptionist Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor incoming patient intakes, edit summaries, and manage doctor triage assignments.
          </p>
        </div>

        <button
          onClick={fetchPatients}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Today</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-amber-200/80 dark:border-amber-900/50 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase">Waiting</span>
          <p className="text-3xl font-black text-amber-600 mt-1">{waitingCount}</p>
        </div>

        <div className="bg-red-50 dark:bg-red-950/40 p-5 rounded-3xl border border-red-200 dark:border-red-900 shadow-sm">
          <span className="text-xs font-bold text-red-600 uppercase">Emergency Alerts</span>
          <p className="text-3xl font-black text-red-600 mt-1">{emergencyCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase">Completed</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by name, token #, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {['All', 'Waiting', 'Emergency', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                statusFilter === status
                  ? status === 'Emergency'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

      </div>

      {/* Queue Table / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading patient queue...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No patient intake records match the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handleOpenPatient(patient)}
                className={`p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  patient.status === 'Emergency' ? 'bg-red-50/40 dark:bg-red-950/20 border-l-4 border-l-red-600' : ''
                }`}
              >
                {/* Patient Header Details */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-extrabold text-xs shadow-sm ${
                    patient.status === 'Emergency'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-blue-600 text-white'
                  }`}>
                    <span>TOK</span>
                    <span className="text-sm font-black">{patient.tokenNumber.split('-')[1]}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">
                        {patient.details.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({patient.details.age} yrs • {patient.details.gender})
                      </span>
                      {patient.summary.emergency && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-extrabold text-[10px] uppercase border border-red-300">
                          ⚠️ Emergency Alert
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-1">
                      {patient.summary.chiefComplaint}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                      <span><Phone className="w-3 h-3 inline mr-1" />{patient.details.phone}</span>
                      <span><MapPin className="w-3 h-3 inline mr-1" />{patient.details.location}</span>
                      <span><Clock className="w-3 h-3 inline mr-1" />{new Date(patient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Open Summary Action */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                    patient.status === 'Emergency'
                      ? 'bg-red-100 text-red-700'
                      : patient.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {patient.status}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPatient(patient);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Summary</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Detail Modal / Drawer */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-blue-600 block">
                  Token #{selectedPatient.tokenNumber}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedPatient.details.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Emergency Banner if applicable */}
            {selectedPatient.summary.emergency && (
              <EmergencyBanner reason={selectedPatient.summary.emergencyReason} />
            )}

            {/* Editable Chief Complaint & Status */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Chief Complaint
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editedChiefComplaint}
                    onChange={(e) => setEditedChiefComplaint(e.target.value)}
                    className="w-full p-3 rounded-xl border border-blue-500 text-xs font-medium"
                  />
                ) : (
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white">
                    {selectedPatient.summary.chiefComplaint}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Queue Triage Status
                </label>
                {isEditing ? (
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value as PatientRecord['status'])}
                    className="w-full p-3 rounded-xl border border-blue-500 text-xs font-bold"
                  >
                    <option value="Waiting">Waiting</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  <span className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold ${
                    selectedPatient.status === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selectedPatient.status}
                  </span>
                )}
              </div>

              {/* Symptoms & Duration */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400 block">Extracted Symptoms:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedPatient.summary.symptoms.join(', ')}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block">Duration:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedPatient.summary.duration}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Summary
                </button>
              ) : (
                <button
                  onClick={handleSaveSummary}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              )}

              <button
                onClick={() => setSelectedPatient(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Modal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
