'use client';

import React from 'react';
import { PatientRecord } from '@/types';
import { CheckCircle2, Ticket, Home, PlusCircle, ArrowRight, ShieldCheck, Clock, Hospital } from 'lucide-react';

interface ConfirmationStepProps {
  record: PatientRecord;
  onReturnHome: () => void;
  onNewAssessment: () => void;
}

export function ConfirmationStep({ record, onReturnHome, onNewAssessment }: ConfirmationStepProps) {
  return (
    <div className="max-w-2xl mx-auto my-8 text-center space-y-8 animate-fade-in">
      
      {/* Success Badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
        <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
          Intake Assessment Submitted!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your medical summary has been transmitted to hospital reception and the doctor's queue.
        </p>
      </div>

      {/* Token Card */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 text-white p-8 rounded-3xl shadow-2xl shadow-blue-500/25 relative overflow-hidden text-left space-y-6">
        <div className="flex items-center justify-between border-b border-white/20 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-200 block">
              Patient Queue Token
            </span>
            <h3 className="text-4xl font-black tracking-tight mt-1 text-white">
              {record.tokenNumber}
            </h3>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-blue-200 block">Patient Name:</span>
            <span className="font-bold text-sm text-white">{record.details.name}</span>
          </div>

          <div>
            <span className="text-blue-200 block">Triage Status:</span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs mt-0.5 ${
              record.status === 'Emergency' ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-400 text-slate-900'
            }`}>
              {record.status === 'Emergency' ? '⚠️ IMMEDIATE PRIORITY' : 'Standard Queue'}
            </span>
          </div>

          <div>
            <span className="text-blue-200 block">Assigned Doctor / Bay:</span>
            <span className="font-semibold text-white">{record.assignedDoctor}</span>
          </div>

          <div>
            <span className="text-blue-200 block">Estimated Wait Time:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {record.status === 'Emergency' ? '0 mins (Direct Entry)' : '~10-15 mins'}
            </span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-[11px] text-blue-100 flex items-center gap-2">
          <Hospital className="w-4 h-4 shrink-0" />
          <span>Please take a seat in OPD Waiting Lounge. Your token will be called on the display screen.</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onReturnHome}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </button>

        <button
          onClick={onNewAssessment}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Patient Assessment</span>
        </button>
      </div>

    </div>
  );
}
