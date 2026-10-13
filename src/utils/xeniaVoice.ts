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

// Spanish month names helper
const MONTH_NAMES_ES: Record<number, string> = {
  1: 'enero',
  2: 'febrero',
  3: 'marzo',
  4: 'abril',
  5: 'mayo',
  6: 'junio',
  7: 'julio',
  8: 'agosto',
  9: 'septiembre',
  10: 'octubre',
  11: 'noviembre',
  12: 'diciembre',
};

// ===== Importes de dinero para la voz de Xenia =====
const MONEY_WORDS: Record<string, string> = {
  ARS: 'pesos', USD: 'dólares', BRL: 'reales', EUR: 'euros',
};
const MONEY_WORD_ONE: Record<string, string> = {
  ARS: 'peso', USD: 'dólar', BRL: 'real', EUR: 'euro',
};
function spokenNumberEs(val: number): string {
  if (isNaN(val)) return '';
  const millones = Math.floor(val / 1000000);
  const miles = Math.floor((val % 1000000) / 1000);
  const resto = val % 1000;
  const partes: string[] = [];
  if (millones > 0) partes.push(millones === 1 ? 'un millón' : `${millones} millones`);
  if (miles > 0) partes.push(miles === 1 ? 'mil' : `${miles} mil`);
  if (resto > 0 || partes.length === 0) partes.push(String(resto));
  return partes.join(' ');
}
function parseAmount(numStr: string): number {
  let s = numStr.trim();
  s = s.replace(/[.,](\d{1,2})$/, '');
  return parseInt(s.replace(/[.,]/g, ''), 10);
}
const NUM = '(\\d{1,3}(?:[.,]\\d{3})+(?:,\\d{1,2})?|\\d+(?:,\\d{1,2})?)';
const NIGHT = '(\\s*(?:\\/\\s*noche|por noche))?';
function spokenMoney(numStr: string, code: string, night?: string): string {
  const val = parseAmount(numStr);
  const words = val === 1 ? (MONEY_WORD_ONE[code] || 'peso') : (MONEY_WORDS[code] || 'pesos');
  const de = val >= 1000000 && val % 1000000 === 0 ? 'de ' : '';
  const numWords = val === 1 ? 'un' : spokenNumberEs(val);
  return `${numWords} ${de}${words}${night ? ' por noche' : ''}`;
}
function normalizeMoneyForSpeech(text: string): string {
  let clean = text;
  const symbolToCode = (sym: string): string => {
    const s = sym.toUpperCase();
    if (s === 'US$' || s === 'U$S' || s === 'U$D') return 'USD';
    if (s === 'R$') return 'BRL';
    if (s === '€') return 'EUR';
    return 'ARS';
  };
  clean = clean.replace(
    new RegExp(`(?:US\\$|U\\$S|U\\$D|R\\$|€|\\$)\\s?${NUM}\\s*(USD|ARS|BRL|EUR)\\b${NIGHT}`, 'gi'),
    (_m, n, code, night) => spokenMoney(n, code.toUpperCase(), night)
  );
  clean = clean.replace(
    new RegExp(`(US\\$|U\\$S|U\\$D|R\\$|€|\\$)\\s?${NUM}${NIGHT}`, 'gi'),
    (_m, sym, n, night) => spokenMoney(n, symbolToCode(sym), night)
  );
  clean = clean.replace(
    new RegExp(`\\b(USD|ARS|BRL|EUR)\\s?${NUM}${NIGHT}`, 'gi'),
    (_m, code, n, night) => spokenMoney(n, code.toUpperCase(), night)
  );
  clean = clean.replace(
    new RegExp(`${NUM}\\s?(USD|ARS|BRL|EUR|dólares|dolares|pesos|reales|euros)\\b${NIGHT}`, 'gi'),
    (_m, n, w, night) => {
      const map: Record<string, string> = { 'dólares': 'USD', dolares: 'USD', pesos: 'ARS', reales: 'BRL', euros: 'EUR' };
      const code = map[w.toLowerCase()] || w.toUpperCase();
      return spokenMoney(n, code, night);
    }
  );
  clean = clean.replace(/\b\d{1,3}(?:[.,]\d{3})+\b/g, (m) => spokenNumberEs(parseAmount(m)));
  clean = clean.replace(/\b(USD|ARS|BRL|EUR)\b/g, (c) => MONEY_WORDS[c]);
  return clean;
}

