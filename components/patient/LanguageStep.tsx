'use client';

import React from 'react';
import { Language } from '@/types';
import { Languages, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface LanguageStepProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onNext: () => void;
  onBack: () => void;
}

export function LanguageStep({ selectedLanguage, onSelectLanguage, onNext, onBack }: LanguageStepProps) {
  const languages: { id: Language; title: string; nativeTitle: string; description: string; flag: string }[] = [
    {
      id: 'gu',
      title: 'Gujarati',
      nativeTitle: 'ગુજરાતી',
      description: 'તમારી ભાષામાં સ્વાસ્થ્ય તકલીફો જણાવો',
      flag: '🇮🇳'
    },
    {
      id: 'hi',
      title: 'Hindi',
      nativeTitle: 'हिंदी',
      description: 'अपनी बीमारी और लक्षण हिंदी में लिखें या बोलें',
      flag: '🇮🇳'
    },
    {
      id: 'en',
      title: 'English',
      nativeTitle: 'English',
      description: 'Describe your symptoms in simple English',
      flag: '🌐'
    },
    {
      id: 'mixed',
      title: 'Mixed Language',
      nativeTitle: 'Hinglish / Gujlish',
      description: 'Mix Hindi/Gujarati & English as you speak daily',
      flag: '🗣️'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
          <Languages className="w-4 h-4" /> Step 1 of 4
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Choose Your Preferred Language
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select the language in which you will describe your health complaints.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {languages.map((lang) => {
          const isSelected = selectedLanguage === lang.id;
          return (
            <div
              key={lang.id}
              onClick={() => onSelectLanguage(lang.id)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-lg shadow-blue-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lang.flag}</span>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {lang.nativeTitle}
                    </h3>
                    <p className="text-xs font-medium text-slate-400">
                      {lang.title}
                    </p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-700 text-transparent'
                }`}>
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">
                {lang.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Step Navigation Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-transform hover:scale-105"
        >
          <span>Continue to Patient Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
