'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Sparkles, Languages, HeartPulse, ShieldAlert, Cpu } from 'lucide-react';

interface LoadingStepProps {
  onComplete: () => void;
}

export function LoadingStep({ onComplete }: LoadingStepProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const messages = [
    'Understanding your language...',
    'Extracting symptoms & duration...',
    'Checking missing clinical information...',
    'Evaluating emergency safety rules...',
    'Preparing structured summary...',
    'Almost done...'
  ];

  const steps = [
    { title: 'Understanding language & speech patterns...', icon: Languages },
    { title: 'Extracting chief complaints & symptom duration...', icon: HeartPulse },
    { title: 'Evaluating emergency rule engine triggers...', icon: ShieldAlert },
    { title: 'Preparing structured doctor summary & missing info alerts...', icon: Sparkles }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete, messages.length]);

  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / messages.length) * 100));

  return (
    <div className="max-w-md mx-auto my-12 text-center space-y-8 animate-fade-in">
      
      {/* Central Pulsing Animation */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 dark:bg-blue-500/10 animate-ping" />
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/30">
          <HeartPulse className="w-12 h-12 animate-pulse" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Cpu className="w-6 h-6 text-blue-600 animate-spin" />
          <span>Gemma AI Processing Intake</span>
        </h2>

        {/* Rotating Message Banner */}
        <div className="h-8 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-extrabold text-blue-600 dark:text-blue-400"
            >
              {messages[currentStepIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full"
          />
        </div>
      </div>

      {/* Animated Step List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isDone = idx < Math.floor((currentStepIndex / messages.length) * steps.length);
          const isCurrent = idx === Math.floor((currentStepIndex / messages.length) * steps.length);

          return (
            <div
              key={idx}
              className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all ${
                isCurrent
                  ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                  : isDone
                  ? 'text-slate-700 dark:text-slate-300 font-medium'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <StepIcon className="w-4 h-4 opacity-75" />
                <span>{step.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 italic">
        Powered by SevaSaar Clinical Rule Engine & Gemma AI Architecture
      </p>

    </div>
  );
}
