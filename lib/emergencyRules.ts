/**
 * ============================================================================
 * DETERMINISTIC EMERGENCY SAFETY RULE ENGINE (lib/emergencyRules.ts)
 * ============================================================================
 *
 * Evaluates predefined deterministic emergency rules only.
 * Does NOT depend on the GenAI model for safety decisions.
 */

export interface EmergencyRulesResult {
  isEmergency: boolean;
  matchedRules: string[];
  priority: 'IMMEDIATE' | 'URGENT' | 'ROUTINE';
  message: string;
}

export function checkEmergencyRules(
  rawText: string = '',
  symptoms: string[] = [],
  speechTranscript: string = ''
): EmergencyRulesResult {
  const textToEvaluate = [rawText, speechTranscript, symptoms.join(' ')].filter(Boolean).join(' ').toLowerCase();

  const chestPainKeywords = [
    'chest pain', 'chest pressure', 'chest tightness', 'heart pain',
    'छाती में दर्द', 'छाती में जकड़न', 'છાતીમાં દુખાવો', 'છાતીમાં દબાણ',
    'chhati ma dukhavo', 'chhati pain'
  ];

  const breathingKeywords = [
    'breathing difficulty', 'shortness of breath', 'difficulty breathing', 'breathless',
    'सांस लेने में तकलीफ', 'सांस फूलना', 'શ્વાસ મેળવવામાં તકલીફ', 'શ્વાસ ચડવો',
    'saans me taklif', 'shwas'
  ];

  const heavyBleedingKeywords = [
    'heavy bleeding', 'profuse bleeding', 'blood loss', 'coughing blood', 'vomiting blood', 'uncontrolled bleeding',
    'भारी खून बहना', 'खून की उल्टी', 'खून आना',
    'વધારે લોહી વહેવું', 'લોહીની ઉલટી', 'લોહી નીકળવું'
  ];

  const consciousnessKeywords = [
    'loss of consciousness', 'unconscious', 'fainted', 'fainting', 'blackout', 'passed out',
    'बेहोश', 'बेहोशी', 'चक्कर आ के गिरना',
    'બેભાન', 'ચક્કર આવીને પડી જવું', 'બેભાન થવું'
  ];

  const strokeKeywords = [
    'stroke', 'slurred speech', 'facial droop', 'face drooping', 'arm weakness', 'sudden paralysis',
    'लकवा', 'बोली बंद', 'मुंह टेढ़ा', 'हाथ पैर में कमजोरी',
    'લકવો', 'મોં વાંકુ', 'બોલવામાં તકલીફ', 'અચાનક નબળાઈ'
  ];

  const traumaKeywords = [
    'head trauma', 'head injury', 'severe head injury', 'skull fracture', 'concussion',
    'सिर में चोट', 'सिर पर चोट', 'માથામાં ચોટ', 'માથાનો ઈજા',
    'head injury', 'brain injury'
  ];

  const seizureKeywords = [
    'seizure', 'convulsion', 'fits', 'shaking uncontrollably', 'tonic-clonic',
    'दौरा', 'दौरे', 'झटके', 'કંપન', 'દોળતા'
  ];

  const matchedRules: string[] = [];
  const hasChestPain = chestPainKeywords.some(kw => textToEvaluate.includes(kw));
  const hasBreathingDifficulty = breathingKeywords.some(kw => textToEvaluate.includes(kw));
  if (hasChestPain && hasBreathingDifficulty) {
    matchedRules.push('Chest pain with breathing difficulty');
  }

  if (heavyBleedingKeywords.some(kw => textToEvaluate.includes(kw))) {
    matchedRules.push('Heavy or uncontrolled bleeding');
  }

  if (consciousnessKeywords.some(kw => textToEvaluate.includes(kw))) {
    matchedRules.push('Loss of consciousness / fainting');
  }

  if (strokeKeywords.some(kw => textToEvaluate.includes(kw))) {
    matchedRules.push('Stroke warning signs');
  }

  if (traumaKeywords.some(kw => textToEvaluate.includes(kw))) {
    matchedRules.push('Severe head trauma');
  }

  if (seizureKeywords.some(kw => textToEvaluate.includes(kw))) {
    matchedRules.push('Convulsions / seizures');
  }

  const isEmergency = matchedRules.length > 0;

  return {
    isEmergency,
    matchedRules,
    priority: isEmergency ? 'IMMEDIATE' : 'ROUTINE',
    message: isEmergency
      ? '⚠️ Immediate Professional Medical Attention Recommended'
      : 'No emergency rule matched. Continue with standard intake review.'
  };
}
