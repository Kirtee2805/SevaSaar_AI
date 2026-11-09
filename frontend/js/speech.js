/**
 * ==============================================================================
 * SEVASAAR AI • BROWSER WEB SPEECH API CONTROLLER (Vanilla JS)
 * ==============================================================================
 */

import { LANGUAGES } from './language.js';

export class SpeechController {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.baseText = '';
  }

  isSupported() {
    return Boolean(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
    );
  }

  start({ language = 'gu', initialText = '', onResult, onError, onEnd }) {
    if (!this.isSupported()) {
      if (onError) onError('Voice recognition is not supported in this browser. Please type manually.');
      return;
    }

    if (this.isRecording && this.recognition) {
      this.stop();
      return;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionClass();

    const langConfig = LANGUAGES[language] || LANGUAGES.en;
    this.recognition.lang = langConfig.bcp47;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.baseText = initialText ? initialText.trim() + ' ' : '';

    this.recognition.onstart = () => {
      this.isRecording = true;
    };

    this.recognition.onresult = (event) => {
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

      const combinedText = (this.baseText + finalTranscript + interimTranscript).trim().replace(/\s{2,}/g, ' ');
      if (onResult) {
        onResult(combinedText, finalTranscript, interimTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('[WebSpeechAPI] Error occurred:', event.error);
      this.isRecording = false;

      let userMsg = `Voice recognition error: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        userMsg = 'Microphone access denied. Please grant microphone permissions in browser settings.';
      } else if (event.error === 'no-speech') {
        userMsg = 'No speech detected. Click the microphone icon to try again.';
      }

      if (onError) onError(userMsg);
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.error('[WebSpeechAPI] Failed to start:', err);
      this.isRecording = false;
      if (onError) onError('Could not initialize microphone. Please type manually.');
    }
  }

  stop() {
    if (this.recognition && this.isRecording) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('[WebSpeechAPI] Stop error:', err);
      }
      this.isRecording = false;
    }
  }
}
