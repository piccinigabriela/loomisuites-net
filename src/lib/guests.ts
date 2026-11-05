/**
 * Lista de huéspedes (idea vista en Areca, 5/11): se arma sola con las reservas, sin guardar nada aparte.
 * Junta las reservas de la misma persona por teléfono (últimos 8 dígitos), si no por mail y si no por nombre.
 * Las reservas de Airbnb/Booking por iCal sin nombre real ("Reserva Airbnb", "Bloqueado en…") no cuentan.
 * La ven el dueño y Recepción; Limpieza no lee reservas.
 */
import type { PreCheckin, Reservation } from '../types';

export interface GuestSummary {
  key: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  /** Estadías que ya empezaron (vinieron) */
  stays: number;
  nights: number;
  lastStay: string;
  lastUnitId: string;
  /** Próxima llegada (si tiene una reserva futura) */
  nextStay: string;
  /** Reservas de esta persona, de la más nueva a la más vieja */
  reservationIds: string[];
  /** Nota que se recuerda (la última escrita en cualquiera de sus reservas) */
  note: string;
}

const PLACEHOLDER = /^(reserva\b|bloqueado\b|reserved\b|not available\b|blocked\b|airbnb\b|booking\b|vrbo\b|sin nombre\b|hu[eé]sped\b|guest\b)/i;

export const isPlaceholderName = (name?: string) => !name || !name.trim() || PLACEHOLDER.test(name.trim());

const phoneKey = (phone?: string) => {
  const d = (phone || '').replace(/\D/g, '');
  return d.length >= 7 ? `p:${d.slice(-8)}` : '';
};
const emailKey = (email?: string) => {
  const e = (email || '').trim().toLowerCase();
  return /.+@.+\..+/.test(e) && !/guest\.airbnb|booking\.com$/i.test(e) ? `e:${e}` : '';
};
export const nameKey = (name?: string) =>
  `n:${(name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()}`;

/** Clave de la persona de cada reserva ('' = no se puede saber quién es) */
export function guestKeys(reservations: Reservation[]): Map<string, string> {
  // Primero: a qué teléfono o mail corresponde cada nombre, para juntar las reservas sin teléfono de la misma persona
  const byName = new Map<string, string>();
  for (const r of reservations) {
    if (isPlaceholderName(r.guestName)) continue;
    const k = phoneKey(r.guestPhone) || emailKey(r.guestEmail);
    if (k && !byName.has(nameKey(r.guestName))) byName.set(nameKey(r.guestName), k);
  }
  const out = new Map<string, string>();
  for (const r of reservations) {
    const direct = phoneKey(r.guestPhone) || emailKey(r.guestEmail);
    if (direct) out.set(r.id, direct);
    else if (!isPlaceholderName(r.guestName)) out.set(r.id, byName.get(nameKey(r.guestName)) || nameKey(r.guestName));
    else out.set(r.id, '');
  }
  return out;
}

export function buildGuestList(reservations: Reservation[], today: string, precheckins: Record<string, PreCheckin> = {}): GuestSummary[] {
  const keys = guestKeys(reservations);
  const map = new Map<string, GuestSummary>();
  const sorted = reservations.filter((r) => r.status !== 'cancelled').sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  for (const r of sorted) {
    const key = keys.get(r.id);
    if (!key) continue;
    let g = map.get(key);
    if (!g) {
      g = { key, name: r.guestName.trim(), phone: '', email: '', country: '', stays: 0, nights: 0, lastStay: '', lastUnitId: '', nextStay: '', reservationIds: [], note: '' };
      map.set(key, g);
    }
    g.reservationIds.push(r.id);
    if (!g.phone && r.guestPhone) g.phone = r.guestPhone;
    if (!g.email && emailKey(r.guestEmail)) g.email = r.guestEmail;
    if (!g.country && precheckins[r.id]?.nationality) g.country = precheckins[r.id].nationality;
    if (r.checkIn <= today) {
      g.stays += 1;
      g.nights += r.nights || 0;
      if (!g.lastStay) {
        g.lastStay = r.checkIn;
        g.lastUnitId = r.propertyId;
      }
    } else {
      // La lista viene de la más nueva a la más vieja: la última que se pisa es la próxima
      g.nextStay = r.checkIn;
    }
  }
  for (const g of map.values()) g.note = latestNote(reservations.filter((r) => keys.get(r.id) === g.key));
  return [...map.values()]
    // Arriba los que llegan pronto y después los más recientes
    .sort((a, b) => (b.nextStay || b.lastStay).localeCompare(a.nextStay || a.lastStay));
}

