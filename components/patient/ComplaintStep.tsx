'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Language } from '@/types';
import { MessageSquareText, Mic, MicOff, UploadCloud, Sparkles, ArrowRight, ArrowLeft, AlertCircle, FileCheck } from 'lucide-react';

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface ComplaintStepProps {
  language: Language;
  rawComplaint: string;
  onChangeComplaint: (text: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function ComplaintStep({ language, rawComplaint, onChangeComplaint, onSubmit, onBack }: ComplaintStepProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTextRef = useRef<string>('');

  const languagePrompt: Record<Language, { title: string; placeholder: string; sample: string; bcp47: string; langName: string }> = {
    gu: {
      title: 'તમારી સ્વાસ્થ્ય સમસ્યા અહીં વર્ણવો (Gujarati)',
      placeholder: 'ઉદાહરણ: છેલ્લા ૨ દિવસથી છાતીમાં દુખાવો અને શ્વાસ ચડે છે...',
      sample: 'છેલ્લા ૨ દિવસથી છાતીમાં સખત દુખાવો થાય છે અને શ્વાસ લેવામાં તકલીફ પડે છે. બીપી ની દવા બંધ છે.',
      bcp47: 'gu-IN',
      langName: 'Gujarati'
    },
    hi: {
      title: 'अपनी बीमारी की जानकारी लिखें या बोलें (Hindi)',
      placeholder: 'उदाहरण: मुझे पिछले ३ दिनों से तेज़ बुखार है और गले में दर्द है...',
      sample: 'मुझे पिछले 3 दिनों से तेज़ बुखार है, सिरदर्द है और सांस फूल रही है।',
      bcp47: 'hi-IN',
      langName: 'Hindi'
    },
    en: {
      title: 'Describe your health problem in detail (English)',
      placeholder: 'Example: I have severe chest pressure and shortness of breath since yesterday...',
      sample: 'Severe chest pain for 2 days along with shortness of breath when walking.',
      bcp47: 'en-IN',
      langName: 'English'
    },
    mixed: {
      title: 'Describe symptoms naturally (Mixed Language / Hinglish / Gujlish)',
      placeholder: 'Example: Mujhe 2 days se severe headache and shortness of breath hai...',
      sample: 'Sir 2 days se chest pain and breathing difficulty hai. BP tablet li thi.',
      bcp47: 'hi-IN',
      langName: 'Mixed (Hindi/Gujarati/English)'
    }
  };

  const currentPrompt = languagePrompt[language] || languagePrompt.en;

  // Check Web Speech API availability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        setIsSupported(false);
      }
    }
  }, []);

  // Update recognition language if language selection changes mid-session
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentPrompt.bcp47;
    }
  }, [currentPrompt.bcp47]);

  // Clean up recognition instance on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Toggle Web Speech API voice recognition
  const toggleVoiceInput = () => {
    setErrorMessage(null);

    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      setErrorMessage('Voice recognition is unavailable in this browser. Please enter text manually.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        setIsRecording(false);
      }
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentPrompt.bcp47;

      baseTextRef.current = rawComplaint ? rawComplaint.trim() + ' ' : '';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const newText = baseTextRef.current + finalTranscript + interimTranscript;
        onChangeComplaint(newText);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('[WebSpeechAPI] Recognition Error:', event.error);
        setIsRecording(false);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access denied. Please grant microphone permissions in browser settings.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Tap microphone to try recording again.');
        } else {
          setErrorMessage(`Voice recognition error: ${event.error}. You can type manually.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[WebSpeechAPI] Initialization Error:', err);
      setIsRecording(false);
      setErrorMessage('Failed to start microphone. You can type manually.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
          <MessageSquareText className="w-4 h-4" /> Step 3 of 4
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Describe Your Health Concerns
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Type or use voice input to explain your pain, symptoms, and medicines.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Prompt Header */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{currentPrompt.title}</span>
          </label>
          <span className="text-xs font-semibold text-slate-400">
            {rawComplaint.length} characters
          </span>
        </div>

        {/* Textarea Input */}
        <div className="relative">
          <textarea
            rows={6}
            value={rawComplaint}
            onChange={(e) => onChangeComplaint(e.target.value)}
            placeholder={currentPrompt.placeholder}
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-base leading-relaxed resize-y transition-all"
          />

          {/* Quick Insert Sample Button */}
          {!rawComplaint && (
            <button
              type="button"
              onClick={() => onChangeComplaint(currentPrompt.sample)}
              className="absolute bottom-4 right-4 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold px-3 py-1.5 rounded-xl transition-colors"
            >
              + Use Sample Complaint
            </button>
          )}
        </div>

        {/* Permission / Unsupported Error Notification */}
        {(errorMessage || !isSupported) && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              {!isSupported
                ? 'Voice input is not supported in this browser. You can type your complaint in the box above.'
                : errorMessage}
            </span>
          </div>
        )}

        {/* Input Method Options: Voice Input & Upload Reports */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Web Speech API Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
              isRecording
                ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 animate-pulse'
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${
              isRecording ? 'bg-red-500 text-white scale-110' : 'bg-blue-600 text-white'
            }`}>
              {isRecording ? <MicOff className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xs block">
                {isRecording ? 'Listening... Speak now' : `Voice Input (${currentPrompt.langName})`}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {isRecording ? 'Converting speech to text...' : 'Tap to speak or tap again to stop'}
              </span>
            </div>
          </button>

          {/* File Upload Placeholder */}
          <label className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 flex items-center gap-3 cursor-pointer transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              {uploadedFile ? <FileCheck className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
            </div>
            <div className="text-left overflow-hidden">
              <span className="font-extrabold text-xs block truncate">
                {uploadedFile ? uploadedFile : 'Upload Previous Lab Report'}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {uploadedFile ? 'Report attached successfully' : 'PDF, JPG or PNG (Optional)'}
              </span>
            </div>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

        </div>

        {/* Step Navigation Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!rawComplaint.trim()}
            className={`px-7 py-3.5 rounded-xl font-extrabold text-sm shadow-xl flex items-center gap-2 transition-all ${
              rawComplaint.trim()
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20 hover:scale-105'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Generate Doctor Summary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
