'use client';

import React from 'react';
import { CheckCircle2, Clock, Globe, Cpu } from 'lucide-react';
import { Language } from '@/types';

interface AIStatusCardProps {
  language: Language;
  processingTimeSeconds?: number;
  modelName?: string;
}

export function AIStatusCard({
  language,
  processingTimeSeconds = 1.2,
  modelName = 'Google Gemma AI'
}: AIStatusCardProps) {
  const languageNames: Record<Language, string> = {
    gu: 'Gujarati (ગુજરાતી)',
    hi: 'Hindi (हिंदी)',
    en: 'English',
    mixed: 'Mixed (Hinglish / Gujlish)'
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-blue-500/30 shadow-md flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
            ✓ AI Extraction Complete
          </span>
          <span className="text-xs text-slate-300 font-medium">
            Structured clinical facts generated safely without medical diagnosis
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Lang:</span>
          <span className="text-white font-extrabold">{languageNames[language] || 'Multilingual'}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Latency:</span>
          <span className="text-white font-extrabold">{processingTimeSeconds}s</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Model:</span>
          <span className="text-white font-extrabold">{modelName}</span>
        </div>
      </div>
    </div>
  );
}
