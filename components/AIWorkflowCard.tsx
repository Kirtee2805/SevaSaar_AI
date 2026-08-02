'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Cpu, FileCheck2, ShieldAlert, UserCheck, Stethoscope } from 'lucide-react';

export function AIWorkflowCard() {
  const steps = [
    { name: 'Patient Input', icon: MessageSquare, desc: 'Multilingual Voice/Text' },
    { name: 'Gemma AI', icon: Cpu, desc: 'Fact Extraction' },
    { name: 'Structured Summary', icon: FileCheck2, desc: 'JSON Output' },
    { name: 'Rule Engine', icon: ShieldAlert, desc: 'Safety Check' },
    { name: 'Receptionist', icon: UserCheck, desc: 'Verification' },
    { name: 'Doctor Review', icon: Stethoscope, desc: 'Clinical Care' },
  ];

  return (
    <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>AI Intake & Triage Pipeline Workflow</span>
        </h4>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-bold">
          Build with Gemma Architecture
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-center space-y-1.5 flex flex-col items-center justify-center relative group hover:border-blue-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-xs block text-slate-100 leading-tight">
                  {step.name}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {step.desc}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
