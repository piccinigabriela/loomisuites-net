/**
 * Informes (5/11, molde copiado de Areca): cálculos puros, sin React.
 *
 * Criterios:
 * - Ocupación: cuenta noche por noche dentro del período (una estadía que cruza de mes se reparte).
 * - Plata (por canal, por unidad, opcionales, saldos): reservas que ENTRAN en el período (mismo criterio que
 *   "Resultado del mes" y que la app anterior de Catalinas). No cuentan canceladas ni sin monto (countsForReport).
 * - Cobros: los pagos registrados con fecha dentro del período (las reservas marcadas "pagado" sin pagos anotados, el día que entran).
 * Montos en la moneda de liquidación (como el resto de la app).
 */
import type { AddonCategoryDef, Property, Reservation, ReservationOrigin, ReservationPayment } from '../types';
import { channelLabel } from './origins';
import { countsForReport, PLATFORM_LABELS } from './ownerReport';
import { addonCategoryLabel } from './addonCategories';

export interface DateRange {
  /** YYYY-MM-DD inclusive */
  from: string;
  /** YYYY-MM-DD inclusive */
  to: string;
}

export type PresetId = 'este-mes' | 'mes-pasado' | 'proximo-mes' | 'ultimos-30' | 'este-ano';

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'este-mes', label: 'Este mes' },
  { id: 'mes-pasado', label: 'Mes pasado' },
  { id: 'proximo-mes', label: 'Próximo mes' },
  { id: 'ultimos-30', label: 'Últimos 30 días' },
  { id: 'este-ano', label: 'Este año' },
];

const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function addDays(s: string, n: number): string {
  const d = parseYmd(s)!;
  d.setDate(d.getDate() + n);
  return ymd(d);
}

export function presetRange(id: PresetId, today: Date = new Date()): DateRange {
  const y = today.getFullYear();
  const m = today.getMonth();
  const monthRange = (yy: number, mm: number): DateRange => ({ from: ymd(new Date(yy, mm, 1)), to: ymd(new Date(yy, mm + 1, 0)) });
  switch (id) {
    case 'mes-pasado':
      return monthRange(m === 0 ? y - 1 : y, (m + 11) % 12);
    case 'proximo-mes':
      return monthRange(m === 11 ? y + 1 : y, (m + 1) % 12);
    case 'ultimos-30':
      return { from: ymd(new Date(y, m, today.getDate() - 29)), to: ymd(today) };
    case 'este-ano':
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    case 'este-mes':
    default:
      return monthRange(y, m);
  }
}

/** Días del período (cantidad de noches posibles por unidad) */
export function daysIn(range: DateRange): number {
  const a = parseYmd(range.from);
  const b = parseYmd(range.to);
  if (!a || !b || b < a) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
}

const inRange = (date: string, r: DateRange) => !!date && date >= r.from && date <= r.to;
const round = (n: number) => Math.round(n * 100) / 100;

/** Lo cobrado de una reserva (las viejas marcadas "pagado" sin pagos cuentan completas) */
export function collectedFor(r: Reservation): number {
  if (r.payments && r.payments.length > 0) return r.payments.reduce((s, p) => s + (p.amountSettlement || 0), 0);
  return r.paymentStatus === 'paid' ? r.totalAmount || 0 : 0;
}

/** Reservas de plata del período: entran en el período y cuentan para informes */
export const moneyReservations = (reservations: Reservation[], range: DateRange) =>
  reservations.filter((r) => countsForReport(r) && inRange(r.checkIn, range)).sort((a, b) => a.checkIn.localeCompare(b.checkIn));

// ---------------------------------------------------------------- Ocupación

export interface OccupancyReport {
  /** Noches vendidas / noches posibles */
  pct: number;
  sold: number;
  capacity: number;
  /** Ingresos de las noches del período (prorrateados) */
  revenue: number;
  /** Precio promedio por noche vendida */
  avgNight: number;
  /** Ingreso por noche disponible (ingresos / capacidad) */
  perAvailable: number;
  nights: Array<{ date: string; sold: number; pct: number }>;
  units: Array<{ id: string; name: string; sold: number; capacity: number; pct: number; revenue: number }>;
}

