// Xenia Voice Engine (Reconocimiento y Síntesis de voz en Español Argentino)
export interface VoiceEngineState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  isSupported: boolean;
  isTtsSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  voiceEnabled: boolean;
}

// Clean markdown and symbols into natural fluent speech for Argentine female voice
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  let clean = text;

  // Remove markdown headers
  clean = clean.replace(/^#+\s+/gm, '');
  // Remove markdown bold and italics
  clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1');
  clean = clean.replace(/\*([^*]+)\*/g, '$1');
  clean = clean.replace(/__([^_]+)__/g, '$1');
  clean = clean.replace(/_([^_]+)_/g, '$1');
  // Remove markdown links [text](url) -> text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove code blocks and inline code
  clean = clean.replace(/```[\s\S]*?```/g, '');
  clean = clean.replace(/`([^`]+)`/g, '$1');
  // Remove blockquotes and bullet points
  clean = clean.replace(/^>\s+/gm, '');
  clean = clean.replace(/^[\*\-•]\s+/gm, '');
  clean = clean.replace(/^\d+\.\s+/gm, '');

  // Convert common hospitality abbreviations to spoken Argentine Spanish
  clean = clean.replace(/\bARS\b/g, 'pesos');
  clean = clean.replace(/\$([0-9.]+)\s*USD/g, '$1 dólares');
  clean = clean.replace(/\$([0-9.]+)\s*ARS/g, '$1 pesos');
  clean = clean.replace(/\bUSD\b/g, 'dólares');
  clean = clean.replace(/\bOTAs?\b/gi, 'agencias de reserva');
  clean = clean.replace(/\biCal\b/gi, 'ai cal');
  clean = clean.replace(/\bWi-?Fi\b/gi, 'guai fai');
  clean = clean.replace(/\b(\d{1,2})hs\b/gi, '$1 horas');
  clean = clean.replace(/\bpax\b/gi, 'personas');
  clean = clean.replace(/WhatsApp/gi, 'guatsap');
  clean = clean.replace(/Airbnb/gi, 'er bi en bi');
  clean = clean.replace(/Booking\.com/gi, 'buking');
  clean = clean.replace(/Booking/gi, 'buking');

  // Strip excessive emojis for speech synthesis clarity
  clean = clean.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ');

  // Clean extra whitespace and newlines
  clean = clean.replace(/\n+/g, '. ').replace(/\s+/g, ' ').trim();

  return clean;
}

// Find the best Argentine / Latin female voice available in the browser
export function getBestArgentineFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. First priority: Argentine female voices (es-AR with female names or markers)
  const esArFemale = voices.find(
    (v) =>
      (v.lang === 'es-AR' || v.lang === 'es_AR') &&
      /female|mujer|paulina|sabina|elena|victoria|luciana|camila|soledad|google español/i.test(v.name)
  );
  if (esArFemale) return esArFemale;

  // 2. Second priority: Any es-AR voice
  const esAr = voices.find((v) => v.lang === 'es-AR' || v.lang === 'es_AR');
  if (esAr) return esAr;

  // 3. Third priority: Latin American Spanish female voices (es-419, es-MX, es-CL, es-UY)
  const latinFemale = voices.find(
    (v) =>
      (v.lang.startsWith('es-419') ||
        v.lang.startsWith('es-MX') ||
        v.lang.startsWith('es-UY') ||
        v.lang.startsWith('es-CL') ||
        v.lang.startsWith('es-CO') ||
        v.lang.startsWith('es-US')) &&
      /female|mujer|paulina|sabina|lucia|mia|sofia|hilda|paloma|dalia|google/i.test(v.name)
  );
  if (latinFemale) return latinFemale;

  // 4. Fourth priority: Any Latin American Spanish voice
  const latinAny = voices.find(
    (v) =>
      v.lang.startsWith('es-419') ||
      v.lang.startsWith('es-MX') ||
      v.lang.startsWith('es-UY') ||
      v.lang.startsWith('es-CL') ||
      v.lang.startsWith('es-CO')
  );
  if (latinAny) return latinAny;

  // 5. Fifth priority: Any Spanish female voice (es-ES, etc.)
  const anyEsFemale = voices.find(
    (v) =>
      v.lang.startsWith('es') &&
      /female|mujer|monica|laura|elena|victoria|carmen|conchita|lucia/i.test(v.name)
  );
  if (anyEsFemale) return anyEsFemale;

  // 6. Fallback: Any Spanish voice
  const anySpanish = voices.find((v) => v.lang.startsWith('es'));
  if (anySpanish) return anySpanish;

  return voices[0] || null;
}

// Current active utterance tracker for cancellation
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Speak text using Argentine female parameters
export function speakXenia(
  rawText: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis no soportado en este navegador');
    return;
  }

  // Cancel any ongoing speech
  stopXeniaSpeech();

  const textToSpeak = cleanTextForSpeech(rawText);
  if (!textToSpeak) return;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  currentUtterance = utterance;

  const voice = getBestArgentineFemaleVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.lang = voice?.lang || 'es-AR';
  utterance.rate = 1.0; // Natural pace
  utterance.pitch = 1.08; // Warm female tone

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    options?.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
}

// Stop current speech
export function stopXeniaSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

// Check if currently speaking
export function isXeniaSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

// Get or set auto voice enabled in localStorage
export function getStoredVoiceAutoPlay(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('loomi_xenia_voice_autoplay');
  return stored !== null ? stored === 'true' : true;
}

export function setStoredVoiceAutoPlay(enabled: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('loomi_xenia_voice_autoplay', String(enabled));
  }
}