// Clean markdown, symbols, ISO dates and currency amounts into natural fluent spoken Spanish
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

  // =========================================================================
  // 1. DATE NORMALIZATION (Convierte fechas ISO / compactas / rangos a español natural)
  // =========================================================================

  // A. Abbreviated month mapping in Spanish (e.g. sep -> septiembre, oct -> octubre, ene -> enero)
  clean = clean.replace(/\b(0?[1-9]|[12]\d|3[01])\s+de\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic)\.?\b/gi, (_match, d, m) => {
    const map: Record<string, string> = {
      ene: 'enero', feb: 'febrero', mar: 'marzo', abr: 'abril', may: 'mayo', jun: 'junio',
      jul: 'julio', ago: 'agosto', sep: 'septiembre', set: 'septiembre', oct: 'octubre', nov: 'noviembre', dic: 'diciembre'
    };
    const monthFull = map[m.toLowerCase()] || m;
    return `${parseInt(d, 10)} de ${monthFull}`;
  });

  clean = clean.replace(/\bdel\s+(0?[1-9]|[12]\d|3[01])\s+al\s+(0?[1-9]|[12]\d|3[01])\s+de\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic)\.?\b/gi, (_match, d1, d2, m) => {
    const map: Record<string, string> = {
      ene: 'enero', feb: 'febrero', mar: 'marzo', abr: 'abril', may: 'mayo', jun: 'junio',
      jul: 'julio', ago: 'agosto', sep: 'septiembre', set: 'septiembre', oct: 'octubre', nov: 'noviembre', dic: 'diciembre'
    };
    const monthFull = map[m.toLowerCase()] || m;
    return `del ${parseInt(d1, 10)} al ${parseInt(d2, 10)} de ${monthFull}`;
  });

  // B. Date Ranges with ISO formats: e.g. "2026-10-15 al 2026-10-18" or "del 2026-09-10 al 2026-09-15"
  clean = clean.replace(
    /(?:del\s+)?(\d{4})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\s+(?:al|hasta|-|a)\s+(\d{4})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])/gi,
    (_match, y1, m1, d1, y2, m2, d2) => {
      const month1 = parseInt(m1, 10);
      const month2 = parseInt(m2, 10);
      const day1 = parseInt(d1, 10);
      const day2 = parseInt(d2, 10);
      const year1 = parseInt(y1, 10);
      const year2 = parseInt(y2, 10);

      const name1 = MONTH_NAMES_ES[month1] || '';
      const name2 = MONTH_NAMES_ES[month2] || '';

      if (month1 === month2 && year1 === year2) {
        return `del ${day1} al ${day2} de ${name1} de ${year1}`;
      }
      if (year1 === year2) {
        return `del ${day1} de ${name1} al ${day2} de ${name2} de ${year1}`;
      }
      return `del ${day1} de ${name1} de ${year1} al ${day2} de ${name2} de ${year2}`;
    }
  );

  // C. Date Ranges with Slash formats: e.g. "15/10/2026 al 18/10/2026" or "10/09 al 15/09"
  clean = clean.replace(
    /(?:del\s+)?(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])(?:\/(\d{4}))?\s+(?:al|hasta|-|a)\s+(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])(?:\/(\d{4}))?/gi,
    (_match, d1, m1, y1, d2, m2, y2) => {
      const month1 = parseInt(m1, 10);
      const month2 = parseInt(m2, 10);
      const day1 = parseInt(d1, 10);
      const day2 = parseInt(d2, 10);
      const year = y2 || y1 || '';
      const name1 = MONTH_NAMES_ES[month1] || '';
      const name2 = MONTH_NAMES_ES[month2] || '';

      if (month1 === month2) {
        return `del ${day1} al ${day2} de ${name1}${year ? ` de ${year}` : ''}`;
      }
      return `del ${day1} de ${name1} al ${day2} de ${name2}${year ? ` de ${year}` : ''}`;
    }
  );

  // D. Single ISO Dates: e.g. "2026-09-10" or "2026-10-15" or "2026/09/10"
  clean = clean.replace(
    /\b(\d{4})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/g,
    (_match, y, m, d) => {
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const monthName = MONTH_NAMES_ES[month] || '';
      const year = parseInt(y, 10);
      return `${day} de ${monthName} de ${year}`;
    }
  );

  // E. Compact Numeric Dates: e.g. "20260910" (YYYYMMDD) - Prevents reading 2 0 2 6 0 9 1 0
  clean = clean.replace(
    /\b(202[4-9])(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\b/g,
    (_match, y, m, d) => {
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const monthName = MONTH_NAMES_ES[month] || '';
      const year = parseInt(y, 10);
      return `${day} de ${monthName} de ${year}`;
    }
  );

  // F. Single Slash Dates: e.g. "10/09/2026" or "15/10/2026"
  clean = clean.replace(
    /\b(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])\/(\d{4})\b/g,
    (_match, d, m, y) => {
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const monthName = MONTH_NAMES_ES[month] || '';
      return `${day} de ${monthName} de ${y}`;
    }
  );

  // G. Single Month/Day slash: e.g. "10/09"
  clean = clean.replace(
    /\b(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])\b/g,
    (_match, d, m) => {
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const monthName = MONTH_NAMES_ES[month] || '';
      return `${day} de ${monthName}`;
    }
  );

  // =========================================================================
  // 2. CURRENCY & AMOUNTS NORMALIZATION (Importes naturales en pesos o dólares)
  // =========================================================================

  clean = normalizeMoneyForSpeech(clean);
  clean = clean.replace(/\$/g, '');

  // =========================================================================
  // 3. PERCENTAGES, TIME, UNITS & HOSPITALITY TERMS
  // =========================================================================
  clean = clean.replace(/\b0%/g, 'cero por ciento');
  clean = clean.replace(/\b100%/g, 'cien por ciento');
  clean = clean.replace(/\b50%/g, 'cincuenta por ciento');
  clean = clean.replace(/(\d+)%/g, '$1 por ciento');

  clean = clean.replace(/1\.200\s*msnm/gi, 'mil doscientos metros de altura');
  clean = clean.replace(/1200\s*msnm/gi, 'mil doscientos metros de altura');
  clean = clean.replace(/(\d+)\s*msnm/gi, '$1 metros sobre el nivel del mar');

  clean = clean.replace(/(\d+)°C/gi, '$1 grados');
  clean = clean.replace(/(\d+)°/g, '$1 grados');

  clean = clean.replace(/\b24\/7\b/g, 'las 24 horas');
  clean = clean.replace(/\b1:1\b/g, 'uno a uno');
  clean = clean.replace(/\b(\d{1,2}):(\d{2})hs\b/gi, '$1 y $2 horas');
  clean = clean.replace(/\b(\d{1,2})hs\b/gi, '$1 horas');
  clean = clean.replace(/\bpax\b/gi, 'personas');
  clean = clean.replace(/\bOTAs?\b/gi, 'agencias de reserva');
  clean = clean.replace(/\biCal\b/gi, 'ai cal');
  clean = clean.replace(/\bWi-?Fi\b/gi, 'guai fai');
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

  // 0. Prioridad rioplatense: voces de Argentina y después Uruguay (ej. "Microsoft Elena/Tomás - Spanish (Argentina)" en Edge)
  const langOf = (v: SpeechSynthesisVoice) => (v.lang || '').toLowerCase().replace('_', '-');
  const isRioplatense = (v: SpeechSynthesisVoice) =>
    langOf(v).startsWith('es-ar') || /argentin/i.test(v.name || '');
  const isUruguay = (v: SpeechSynthesisVoice) => langOf(v).startsWith('es-uy') || /urugua/i.test(v.name || '');
  const argentineVoices = voices.filter(isRioplatense);
  const argentineFemale = argentineVoices.find(isFemaleVoice);
  if (argentineFemale) return argentineFemale;
  if (argentineVoices.length > 0) return argentineVoices[0];
  const uruguayVoice = voices.find(isUruguay);
  if (uruguayVoice) return uruguayVoice;

  // 1. Priority 1: Latin American Spanish Female Voice (es-419, es-MX, es-US, es-CO, es-CL)
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
  const anySpanish = voices.find((v) => (v.lang || '').toLowerCase().startsWith('es'));
  if (anySpanish) return anySpanish;

  // Nunca usar una voz en otro idioma: leer castellano con voz inglesa suena incomprensible
  return null;
}

/** true si el navegador tiene al menos una voz en español */
export function hasSpanishVoice(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.getVoices().some((v) => (v.lang || '').toLowerCase().startsWith('es'));
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
  if (!voice) {
    currentUtterance = null;
    options?.onError?.({ error: 'no-spanish-voice' });
    return;
  }
  utterance.voice = voice;

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
