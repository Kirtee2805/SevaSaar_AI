'use client';

import React from 'react';
import { Role, Language } from '@/types';
import { Stethoscope, User, ShieldCheck, PhoneCall, HeartPulse, Sparkles, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  currentLanguage?: Language;
  isEmergency?: boolean;
}

export function Header({ currentRole, onSelectRole, currentLanguage = 'en', isEmergency = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => onSelectRole('patient')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
                SevaSaar AI
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" /> Intake Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              सेवासार • Multilingual Patient Intake & Triage
            </p>
          </div>
        </div>

        {/* Role Switcher & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Role Navigation Pills */}
          <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => onSelectRole('patient')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                currentRole === 'patient'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient</span>
            </button>

            <button
              onClick={() => onSelectRole('receptionist')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                currentRole === 'receptionist'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Receptionist</span>
            </button>

            <button
              onClick={() => onSelectRole('doctor')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                currentRole === 'doctor'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor</span>
            </button>
          </div>

          {/* Conditional Emergency / Help Button */}
          {isEmergency ? (
            <a
              href="tel:108"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-lg shadow-red-500/30 animate-pulse border border-red-400 transition-all hover:scale-105"
              title="Emergency Rules Triggered - Call 108 Immediately"
            >
              <PhoneCall className="w-4 h-4 animate-bounce text-white" />
              <span>Emergency 108</span>
            </a>
          ) : (
            <a
              href="#help"
              onClick={(e) => {
                e.preventDefault();
                alert('SevaSaar AI Help Center: Please select your language and describe your symptoms to generate a structured medical summary.');
              }}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all"
              title="SevaSaar Help Center"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Help</span>
            </a>
          )}
        </div>

      </div>
    </header>
  );
}
