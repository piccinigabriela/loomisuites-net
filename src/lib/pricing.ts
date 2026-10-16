/**
 * Tarifas: planilla de precios por tipo de alojamiento.
 *
 * Cada noche se cobra según el período en el que cae, en este orden:
 *   1. Fin de semana largo (un solo precio por noche)
 *   2. Temporada (precio entre semana / fin de semana)
 *   3. Tarifa normal (precio entre semana / fin de semana)
 * "Fin de semana" = las noches de los días marcados (por defecto viernes, sábado y domingo).
 *
 * Sin dependencias de Firebase ni de React: lo pueden usar la app, Tu Web y Xenia.
 */
import type { Property } from '../types';

export interface DayPrices {
  /** Precio por noche entre semana */
  semana: number;
  /** Precio por noche de fin de semana */
  finde: number;
}

export interface AccommodationType {
  id: string;
  name: string;
}

export interface Season {
  id: string;
  name: string;
  /** Primera noche (YYYY-MM-DD) */
  desde: string;
  /** Última noche, inclusive (YYYY-MM-DD) */
  hasta: string;
  minNights: number;
  /** tipoId → precios */
  precios: Record<string, DayPrices>;
}

export interface LongWeekend {
  id: string;
  name: string;
  /** Primer día libre (YYYY-MM-DD). Se cobra desde la noche anterior. */
  desde: string;
  /** Último día libre (YYYY-MM-DD). La última noche que se cobra es la anterior. */
  hasta: string;
}

export interface PricingSettings {
  types: AccommodationType[];
  /** propertyId → tipoId */
  assignments: Record<string, string>;
  /** Noches que cuentan como fin de semana (0 = domingo … 6 = sábado) */
  weekendNights: number[];
  normal: { minNights: number; precios: Record<string, DayPrices> };
  seasons: Season[];
  longWeekends: LongWeekend[];
  /** Precio por noche en fin de semana largo, por tipo */
  longWeekendPrices: Record<string, number>;
  longWeekendMinNights: number;
}

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/**
 * Fines de semana largos de Argentina desde hoy (oct 2026) hasta oct 2027, según la Ley 27.399.
 * Los días no laborables con fines turísticos de 2027 todavía no están decretados: se agregan cuando salgan.
 */
export const ARGENTINA_LONG_WEEKENDS: LongWeekend[] = [
  { id: 'lw-2026-11-soberania', name: 'Día de la Soberanía Nacional', desde: '2026-11-21', hasta: '2026-11-23' },
  { id: 'lw-2026-12-inmaculada', name: 'Inmaculada Concepción', desde: '2026-12-05', hasta: '2026-12-08' },
  { id: 'lw-2026-12-navidad', name: 'Navidad', desde: '2026-12-25', hasta: '2026-12-27' },
  { id: 'lw-2027-01-anio-nuevo', name: 'Año Nuevo', desde: '2027-01-01', hasta: '2027-01-03' },
  { id: 'lw-2027-02-carnaval', name: 'Carnaval', desde: '2027-02-06', hasta: '2027-02-09' },
  { id: 'lw-2027-03-semana-santa', name: 'Semana Santa', desde: '2027-03-24', hasta: '2027-03-28' },
  { id: 'lw-2027-04-malvinas', name: 'Malvinas', desde: '2027-04-02', hasta: '2027-04-04' },
  { id: 'lw-2027-06-guemes', name: 'Güemes', desde: '2027-06-19', hasta: '2027-06-21' },
  { id: 'lw-2027-07-independencia', name: 'Día de la Independencia', desde: '2027-07-09', hasta: '2027-07-11' },
  { id: 'lw-2027-08-san-martin', name: 'San Martín', desde: '2027-08-14', hasta: '2027-08-16' },
  { id: 'lw-2027-10-diversidad', name: 'Diversidad Cultural', desde: '2027-10-09', hasta: '2027-10-11' },
];

export function defaultPricing(): PricingSettings {
  return {
    types: [],
    assignments: {},
    weekendNights: [5, 6, 0],
    normal: { minNights: 1, precios: {} },
    seasons: [],
    longWeekends: ARGENTINA_LONG_WEEKENDS.map((w) => ({ ...w })),
    longWeekendPrices: {},
    longWeekendMinNights: 1,
  };
}

/** Completa una planilla guardada con los valores por defecto que le falten. */
export function normalizePricing(p?: Partial<PricingSettings> | null): PricingSettings {
  const d = defaultPricing();
  if (!p) return d;
  return {
    types: p.types || [],
    assignments: p.assignments || {},
    weekendNights: Array.isArray(p.weekendNights) ? p.weekendNights : d.weekendNights,
    normal: { minNights: p.normal?.minNights || 1, precios: p.normal?.precios || {} },
    seasons: p.seasons || [],
    longWeekends: p.longWeekends || d.longWeekends,
    longWeekendPrices: p.longWeekendPrices || {},
    longWeekendMinNights: p.longWeekendMinNights || 1,
  };
}

