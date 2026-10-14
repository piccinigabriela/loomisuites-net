/**
 * Avisos al equipo (plan Propietario, sin personal fijo): textos listos para mandar por WhatsApp
 * a quien ayuda con limpieza, mantenimiento o la entrega de llaves.
 */
import { Property, Reservation, TeamContact, WelcomeGuideData } from '../types';
import { getGuideHours, withHs as hourText } from '../data/initialData';

export type { TeamContact };

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const addDays = (ymd: string, n: number) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return toYmd(new Date(y, m - 1, d + n));
};

export const daysBetween = (fromYmd: string, toYmdStr: string) => {
  const [y1, m1, d1] = fromYmd.split('-').map(Number);
  const [y2, m2, d2] = toYmdStr.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};


export const fmtDmy = (ymd: string) => (ymd || '').split('-').reverse().join('/');

export const relativeDay = (diff: number) => (diff <= 0 ? 'hoy' : diff === 1 ? 'mañana' : `en ${diff} días`);

export function dayTitle(ymd: string, today: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const wd = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  const diff = daysBetween(today, ymd);
  const prefix = diff === 0 ? 'Hoy' : diff === 1 ? 'Mañana' : wd.charAt(0).toUpperCase() + wd.slice(1);
  return `${prefix}${diff <= 1 ? ` ${wd}` : ''} ${d}/${m}`;
}

/** Separa la nacionalidad y limpia las notas internas que vienen de la importación. */
export function splitNotes(notes?: string): { nationality: string; notes: string } {
  let nationality = '';
  const kept: string[] = [];
  for (const line of (notes || '').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    const nat = /^Nacionalidad:\s*(.+)$/i.exec(t);
    if (nat) {
      nationality = nat[1].trim();
      continue;
    }
    if (/^Estado en la app anterior:/i.test(t)) continue;
    kept.push(t);
  }
  return { nationality, notes: kept.join(' · ') };
}

export function platformLabel(r: Reservation): string {
  if (r.platform === 'airbnb') return r.airbnbFeeMode === 'simplified_15' ? 'Airbnb (15%)' : 'Airbnb';
  if (r.platform === 'booking') return 'Booking';
  if (r.platform === 'vrbo') return 'Vrbo';
  return 'Directo';
}

/** Teléfono para WhatsApp: solo dígitos; un celular argentino de 10 dígitos recibe el 549 adelante. */
export function normalizeWhatsAppPhone(raw: string): string {
  let d = (raw || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) d = `549${d}`;
  return d;
}

export function whatsAppUrl(text: string, phone?: string): string {
  const p = phone ? normalizeWhatsAppPhone(phone) : '';
  const t = encodeURIComponent(text);
  return p.length >= 8 ? `https://api.whatsapp.com/send?phone=${p}&text=${t}` : `https://api.whatsapp.com/send?text=${t}`;
}

export function upcomingCheckIns(reservations: Reservation[], today: string, days = 7): Reservation[] {
  const until = addDays(today, days);
  return reservations
    .filter((r) => r.status !== 'cancelled' && r.checkIn >= today && r.checkIn <= until)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn) || a.propertyId.localeCompare(b.propertyId));
}

export function buildCheckInNotice(
  r: Reservation,
  opts: { complexName: string; unitName: string; guide?: WelcomeGuideData; today: string; isApp: boolean }
): string {
  const hours = getGuideHours(opts.guide, opts.isApp);
  const { nationality, notes } = splitNotes(r.specialNotes);
  const diff = daysBetween(opts.today, r.checkIn);
  const lines = [
    `*AVISO CHECK-IN${opts.complexName ? ` — ${opts.complexName}` : ''}*`,
    '',
    `*Unidad:* ${opts.unitName}`,
    `*Huésped:* ${r.guestName}${nationality ? ` (${nationality})` : ''}`,
    `*Check-in:* ${fmtDmy(r.checkIn)} (${relativeDay(diff)})${hours.checkin ? ` desde las ${hourText(hours.checkin)}` : ''}`,
    `*Check-out:* ${fmtDmy(r.checkOut)}${hours.checkout ? ` hasta las ${hourText(hours.checkout)}` : ''}`,
    `*Noches:* ${r.nights}`,
    `*Plataforma:* ${platformLabel(r)}`,
  ];
  if (r.guestsCount && r.guestsCount > 1) lines.push(`*Personas:* ${r.guestsCount}`);
  if (notes) lines.push(`*Notas:* ${notes}`);
  lines.push('', 'Confirmar recepción.');
  return lines.join('\n');
}

export function buildDaySummary(
  day: string,
  reservations: Reservation[],
  properties: Property[],
  opts: { complexName: string; guide?: WelcomeGuideData; today: string; isApp: boolean }
): { text: string; checkIns: Reservation[]; checkOuts: Reservation[] } {
  const hours = getGuideHours(opts.guide, opts.isApp);
  const unitName = (id: string) => properties.find((p) => p.id === id)?.name || 'Unidad';
  const active = reservations.filter((r) => r.status !== 'cancelled');
  const byUnit = (a: Reservation, b: Reservation) => unitName(a.propertyId).localeCompare(unitName(b.propertyId));
  const checkOuts = active.filter((r) => r.checkOut === day).sort(byUnit);
  const checkIns = active.filter((r) => r.checkIn === day).sort(byUnit);

  const lines = [`*AVISOS ${dayTitle(day, opts.today).toUpperCase()}${opts.complexName ? ` — ${opts.complexName}` : ''}*`, ''];
  if (checkOuts.length) {
    lines.push(`*Salidas (a limpiar)${hours.checkout ? ` · hasta las ${hourText(hours.checkout)}` : ''}:*`);
    for (const r of checkOuts) {
      const sameDayIn = checkIns.some((c) => c.propertyId === r.propertyId);
      lines.push(`• ${unitName(r.propertyId)} — ${r.guestName}${sameDayIn ? ' (entra otro huésped el mismo día)' : ''}`);
    }
    lines.push('');
  }
  if (checkIns.length) {
    lines.push(`*Entradas${hours.checkin ? ` · desde las ${hourText(hours.checkin)}` : ''}:*`);
    for (const r of checkIns) {
      const { notes } = splitNotes(r.specialNotes);
      lines.push(`• ${unitName(r.propertyId)} — ${r.guestName}, ${r.nights} ${r.nights === 1 ? 'noche' : 'noches'}${notes ? ` (${notes})` : ''}`);
    }
    lines.push('');
  }
  if (!checkOuts.length && !checkIns.length) lines.push('Sin entradas ni salidas.', '');
  lines.push('Confirmar recepción.');
  return { text: lines.join('\n'), checkIns, checkOuts };
}