/** Cuántas veces vino antes esta persona (estadías anteriores a esta reserva) */
export function previousStays(reservation: Reservation, reservations: Reservation[]): number {
  const keys = guestKeys(reservations.some((r) => r.id === reservation.id) ? reservations : [...reservations, reservation]);
  const key = keys.get(reservation.id);
  if (!key) return 0;
  return reservations.filter((r) => r.id !== reservation.id && r.status !== 'cancelled' && keys.get(r.id) === key && r.checkIn < reservation.checkIn).length;
}

/** La nota más nueva de un grupo de reservas ('' si no hay o si la última la borró) */
function latestNote(list: Reservation[]): string {
  let best: Reservation | null = null;
  for (const r of list) {
    if (r.guestNote === undefined) continue;
    const at = r.guestNoteAt || '';
    if (!best || at > (best.guestNoteAt || '')) best = r;
  }
  return (best?.guestNote || '').trim();
}

/** Nota de la persona de esta reserva: se escribe en una reserva y aparece en todas las de esa persona */
export function guestNoteFor(reservation: Reservation, reservations: Reservation[]): string {
  const all = reservations.some((r) => r.id === reservation.id) ? reservations.map((r) => (r.id === reservation.id ? reservation : r)) : [...reservations, reservation];
  const keys = guestKeys(all);
  const key = keys.get(reservation.id);
  if (!key) return (reservation.guestNote || '').trim();
  return latestNote(all.filter((r) => keys.get(r.id) === key));
}

export const GUEST_NOTE_MAX = 300;

type Lang = 'es' | 'en' | 'pt';

/** Mensaje para invitar a volver a alguien que ya vino ("Que vuelvan"); el anfitrión lo puede cambiar en WhatsApp antes de mandarlo */
export function returnInviteMessage(o: { name: string; complexName?: string; link?: string; discount?: number; lang?: Lang }): string {
  const first = (o.name || '').trim().split(/\s+/)[0] || '';
  const place = (o.complexName || '').trim();
  const d = Math.round(o.discount || 0);
  const link = (o.link || '').trim();
  if (o.lang === 'en') {
    return [
      `Hi${first ? ` ${first}` : ''}! This is ${place || 'the place where you stayed'}.`,
      'We loved having you and would be happy to welcome you back.',
      d > 0 ? `If you book directly with us, you get ${d}% off.` : '',
      link ? `Dates and prices: ${link}` : 'Just reply here and we will send you dates and prices.',
    ].filter(Boolean).join(' ');
  }
  if (o.lang === 'pt') {
    return [
      `Olá${first ? ` ${first}` : ''}! Aqui é ${place || 'o alojamento onde você se hospedou'}.`,
      'Adoramos receber você e seria um prazer te receber de novo.',
      d > 0 ? `Reservando direto com a gente, você tem ${d}% de desconto.` : '',
      link ? `Datas e preços: ${link}` : 'Responda por aqui e enviamos datas e preços.',
    ].filter(Boolean).join(' ');
  }
  return [
    `¡Hola${first ? ` ${first}` : ''}! Te escribimos ${place ? `de ${place}` : 'del alojamiento donde te hospedaste'}.`,
    'Nos encantó recibirte y nos gustaría que vuelvas.',
    d > 0 ? `Si reservás directo con nosotros, tenés un ${d}% de descuento.` : '',
    link ? `Fechas y precios: ${link}` : 'Escribinos por acá y te pasamos fechas y precios.',
  ].filter(Boolean).join(' ');
}
