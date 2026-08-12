import { Language } from '@/types';

export interface SpeechTranscriptResult {
  transcription: string;
  detectedLanguage: Language | 'mixed';
  confidence?: number;
  source: 'browser' | 'external';
}

export interface SpeechRecognitionConfig {
  language: Language;
  interimResults?: boolean;
  continuous?: boolean;
}

const languageHints: Record<Language, string> = {
  gu: 'gu-IN',
  hi: 'hi-IN',
  en: 'en-IN',
  mixed: 'hi-IN'
};

export function getSpeechRecognitionLanguage(language: Language): string {
  return languageHints[language] ?? 'en-IN';
}

export function detectPatientLanguage(text: string): Language | 'mixed' {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return 'mixed';

  const gujaratiSigns = /[ઇઈઉઊએઐઓઔઅઆકખગઘચછજઝટઠડઢતથદધનપફબભમયરલવશષસહ]/;
  const hindiSigns = /[अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह]/;

  const hasGujarati = gujaratiSigns.test(normalized);
  const hasHindi = hindiSigns.test(normalized);
  const hasEnglish = /[a-z]/.test(normalized);

  if ((hasGujarati && hasHindi) || (hasGujarati && hasEnglish) || (hasHindi && hasEnglish)) {
    return 'mixed';
  }
  if (hasGujarati) return 'gu';
  if (hasHindi) return 'hi';
  if (hasEnglish) return 'en';
  return 'mixed';
}

export function isBrowserSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition
  );
}

export function buildSpeechRecognitionConfig(language: Language): SpeechRecognitionConfig {
  return {
    language,
    interimResults: true,
    continuous: true,
  };
}

export function normalizeSpeechTranscription(transcription: string): string {
  return transcription.trim().replace(/\s{2,}/g, ' ');
}

export function createSpeechTranscriptResult(
  transcription: string,
  detectedLanguage: Language | 'mixed',
  source: 'browser' | 'external',
  confidence?: number
): SpeechTranscriptResult {
  return {
    transcription: normalizeSpeechTranscription(transcription),
    detectedLanguage,
    confidence,
    source,
  };
}
