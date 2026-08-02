'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, PhoneCall, ShieldAlert } from 'lucide-react';

interface EmergencyBannerProps {
  reason?: string | null;
  rulesTriggered?: string[];
}

export function EmergencyBanner({ reason, rulesTriggered }: EmergencyBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 rounded-3xl shadow-xl shadow-red-500/25 border-2 border-red-400/40 my-4"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-white font-bold shadow-inner">
            <AlertTriangle className="w-8 h-8 text-yellow-300 animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white text-red-700 font-black text-xs tracking-wider uppercase shadow-sm">
                ⚠ EMERGENCY INDICATORS DETECTED
              </span>
              <span className="text-xs text-red-100 font-semibold bg-red-900/60 px-2.5 py-0.5 rounded-md">
                Rule Engine Triggered
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
              {reason || 'Chest pain together with breathing difficulty requires immediate professional medical attention.'}
            </h3>

            <p className="text-xs text-red-100 font-medium pt-1">
              This is <strong>NOT</strong> a diagnosis. Please seek emergency medical care immediately.
            </p>

            {rulesTriggered && rulesTriggered.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {rulesTriggered.map((rule, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-red-900/80 text-red-100 text-xs font-bold border border-red-400/40">
                    • {rule}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Emergency Call CTA Button */}
        <div className="shrink-0 w-full md:w-auto">
          <a
            href="tel:108"
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-red-50 text-red-700 font-black text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all hover:scale-105 animate-pulse"
          >
            <PhoneCall className="w-5 h-5 text-red-600 animate-bounce" />
            <span>CALL EMERGENCY 108</span>
          </a>
        </div>

      </div>

      <div className="text-[11px] text-red-200 mt-4 border-t border-red-400/30 pt-2 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>NOTE: SevaSaar AI does not generate medical diagnoses. Emergency alerts are evaluated by deterministic safety rules to expedite human medical triage.</span>
      </div>
    </motion.div>
  );
}
