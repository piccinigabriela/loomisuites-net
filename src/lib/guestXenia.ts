/**
 * Xenia para huéspedes: lo que usa el chat de la guía y de Tu Web (src/components/guest/GuestXenia.tsx).
 * El servidor (functions/api/xenia/huesped.js) lee la información publicada, cuenta y aplica los topes.
 * Incluida durante la prueba: 1.000 conversaciones por mes por complejo (ver XENIA_GUEST_TRIAL_END).
 */
import { whatsappDigits } from './publicSite';

export type GuestXeniaKind = 'guia' | 'web';
export type GuestXeniaLang = 'es' | 'en' | 'pt';

/** Conversaciones por mes incluidas (el servidor usa el mismo número) */
export const XENIA_GUEST_MONTH_LIMIT = 1000;
/** Fin de la prueba sin cargo (YYYY-MM-DD). Antes de cobrar algo se avisa con 30 días. */
export const XENIA_GUEST_TRIAL_END = '2027-01-31';

export interface GuestXeniaReply {
  reply?: string;
  /** Resumen para mandarle al anfitrión por WhatsApp */
  handoff?: string;
  /** Se llegó a un tope */
  limit?: 'conv' | 'day' | 'month';
  /** El anfitrión no la activó */
  off?: boolean;
  /** No se pudo responder (sin clave, sin crédito, error) */
  unavailable?: boolean;
}

/** Id de la conversación: uno por pestaña y por lugar */
export function conversationId(kind: GuestXeniaKind, id: string): string {
  const key = `loomi_xg_${kind}_${id}`;
  try {
    const saved = sessionStorage.getItem(key);
    if (saved && /^[a-z0-9]{12,40}$/.test(saved)) return saved;
  } catch {}
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const conv = Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
  try {
    sessionStorage.setItem(key, conv);
  } catch {}
  return conv;
}

export async function askGuestXenia(input: {
  kind: GuestXeniaKind;
  id: string;
  unit?: string;
  conv: string;
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<GuestXeniaReply> {
  try {
    const res = await fetch('/api/xenia/huesped', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => ({}))) as GuestXeniaReply;
    if (res.status === 403) return { off: true };
    if (!res.ok) return { unavailable: true };
    return data;
  } catch {
    return { unavailable: true };
  }
}

/** Link de WhatsApp al anfitrión con la consulta ya escrita ('' si no hay teléfono) */
export function hostWhatsappLink(phone: string, text: string): string {
  const d = whatsappDigits(phone || '');
  if (!d) return '';
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Idioma de los textos del chat. En Tu Web sigue al selector de idioma de la página (que cambia <html lang>). */
export function guessLang(kind: GuestXeniaKind): GuestXeniaLang {
  try {
    const l = ((kind === 'web' ? document.documentElement.lang : '') || navigator.language || 'es').toLowerCase();
    if (l.startsWith('en')) return 'en';
    if (l.startsWith('pt')) return 'pt';
  } catch {}
  return 'es';
}
