/**
 * ==============================================================================
 * DETERMINISTIC EMERGENCY SAFETY RULE ENGINE (lib/emergencyRules.ts)
 * ==============================================================================
 *
 * Evaluates predefined deterministic safety rules ONLY.
 * Does NOT use AI for emergency detection.
 * Fully decoupled from Gemma.
 *
 * Rules Evaluated:
 * 1. Chest Pain AND Breathing Difficulty
 * 2. Heavy Bleeding
 * 3. Loss of Consciousness
 * 4. Stroke Symptoms
 */

export interface EmergencyRulesResult {
  emergency: boolean;
  reason?: string;
  isEmergency?: boolean;
  rulesTriggered?: string[];
}

/**
 * Evaluates deterministic emergency rules against patient symptoms and description.
 *
 * @param rawText - Raw patient complaint text or description.
 * @param symptoms - Array of symptoms extracted from intake text.
 * @returns Object indicating emergency status boolean and reason string.
 */
export function checkEmergencyRules(
  rawText: string = '',
  symptoms: string[] = []
): EmergencyRulesResult {
  const inputToEvaluate = `${rawText} ${symptoms.join(' ')}`.toLowerCase();

  // Keyword banks across Gujarati, Hindi, English, and Hinglish/Gujlish
  const chestPainKeywords = [
    'chest pain', 'chest pressure', 'chest tightness', 'heart pain',
    'छाती में दर्द', 'छाती में जकड़न', 'છાતીમાં દુખાવો', 'છાતીમાં દબાણ',
    'chhati ma dukhavo', 'chhati pain'
  ];

  const breathingKeywords = [
    'breathing difficulty', 'shortness of breath', 'difficulty breathing', 'breathless',
    'सांस लेने में तकलीफ', 'सांस फूलना', 'શ્વાસ લેવામાં તકલીફ', 'શ્વાસ ચડવો',
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

  // Rule 1: Chest Pain AND Breathing Difficulty (both required)
  const hasChestPain = chestPainKeywords.some(kw => inputToEvaluate.includes(kw));
  const hasBreathingDifficulty = breathingKeywords.some(kw => inputToEvaluate.includes(kw));
  const isRule1 = hasChestPain && hasBreathingDifficulty;

  // Rule 2: Heavy Bleeding
  const isRule2 = heavyBleedingKeywords.some(kw => inputToEvaluate.includes(kw));

  // Rule 3: Loss of Consciousness
  const isRule3 = consciousnessKeywords.some(kw => inputToEvaluate.includes(kw));

  // Rule 4: Stroke Symptoms
  const isRule4 = strokeKeywords.some(kw => inputToEvaluate.includes(kw));

  const isEmergency = isRule1 || isRule2 || isRule3 || isRule4;

  const rulesTriggered: string[] = [];
  if (isRule1) rulesTriggered.push('Chest Pain AND Breathing Difficulty');
  if (isRule2) rulesTriggered.push('Heavy Bleeding');
  if (isRule3) rulesTriggered.push('Loss of Consciousness');
  if (isRule4) rulesTriggered.push('Stroke Symptoms');

  if (isEmergency) {
    return {
      emergency: true,
      reason: 'Immediate Professional Medical Attention Recommended',
      isEmergency: true,
      rulesTriggered
    };
  }

  return {
    emergency: false,
    isEmergency: false,
    rulesTriggered: []
  };
}
