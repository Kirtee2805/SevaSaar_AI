/**
 * ==============================================================================
 * SEVASAAR AI • LANGUAGE DICTIONARY & PROMPT CONFIG (Vanilla JS)
 * ==============================================================================
 */

export const LANGUAGES = {
  gu: {
    id: 'gu',
    title: 'Gujarati',
    nativeTitle: 'ગુજરાતી',
    flag: '🇮🇳',
    bcp47: 'gu-IN',
    description: 'તમારી ભાષામાં સ્વાસ્થ્ય તકલીફો જણાવો',
    inputTitle: 'તમારી સ્વાસ્થ્ય સમસ્યા અહીં વર્ણવો (Gujarati)',
    placeholder: 'ઉદાહરણ: છેલ્લા ૨ દિવસથી છાતીમાં દુખાવો અને શ્વાસ ચડે છે...',
    sample: 'છેલ્લા ૨ દિવસથી છાતીમાં સખત દુખાવો થાય છે અને શ્વાસ લેવામાં તકલીફ પડે છે. બીપી ની દવા બંધ છે.'
  },
  hi: {
    id: 'hi',
    title: 'Hindi',
    nativeTitle: 'हिंदी',
    flag: '🇮🇳',
    bcp47: 'hi-IN',
    description: 'अपनी बीमारी और लक्षण हिंदी में लिखें या बोलें',
    inputTitle: 'अपनी बीमारी की जानकारी लिखें या बोलें (Hindi)',
    placeholder: 'उदाहरण: मुझे पिछले ३ दिनों से तेज़ बुखार है और गले में दर्द है...',
    sample: 'मुझे पिछले 3 दिनों से तेज़ बुखार है, सिरदर्द है और सांस फूल रही है।'
  },
  en: {
    id: 'en',
    title: 'English',
    nativeTitle: 'English',
    flag: '🌐',
    bcp47: 'en-IN',
    description: 'Describe your symptoms in simple English',
    inputTitle: 'Describe your health problem in detail (English)',
    placeholder: 'Example: I have severe chest pressure and shortness of breath since yesterday...',
    sample: 'Severe chest pain for 2 days along with shortness of breath when walking.'
  },
  mixed: {
    id: 'mixed',
    title: 'Mixed Language',
    nativeTitle: 'Hinglish / Gujlish',
    flag: '🗣️',
    bcp47: 'hi-IN',
    description: 'Mix Hindi/Gujarati & English as you speak daily',
    inputTitle: 'Describe symptoms naturally (Mixed / Hinglish / Gujlish)',
    placeholder: 'Example: Mujhe 2 days se severe headache and shortness of breath hai...',
    sample: 'Sir 2 days se chest pain and breathing difficulty hai. BP tablet li thi.'
  }
};

/**
 * Client-side script detector for immediate typing UI feedback
 */
export function detectScriptClient(text) {
  if (!text || !text.trim()) return 'mixed';
  const norm = text.trim().toLowerCase();

  const gujarati = /[\u0A80-\u0AFF]/;
  const devanagari = /[\u0900-\u097F]/;
  const latin = /[a-z]/;

  const hasGu = gujarati.test(norm);
  const hasHi = devanagari.test(norm);
  const hasEn = latin.test(norm);

  if ((hasGu && hasHi) || (hasGu && hasEn) || (hasHi && hasEn)) return 'mixed';
  if (hasGu) return 'gu';
  if (hasHi) return 'hi';
  if (hasEn) return 'en';
  return 'mixed';
}