export function occupancyReport(reservations: Reservation[], properties: Property[], range: DateRange): OccupancyReport {
  const days = daysIn(range);
  const unitIds = properties.map((p) => p.id);
  const perUnit = new Map(properties.map((p) => [p.id, { sold: 0, revenue: 0 }]));
  const perNight = new Map<string, number>();
  for (let i = 0; i < days; i++) perNight.set(addDays(range.from, i), 0);

  for (const r of reservations) {
    if (r.status === 'cancelled' || !perUnit.has(r.propertyId)) continue;
    const start = parseYmd(r.checkIn);
    const end = parseYmd(r.checkOut);
    if (!start || !end || end <= start) continue;
    const total = Math.round((end.getTime() - start.getTime()) / 86400000);
    const perNightAmount = countsForReport(r) ? (r.totalAmount || 0) / total : 0;
    for (let n = 0; n < total; n++) {
      const d = addDays(r.checkIn, n);
      if (!perNight.has(d)) continue;
      perNight.set(d, (perNight.get(d) || 0) + 1);
      const u = perUnit.get(r.propertyId)!;
      u.sold += 1;
      u.revenue += perNightAmount;
    }
  }

  const unitsCount = Math.max(1, unitIds.length);
  const capacity = unitIds.length * days;
  const sold = [...perUnit.values()].reduce((s, u) => s + u.sold, 0);
  const revenue = [...perUnit.values()].reduce((s, u) => s + u.revenue, 0);
  return {
    pct: capacity ? Math.round((sold / capacity) * 1000) / 10 : 0,
    sold,
    capacity,
    revenue: round(revenue),
    avgNight: sold ? round(revenue / sold) : 0,
    perAvailable: capacity ? round(revenue / capacity) : 0,
    nights: [...perNight.entries()].map(([date, n]) => ({ date, sold: Math.min(n, unitsCount), pct: Math.min(100, Math.round((n / unitsCount) * 100)) })),
    units: properties.map((p) => {
      const u = perUnit.get(p.id)!;
      return { id: p.id, name: p.name, sold: u.sold, capacity: days, pct: days ? Math.round((u.sold / days) * 1000) / 10 : 0, revenue: round(u.revenue) };
    }),
  };
}

// ---------------------------------------------------------------- Por canal

export interface ChannelRow {
  key: string;
  label: string;
  reservations: number;
  nights: number;
  gross: number;
  fees: number;
  net: number;
  share: number;
}

export function channelReport(
  reservations: Reservation[],
  range: DateRange,
  origins: ReservationOrigin[] = []
): { rows: ChannelRow[]; totals: Omit<ChannelRow, 'key' | 'label' | 'share'> } {
  const map = new Map<string, ChannelRow>();
  for (const r of moneyReservations(reservations, range)) {
    // Los orígenes propios (Instagram, agencias…) van en su propia fila
    const key = r.origin ? `o:${r.origin}` : r.platform || 'direct';
    const label = r.origin ? channelLabel(r, origins) : PLATFORM_LABELS[key] || key;
    const row = map.get(key) || { key, label, reservations: 0, nights: 0, gross: 0, fees: 0, net: 0, share: 0 };
    const gross = r.totalAmount || 0;
    const fees = Math.min(gross, Math.max(0, r.commissionPaid || 0));
    row.reservations += 1;
    row.nights += r.nights || 0;
    row.gross += gross;
    row.fees += fees;
    row.net += gross - fees;
    map.set(key, row);
  }
  const rows = [...map.values()].sort((a, b) => b.net - a.net);
  const totals = {
    reservations: rows.reduce((s, r) => s + r.reservations, 0),
    nights: rows.reduce((s, r) => s + r.nights, 0),
    gross: round(rows.reduce((s, r) => s + r.gross, 0)),
    fees: round(rows.reduce((s, r) => s + r.fees, 0)),
    net: round(rows.reduce((s, r) => s + r.net, 0)),
  };
  for (const r of rows) {
    r.share = totals.net > 0 ? Math.round((r.net / totals.net) * 1000) / 10 : 0;
    r.gross = round(r.gross);
    r.fees = round(r.fees);
    r.net = round(r.net);
  }
  return { rows, totals };
}

// ---------------------------------------------------------------- Por unidad

export interface UnitPerfRow {
  id: string;
  name: string;
  reservations: number;
  nights: number;
  net: number;
  avgNight: number;
  share: number;
}

export function unitReport(reservations: Reservation[], properties: Property[], range: DateRange): { rows: UnitPerfRow[]; totalNet: number; totalNights: number } {
  const map = new Map<string, UnitPerfRow>(properties.map((p) => [p.id, { id: p.id, name: p.name, reservations: 0, nights: 0, net: 0, avgNight: 0, share: 0 }]));
  for (const r of moneyReservations(reservations, range)) {
    const row = map.get(r.propertyId) || { id: r.propertyId, name: 'Unidad eliminada', reservations: 0, nights: 0, net: 0, avgNight: 0, share: 0 };
    const gross = r.totalAmount || 0;
    row.reservations += 1;
    row.nights += r.nights || 0;
    row.net += gross - Math.min(gross, Math.max(0, r.commissionPaid || 0));
    map.set(r.propertyId, row);
  }
  const rows = [...map.values()];
  const totalNet = round(rows.reduce((s, r) => s + r.net, 0));
  const totalNights = rows.reduce((s, r) => s + r.nights, 0);
  for (const r of rows) {
    r.avgNight = r.nights ? round(r.net / r.nights) : 0;
    r.share = totalNet > 0 ? Math.round((r.net / totalNet) * 1000) / 10 : 0;
    r.net = round(r.net);
  }
  rows.sort((a, b) => b.net - a.net);
  return { rows, totalNet, totalNights };
}