export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function dayOfWeek(date: string): number {
  return new Date(date + 'T00:00:00Z').getUTCDay();
}

/** Noches que se cobran como fin de semana largo: desde la víspera del primer día libre hasta la víspera del último. */
export function longWeekendNights(w: LongWeekend): { primera: string; ultima: string } {
  return { primera: addDays(w.desde, -1), ultima: addDays(w.hasta, -1) };
}

export type NightKind = 'finde-largo' | 'temporada' | 'normal';

export interface NightQuote {
  date: string;
  price: number;
  kind: NightKind;
  /** Nombre del período ("Normal", "Temporada alta", "Navidad") */
  period: string;
  weekend: boolean;
  /** true si faltaba el precio en la planilla y se usó otro */
  fallback: boolean;
}

export interface StayQuote {
  /** false si la unidad no tiene tipo o no hay planilla: se usa el precio base de la unidad */
  fromTable: boolean;
  typeName: string;
  nights: NightQuote[];
  total: number;
  minNights: number;
  /** Período que pide ese mínimo */
  minNightsPeriod: string;
  belowMinimum: boolean;
  missingPrices: boolean;
  /** Resumen agrupado: "2 noches · Normal · fin de semana × $X" */
  groups: Array<{ label: string; count: number; price: number; subtotal: number }>;
}

/** Cotiza una estadía noche por noche. checkOut es el día de salida (esa noche no se cobra). */
export function quoteStay(
  pricing: PricingSettings | null | undefined,
  property: Property | undefined,
  checkIn: string,
  checkOut: string
): StayQuote {
  const p = pricing ? normalizePricing(pricing) : null;
  const typeId = property && p ? p.assignments[property.id] : undefined;
  const type = typeId ? p?.types.find((t) => t.id === typeId) : undefined;
  const basePrice = Number(property?.basePrice) || 0;
  const fromTable = Boolean(p && type);

  const nights: NightQuote[] = [];
  let minNights = 1;
  let minNightsPeriod = '';
  if (checkIn && checkOut && checkOut > checkIn) {
    for (let date = checkIn; date < checkOut; date = addDays(date, 1)) {
      const weekend = p ? p.weekendNights.includes(dayOfWeek(date)) : false;
      if (!p || !type) {
        nights.push({ date, price: basePrice, kind: 'normal', period: 'Precio base', weekend, fallback: false });
        continue;
      }
      const tid = type.id;
      const normal = p.normal.precios[tid];
      const normalPrice = (weekend ? normal?.finde : normal?.semana) || 0;

      const lw = p.longWeekends.find((w) => {
        const r = longWeekendNights(w);
        return date >= r.primera && date <= r.ultima;
      });
      if (lw) {
        const price = Number(p.longWeekendPrices[tid]) || 0;
        nights.push({
          date,
          price: price || normalPrice || basePrice,
          kind: 'finde-largo',
          period: `Finde largo (${lw.name})`,
          weekend,
          fallback: !price,
        });
        if (p.longWeekendMinNights > minNights) {
          minNights = p.longWeekendMinNights;
          minNightsPeriod = `fin de semana largo: ${lw.name}`;
        }
        continue;
      }

      const season = p.seasons.find((s) => date >= s.desde && date <= s.hasta);
      if (season) {
        const sp = season.precios[tid];
        const price = Number(weekend ? sp?.finde : sp?.semana) || 0;
        nights.push({
          date,
          price: price || normalPrice || basePrice,
          kind: 'temporada',
          period: season.name || 'Temporada',
          weekend,
          fallback: !price,
        });
        if ((season.minNights || 1) > minNights) {
          minNights = season.minNights;
          minNightsPeriod = season.name || 'temporada';
        }
        continue;
      }

      nights.push({
        date,
        price: normalPrice || basePrice,
        kind: 'normal',
        period: 'Normal',
        weekend,
        fallback: !normalPrice,
      });
      if ((p.normal.minNights || 1) > minNights) {
        minNights = p.normal.minNights;
        minNightsPeriod = 'tarifa normal';
      }
    }
  }

  const groupsMap = new Map<string, { label: string; count: number; price: number; subtotal: number }>();
  for (const n of nights) {
    const label =
      n.kind === 'finde-largo' || !fromTable ? n.period : `${n.period} · ${n.weekend ? 'fin de semana' : 'entre semana'}`;
    const key = `${label}|${n.price}`;
    const g = groupsMap.get(key) || { label, count: 0, price: n.price, subtotal: 0 };
    g.count++;
    g.subtotal += n.price;
    groupsMap.set(key, g);
  }

  return {
    fromTable,
    typeName: type?.name || '',
    nights,
    total: nights.reduce((s, n) => s + n.price, 0),
    minNights,
    minNightsPeriod,
    belowMinimum: fromTable && nights.length > 0 && nights.length < minNights,
    missingPrices: nights.some((n) => n.fallback),
    groups: [...groupsMap.values()],
  };
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
