import type { Reminder, ReminderRepeat } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');

function parse(dateStr: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { y, m, d };
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate(); // m va de 1 a 12
}

function build(y: number, m: number, d: number): string {
  // Si el mes no tiene ese día (31 en abril, 29/2 en año común) cae el último día del mes
  const day = Math.min(d, daysInMonth(y, m));
  return `${y}-${pad(m)}-${pad(day)}`;
}

/**
 * Primera fecha de la serie (a partir de `anchor`) que es estrictamente posterior a `after`.
 * Se calcula siempre desde la fecha original, así un recordatorio del 31 vuelve a caer el 31
 * en los meses que lo tienen.
 */
export function nextOccurrence(anchor: string, repeat: ReminderRepeat, after: string): string {
  if (repeat === 'none') return anchor;
  const a = parse(anchor);
  const t = parse(after);

  if (repeat === 'weekly' || repeat === 'biweekly') {
    // Cada 7 o 14 días contados desde la fecha original (mismo día de la semana)
    const step = repeat === 'weekly' ? 7 : 14;
    const base = Date.UTC(a.y, a.m - 1, a.d);
    const lim = Date.UTC(t.y, t.m - 1, t.d);
    const diff = Math.floor((lim - base) / 86400000);
    const n = diff < 0 ? 0 : Math.floor(diff / step) + 1;
    const next = new Date(base + n * step * 86400000);
    const out = `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
    return out > after ? out : anchor;
  }

  if (repeat === 'monthly') {
    let y = t.y;
    let m = t.m;
    for (let i = 0; i < 26; i++) {
      const candidate = build(y, m, a.d);
      if (candidate > after && candidate >= anchor) return candidate;
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return anchor;
  }

  // yearly
  let y = Math.max(t.y, a.y);
  for (let i = 0; i < 3; i++) {
    const candidate = build(y, a.m, a.d);
    if (candidate > after && candidate >= anchor) return candidate;
    y += 1;
  }
  return anchor;
}

/** Tilde en un recordatorio: los que no se repiten quedan hechos; los que se repiten pasan a la próxima vez. */
export function completeReminder(r: Reminder, today: string): Reminder {
  const doneAt = new Date().toISOString();
  if (r.repeat === 'none') return { ...r, done: true, doneAt };
  // La próxima vez es la primera posterior a hoy y a la fecha que se acaba de tildar
  const after = r.date > today ? r.date : today;
  return { ...r, date: nextOccurrence(r.anchor || r.date, r.repeat, after), done: false, doneAt };
}

/** Destilda uno que no se repite (los que se repiten ya pasaron al siguiente). */
export function reopenReminder(r: Reminder): Reminder {
  return { ...r, done: false };
}

/** Vencidos sin tildar: fecha anterior a hoy. */
export function isOverdue(r: Reminder, today: string): boolean {
  return !r.done && r.date < today;
}

export function newReminder(date: string, text: string, repeat: ReminderRepeat): Reminder {
  return {
    id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date,
    anchor: date,
    text: text.trim(),
    repeat,
    done: false,
  };
}

export const REPEAT_LABEL: Record<ReminderRepeat, string> = {
  none: 'Nunca',
  weekly: 'Todas las semanas',
  biweekly: 'Cada 15 días',
  monthly: 'Todos los meses',
  yearly: 'Todos los años',
};
