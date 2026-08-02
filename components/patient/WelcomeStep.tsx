'use client';

import React from 'react';
import { Language } from '@/types';
import { Sparkles, ArrowRight, ShieldCheck, Languages, Stethoscope, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface WelcomeStepProps {
  onStart: () => void;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

export function WelcomeStep({ onStart, selectedLanguage, onSelectLanguage }: WelcomeStepProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs sm:text-sm font-semibold border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Multilingual AI Patient Intake Assistant</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Describe Your Health Concerns in Your{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600">
            Native Language
          </span>
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
          SevaSaar AI converts your voice or text in Gujarati, Hindi, English, or Hinglish into a structured medical intake summary for your doctor.
        </p>

        {/* Quick Language Picker Pills */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Languages className="w-4 h-4" /> Available Languages:
          </span>

          <button
            onClick={() => onSelectLanguage('gu')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedLanguage === 'gu'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ગુજરાતી (Gujarati)
          </button>

          <button
            onClick={() => onSelectLanguage('hi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedLanguage === 'hi'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            हिंदी (Hindi)
          </button>

          <button
            onClick={() => onSelectLanguage('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedLanguage === 'en'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            English
          </button>

          <button
            onClick={() => onSelectLanguage('mixed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedLanguage === 'mixed'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Mixed Language
          </button>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-4">
          <button
            onClick={onStart}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-extrabold text-lg shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 mx-auto transition-transform hover:scale-105"
          >
            <span>Start Patient Assessment</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Languages className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Multilingual Natural Speech</h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            Speak or type naturally in Gujarati, Hindi, or Hinglish. No complex medical terminology needed.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Structured Clinical Summaries</h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            Automatically extracts symptoms, duration, current medicines, known allergies, and missing details.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Emergency Rule Safety Engine</h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            Flags critical triage warnings like chest pain, heavy bleeding, or stroke signs for immediate doctor care.
          </p>
        </div>
      </div>

      {/* Safety & Compliance Notice Card */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-bold text-slate-900 dark:text-slate-200">
            HOSPITAL SAFETY NOTICE
          </p>
          <p>
            SevaSaar AI is an administrative intake tool. It <strong>DOES NOT generate medical diagnoses, treatment plans, or medicine prescriptions</strong>. All assessment records must be verified by a licensed medical practitioner.
          </p>
        </div>
      </div>

    </div>
  );
}