// ---------------------------------------------------------------- Cobros y saldos

export const METHOD_LABELS: Record<ReservationPayment['method'], string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  mercadopago: 'Mercado Pago',
  plataforma: 'Plataforma',
  otro: 'Otro',
};

export interface PaymentsReport {
  collected: number;
  paymentsCount: number;
  byMethod: Array<{ method: string; label: string; count: number; amount: number }>;
  pendingTotal: number;
  owing: Array<{ id: string; guest: string; unit: string; checkIn: string; total: number; paid: number; balance: number }>;
}

export function paymentsReport(reservations: Reservation[], properties: Property[], range: DateRange): PaymentsReport {
  const methods = new Map<string, { count: number; amount: number }>();
  let collected = 0;
  let paymentsCount = 0;
  for (const r of reservations) {
    if (r.status === 'cancelled') continue;
    for (const p of r.payments || []) {
      if (!inRange(p.date, range)) continue;
      const m = methods.get(p.method) || { count: 0, amount: 0 };
      m.count += 1;
      m.amount += p.amountSettlement || 0;
      methods.set(p.method, m);
      collected += p.amountSettlement || 0;
      paymentsCount += 1;
    }
  }
  // Reservas marcadas "pagado" sin pagos anotados (las viejas o las importadas): cuentan el día que entran, sin medio
  let noDetail = 0;
  let noDetailCount = 0;
  for (const r of reservations) {
    if (!countsForReport(r) || (r.payments && r.payments.length) || r.paymentStatus !== 'paid' || !inRange(r.checkIn, range)) continue;
    noDetail += r.totalAmount || 0;
    noDetailCount += 1;
  }
  collected += noDetail;
  paymentsCount += noDetailCount;
  const unitName = (id: string) => properties.find((p) => p.id === id)?.name || '';
  const owing = moneyReservations(reservations, range)
    .map((r) => {
      const paid = Math.min(r.totalAmount || 0, collectedFor(r));
      return { id: r.id, guest: r.guestName || 'Sin nombre', unit: unitName(r.propertyId), checkIn: r.checkIn, total: round(r.totalAmount || 0), paid: round(paid), balance: round((r.totalAmount || 0) - paid) };
    })
    .filter((o) => o.balance > 0.009);
  return {
    collected: round(collected),
    paymentsCount,
    byMethod: (Object.keys(METHOD_LABELS) as ReservationPayment['method'][])
      .map((k): PaymentsReport['byMethod'][number] => ({ method: k, label: METHOD_LABELS[k], count: methods.get(k)?.count || 0, amount: round(methods.get(k)?.amount || 0) }))
      .filter((m) => m.count > 0)
      .concat(noDetailCount ? [{ method: 'sin-detalle', label: 'Marcadas pagadas, sin detalle', count: noDetailCount, amount: round(noDetail) }] : []),
    pendingTotal: round(owing.reduce((s, o) => s + o.balance, 0)),
    owing,
  };
}

// ---------------------------------------------------------------- Opcionales

export interface AddonsReport {
  quantity: number;
  total: number;
  reservationsWith: number;
  rows: Array<{ name: string; category: string; quantity: number; total: number }>;
}

export function addonsReport(reservations: Reservation[], range: DateRange, categories: AddonCategoryDef[]): AddonsReport {
  const map = new Map<string, { name: string; category: string; quantity: number; total: number }>();
  let reservationsWith = 0;
  for (const r of moneyReservations(reservations, range)) {
    const list = r.addons || [];
    if (list.length) reservationsWith += 1;
    for (const a of list) {
      const key = a.addonId || a.name;
      const row = map.get(key) || { name: a.name, category: addonCategoryLabel(a.category, categories), quantity: 0, total: 0 };
      row.quantity += a.quantity || 0;
      row.total += a.total || 0;
      map.set(key, row);
    }
  }
  const rows = [...map.values()].map((r) => ({ ...r, total: round(r.total) })).sort((a, b) => b.total - a.total);
  return {
    quantity: rows.reduce((s, r) => s + r.quantity, 0),
    total: round(rows.reduce((s, r) => s + r.total, 0)),
    reservationsWith,
    rows,
  };
}
