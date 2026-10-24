/**
 * Para las respuestas fijas de Xenia: entender fechas escritas a mano ("del 5 al 10 de noviembre",
 * "5/11 al 8/11", "el 20 de diciembre") y saber de qué unidad se habla ("el dept A", "depto 2").
 */

const MONTHS: Array<[RegExp, number]> = [
  [/^ene/, 1],
  [/^feb/, 2],
  [/^mar/, 3],
  [/^abr/, 4],
  [/^may/, 5],
  [/^jun/, 6],
  [/^jul/, 7],
  [/^ago/, 8],
  [/^(sep|set)/, 9],
  [/^oct/, 10],
  [/^nov/, 11],
  [/^dic/, 12],
];
const MON = '(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre|ene|feb|mar|abr|may|jun|jul|ago|sept?|set|oct|nov|dic)\\.?';
const SEP = '\\s*(?:al|hasta(?:\\s+el)?|a|-|–)\\s*(?:el\\s+)?';

const monthNum = (m: string) => MONTHS.find(([re]) => re.test(m.toLowerCase()))?.[1] || 0;
const pad = (n: number) => String(n).padStart(2, '0');

/** Fecha completa: si no dicen el año, la próxima vez que cae ese día (desde hoy) */
function toDate(day: number, month: number, year: number | null, today: string): string | null {
  if (!day || !month || day > 31 || month > 12) return null;
  let y = year ?? Number(today.slice(0, 4));
  if (y < 100) y += 2000;
  let s = `${y}-${pad(month)}-${pad(day)}`;
  if (year == null && s < today) s = `${y + 1}-${pad(month)}-${pad(day)}`;
  return s;
}

function plusOne(date: string): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Devuelve llegada y salida (la salida es el día que se van) o null si no hay fechas en la pregunta */
export function parseDateRange(text: string, today: string): { checkIn: string; checkOut: string } | null {
  const q = (text || '').toLowerCase();
  let m: RegExpMatchArray | null;

  // "28 de octubre al 3 de noviembre"
  m = q.match(new RegExp(`(\\d{1,2})\\s*(?:de\\s+)?${MON}${SEP}(\\d{1,2})\\s*(?:de\\s+)?${MON}`));
  if (m) {
    const a = toDate(+m[1], monthNum(m[2]), null, today);
    let b = a ? toDate(+m[3], monthNum(m[4]), +a.slice(0, 4), today) : null;
    if (a && b && b <= a) b = toDate(+m[3], monthNum(m[4]), +a.slice(0, 4) + 1, today);
    if (a && b) return { checkIn: a, checkOut: b };
  }
  // "del 5 al 10 de noviembre"
  m = q.match(new RegExp(`(\\d{1,2})${SEP}(\\d{1,2})\\s*(?:de\\s+)?${MON}`));
  if (m) {
    const month = monthNum(m[3]);
    const b = toDate(+m[2], month, null, today);
    const a = b ? toDate(+m[1], month, +b.slice(0, 4), today) : null;
    if (a && b && b > a) return { checkIn: a, checkOut: b };
  }
  // "5/11 al 10/11" o "05/11/2026 - 10/11/2026"
  m = q.match(new RegExp(`(\\d{1,2})/(\\d{1,2})(?:/(\\d{2,4}))?${SEP}(\\d{1,2})/(\\d{1,2})(?:/(\\d{2,4}))?`));
  if (m) {
    const a = toDate(+m[1], +m[2], m[3] ? +m[3] : null, today);
    let b = a ? toDate(+m[4], +m[5], m[6] ? +m[6] : +a.slice(0, 4), today) : null;
    if (a && b && b <= a && !m[6]) b = toDate(+m[4], +m[5], +a.slice(0, 4) + 1, today);
    if (a && b && b > a) return { checkIn: a, checkOut: b };
  }
  // "del 5 al 10" (mes actual, o el que viene si ya pasó)
  m = q.match(new RegExp(`\\b(?:del|desde el|entre el)\\s+(\\d{1,2})${SEP}(\\d{1,2})\\b(?!\\s*/)`));
  if (m) {
    const month = Number(today.slice(5, 7));
    let a = toDate(+m[1], month, Number(today.slice(0, 4)), today);
    let b = toDate(+m[2], month, Number(today.slice(0, 4)), today);
    if (a && a < today) {
      const next = month === 12 ? 1 : month + 1;
      const y = Number(today.slice(0, 4)) + (month === 12 ? 1 : 0);
      a = toDate(+m[1], next, y, today);
      b = toDate(+m[2], next, y, today);
    }
    if (a && b && b > a) return { checkIn: a, checkOut: b };
  }
  // Un solo día: "el 20 de diciembre" o "20/12" → esa noche
  m = q.match(new RegExp(`(\\d{1,2})\\s*(?:de\\s+)?${MON}`)) || null;
  if (m) {
    const a = toDate(+m[1], monthNum(m[2]), null, today);
    if (a) return { checkIn: a, checkOut: plusOne(a) };
  }
  m = q.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (m) {
    const a = toDate(+m[1], +m[2], m[3] ? +m[3] : null, today);
    if (a) return { checkIn: a, checkOut: plusOne(a) };
  }
  return null;
}

const norm = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\b(departamento|depto|dept|dpto|dto|unidad|cabana|cab|habitacion|hab)\b\.?/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** La unidad que se nombra en la pregunta ("el dept A", "la cabaña Malbec"), si hay una sola que coincide */
export function findUnitInText<T extends { name: string }>(text: string, units: T[]): T | null {
  const raw = (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Nombre completo tal cual
  const full = units.filter((u) => u.name && raw.includes(u.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')));
  if (full.length === 1) return full[0];
  // "dept a", "depto 2", "unidad b": la letra o número después de la palabra
  const m = raw.match(/\b(?:departamento|depto|dept|dpto|dto|unidad|cabana|cab|habitacion|hab)\.?\s+([a-z0-9]{1,12})\b/);
  if (m) {
    const key = m[1];
    const hits = units.filter((u) => {
      const n = norm(u.name);
      return n === key || n.split(' ').includes(key);
    });
    if (hits.length === 1) return hits[0];
  }
  // Una palabra propia de una sola unidad ("la Malbec")
  const words = ` ${norm(raw)} `;
  const own = units.filter((u) => norm(u.name).split(' ').some((w) => w.length >= 3 && !/^\d+$/.test(w) && words.includes(` ${w} `) && units.filter((o) => norm(o.name).split(' ').includes(w)).length === 1));
  if (own.length === 1) return own[0];
  return null;
}
