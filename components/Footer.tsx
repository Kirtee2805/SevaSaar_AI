'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        
        {/* About SevaSaar */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-lg text-white">SevaSaar AI</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            SevaSaar AI (सेवासार) is a multilingual patient intake and triage assistant designed for hospitals and rural health centers. Built for seamless patient communication in Gujarati, Hindi, English, and Hinglish.
          </p>
        </div>

        {/* Clinical Boundaries Disclaimer */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-2 text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>CLINICAL SAFETY DISCLAIMER</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            SevaSaar AI <strong className="text-white">DOES NOT diagnose diseases</strong>, prescribe medicines, or provide medical treatment plans. It strictly structures patient complaints and flags emergency safety indicators for human medical triage.
          </p>
        </div>

        {/* Emergency & Tech Note */}
        <div>
          <h4 className="font-bold text-white mb-2 text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Prepared for Gemma AI Integration</span>
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Frontend powered by Next.js 15, Tailwind CSS, & TypeScript. Prepared for Google Gemma 2/3 LLM backend endpoint integration.
          </p>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for Indian Healthcare
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} SevaSaar AI Healthcare Portal • All rights reserved.
      </div>
    </footer>
  );
}
