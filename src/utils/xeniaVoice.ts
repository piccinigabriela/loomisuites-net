// Xenia Voice Engine (Reconocimiento y Síntesis de voz en Español Latinoamericano)

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

// Clean markdown and symbols into natural fluent speech for Latin American Spanish female voice
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

  // Convert common hospitality abbreviations to spoken Latin American Spanish
  // Pre-emptively convert large sums with dollar signs to "pesos" or "mil pesos"
  clean = clean.replace(/\$45\.000/g, '45 mil pesos');
  clean = clean.replace(/\$60\.000/g, '60 mil pesos');
  clean = clean.replace(/\$80\.000/g, '80 mil pesos');
  clean = clean.replace(/\$45000/g, '45 mil pesos');
  clean = clean.replace(/\$60000/g, '60 mil pesos');
  clean = clean.replace(/\$80000/g, '80 mil pesos');

  // Replace any dollar amounts >= 1000 with pesos, e.g. $45.000 -> 45 mil pesos
  clean = clean.replace(/\$(\d{2,3})\.(\d{3})\b/g, '$1 mil pesos');
  clean = clean.replace(/\$(\d{2,3})\,(\d{3})\b/g, '$1 mil pesos');
  clean = clean.replace(/\$(\d{4,9})\b/g, '$1 pesos');

  clean = clean.replace(/\bARS\b/g, 'pesos');
  clean = clean.replace(/\$([0-9.]+)\s*USD/g, '$1 dólares');
  clean = clean.replace(/\$([0-9.]+)\s*ARS/g, '$1 pesos');
  clean = clean.replace(/\bUSD\b/g, 'dólares');

  // Convert smaller dollar amounts (like $80, $150) under 1000 to "dólares"
  clean = clean.replace(/\$(\d{1,3})\b/gi, '$1 dólares');

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

// Check if a voice is from Spain (es-ES) to strictly avoid European Spanish pronunciation
export function isSpainVoice(voice: SpeechSynthesisVoice): boolean {
  if (!voice) return false;
  const lang = (voice.lang || '').toLowerCase();
  const name = (voice.name || '').toLowerCase();
  return (
    lang === 'es-es' ||
    lang === 'es_es' ||
    name.includes('spain') ||
    name.includes('españa') ||
    name.includes('castilian') ||
    name.includes('castellano (españa)') ||
    name.includes('monica') ||
    name.includes('conchita') ||
    name.includes('enrique') ||
    name.includes('manuel') ||
    name.includes('jorge')
  );
}

// Check if a voice is female by name or markers
export function isFemaleVoice(voice: SpeechSynthesisVoice): boolean {
  if (!voice) return false;
  const name = (voice.name || '').toLowerCase();
  return (
    /female|mujer|paulina|sabina|dalia|mia|paola|paloma|elena|salome|catalina|luciana|camila|soledad|sofia|hilda|lupe|victoria|valeria|jimena|clara|rosa|alva/i.test(
      name
    ) ||
    /natural.*(mexico|united states|colombia|chile|argentina)/i.test(name)
  );
}

// Check if a voice is Latin American Spanish (es-419, es-MX, es-US, es-AR, es-CO, es-CL, etc.)
export function isLatinSpanishVoice(voice: SpeechSynthesisVoice): boolean {
  if (!voice) return false;
  const lang = (voice.lang || '').toLowerCase();
  const name = (voice.name || '').toLowerCase();

  if (isSpainVoice(voice)) return false;

  if (
    lang.startsWith('es-419') ||
    lang.startsWith('es-mx') ||
    lang.startsWith('es-us') ||
    lang.startsWith('es-ar') ||
    lang.startsWith('es-co') ||
    lang.startsWith('es-cl') ||
    lang.startsWith('es-uy') ||
    lang.startsWith('es-pe') ||
    lang.startsWith('es-ec') ||
    lang.startsWith('es-cr') ||
    lang.startsWith('es-gt') ||
    lang.startsWith('es-pa') ||
    lang.startsWith('es-ve') ||
    lang.startsWith('es-bo') ||
    lang.startsWith('es-do') ||
    lang.startsWith('es-hn') ||
    lang.startsWith('es-ni') ||
    lang.startsWith('es-pr') ||
    lang.startsWith('es-py') ||
    lang.startsWith('es-sv')
  ) {
    return true;
  }

  // Also include generic 'es' voices if name indicates Latin America
  if (lang.startsWith('es') && !isSpainVoice(voice)) {
    return true;
  }

  return false;
}

// Get all Latin American Spanish voices available in current browser
export function getAllLatinSpanishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices() || [];
  
  // Latin voices first
  const latinVoices = voices.filter(isLatinSpanishVoice);
  if (latinVoices.length > 0) {
    // Sort female voices first
    return latinVoices.sort((a, b) => {
      const aFemale = isFemaleVoice(a) ? 1 : 0;
      const bFemale = isFemaleVoice(b) ? 1 : 0;
      return bFemale - aFemale;
    });
  }

  // Fallback: any spanish voices
  return voices.filter((v) => (v.lang || '').startsWith('es'));
}

// Get user selected voice URI from localStorage
export function getStoredSelectedVoiceURI(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('loomi_xenia_voice_uri') || '';
}

export function setStoredSelectedVoiceURI(uri: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('loomi_xenia_voice_uri', uri);
  }
}

// Find the best Latin American female voice available in the browser (strictly non-Spain)
export function getBestLatinFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 0. Check if user explicitly selected a voice in preferences
  const storedURI = getStoredSelectedVoiceURI();
  if (storedURI) {
    const custom = voices.find((v) => v.voiceURI === storedURI || v.name === storedURI);
    if (custom) return custom;
  }

  // Filter out any Spain voices (es-ES)
  const latinVoices = voices.filter(isLatinSpanishVoice);

  // 1. Priority 1: Latin American Spanish Female Voice (es-419, es-MX, es-US, es-AR, es-CO, es-CL)
  const latinFemale = latinVoices.find(isFemaleVoice);
  if (latinFemale) return latinFemale;

  // 2. Priority 2: Any es-419 (Neutral Latin American) voice
  const es419 = latinVoices.find((v) => (v.lang || '').toLowerCase().startsWith('es-419'));
  if (es419) return es419;

  // 3. Priority 3: Any es-MX (Mexico) or es-US (US Latin) voice
  const esMxOrUs = latinVoices.find((v) => {
    const l = (v.lang || '').toLowerCase();
    return l.startsWith('es-mx') || l.startsWith('es-us');
  });
  if (esMxOrUs) return esMxOrUs;

  // 4. Priority 4: Any other Latin American voice (es-AR, es-CO, es-CL, etc.)
  if (latinVoices.length > 0) return latinVoices[0];

  // 5. Extreme Fallback: Only if NO Latin voices exist in the OS/Browser, take any Spanish voice
  const anySpanish = voices.find((v) => (v.lang || '').startsWith('es'));
  if (anySpanish) return anySpanish;

  return voices[0] || null;
}

// Alias for backward compatibility
export const getBestArgentineFemaleVoice = getBestLatinFemaleVoice;

// Current active utterance tracker for cancellation
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Speak text using Latin American Spanish parameters
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

  const voice = getBestLatinFemaleVoice();
  if (voice) {
    utterance.voice = voice;
  }

  // Force Latin American language tag (es-419) if voice is generic or default
  utterance.lang = voice?.lang && !isSpainVoice(voice) ? voice.lang : 'es-419';
  utterance.rate = 1.02; // Natural pace
  utterance.pitch = 1.05; // Friendly warm tone

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
