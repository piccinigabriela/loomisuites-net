/**
 * Rendimiento del período y liquidación al propietario.
 *
 * Mismo criterio que la app anterior de Catalinas:
 * - Una reserva cuenta en el mes de su check-in.
 * - Neto = bruto − comisión de la plataforma.
 * - Comisión de gestión = % sobre el neto. Líquido propietario = neto − gestión.
 * - Resultado neto = líquido − gastos (egresos de caja) del período.
 * - No cuentan: canceladas, sin monto (bloqueos, cortesías) ni las marcadas en la app anterior
 *   como Stand by, Devolución, Cortesía o Non show.
 */
import { BookingPlatform, CashMovement, Property, Reservation } from '../types';

export interface ManagementSettings {
  /** Administro departamentos de un propietario y cobro comisión */
  enabled: boolean;
  /** % sobre el neto (después de la comisión de la plataforma) */
  percent: number;
}

export interface ReportPeriod {
  /** 0-11, o 'all' para el año completo */
  month: number | 'all';
  year: number;
}

export interface UnitRow {
  propertyId: string;
  name: string;
  reservations: number;
  nights: number;
  gross: number;
  platformFees: number;
  net: number;
  management: number;
  ownerNet: number;
}

export interface OwnerReport {
  units: UnitRow[];
  totals: Omit<UnitRow, 'propertyId' | 'name'>;
  byChannel: Array<{ platform: BookingPlatform; label: string; gross: number }>;
  expenses: number;
  expensesCount: number;
  /** Hay gastos en pesos pero falta la cotización para pasarlos a la moneda de liquidación */
  expensesNeedRate: boolean;
  /** líquido (o neto si no hay gestión) − gastos */
  result: number;
  marginPct: number | null;
  collected: number;
  pending: number;
  included: Reservation[];
}

const EXCLUDED_LEGACY = /Estado en la app anterior:\s*(stand\s*by|devoluci|cortes|non\s*show|no\s*show)/i;

export const PLATFORM_LABELS: Record<string, string> = {
  airbnb: 'Airbnb',
  booking: 'Booking',
  direct: 'Directo',
  vrbo: 'Vrbo',
  expedia: 'Expedia',
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function isInPeriod(dateStr: string, period: ReportPeriod): boolean {
  const m = /^(\d{4})-(\d{2})/.exec(dateStr || '');
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  if (y !== period.year) return false;
  return period.month === 'all' || mo === period.month;
}

export function countsForReport(r: Reservation): boolean {
  if (r.status === 'cancelled') return false;
  if (!(r.totalAmount > 0)) return false;
  if (r.specialNotes && EXCLUDED_LEGACY.test(r.specialNotes)) return false;
  return true;
}

const collectedFor = (r: Reservation) => {
  if (r.payments && r.payments.length > 0) {
    return r.payments.reduce((sum, p) => sum + (p.amountSettlement || 0), 0);
  }
  return r.paymentStatus === 'paid' ? r.totalAmount || 0 : 0;
};

export function computeOwnerReport(
  reservations: Reservation[],
  properties: Property[],
  cashMovements: CashMovement[] | undefined,
  period: ReportPeriod,
  settings: ManagementSettings,
  /** Moneda de liquidación por cada 1 peso (la caja va siempre en pesos). 1 si se liquida en pesos; null si falta la cotización. */
  arsFactor: number | null = 1
): OwnerReport {
  const pct = settings.enabled ? Math.max(0, settings.percent || 0) / 100 : 0;
  const included = reservations
    .filter((r) => countsForReport(r) && isInPeriod(r.checkIn, period))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  const rowFor = (propertyId: string, name: string): UnitRow => ({
    propertyId,
    name,
    reservations: 0,
    nights: 0,
    gross: 0,
    platformFees: 0,
    net: 0,
    management: 0,
    ownerNet: 0,
  });

  const rows = new Map<string, UnitRow>();
  for (const p of properties) rows.set(p.id, rowFor(p.id, p.name));

  const channels = new Map<string, number>();
  let collected = 0;
  let pending = 0;

  for (const r of included) {
    let row = rows.get(r.propertyId);
    if (!row) {
      row = rowFor(r.propertyId, 'Unidad eliminada');
      rows.set(r.propertyId, row);
    }
    const gross = r.totalAmount || 0;
    const fees = Math.min(gross, Math.max(0, r.commissionPaid || 0));
    const net = gross - fees;
    const management = net * pct;
    row.reservations += 1;
    row.nights += r.nights || 0;
    row.gross += gross;
    row.platformFees += fees;
    row.net += net;
    row.management += management;
    row.ownerNet += net - management;

    channels.set(r.platform, (channels.get(r.platform) || 0) + gross);
    const paid = collectedFor(r);
    collected += Math.min(paid, gross);
    pending += Math.max(0, gross - paid);
  }

  // Totales sobre los valores sin redondear (igual que la app anterior), y recién después se redondea
  const raw = [...rows.values()];
  const rawSum = (k: keyof Omit<UnitRow, 'propertyId' | 'name'>) => round2(raw.reduce((s, u) => s + u[k], 0));
  const totals = {
    reservations: raw.reduce((s, u) => s + u.reservations, 0),
    nights: raw.reduce((s, u) => s + u.nights, 0),
    gross: rawSum('gross'),
    platformFees: rawSum('platformFees'),
    net: rawSum('net'),
    management: rawSum('management'),
    ownerNet: rawSum('ownerNet'),
  };
  const units = raw.map((u) => ({
    ...u,
    gross: round2(u.gross),
    platformFees: round2(u.platformFees),
    net: round2(u.net),
    management: round2(u.management),
    ownerNet: round2(u.ownerNet),
  }));

  const expenseList = (cashMovements || []).filter((m) => m.type === 'egreso' && isInPeriod(m.date, period));
  const expensesNeedRate = expenseList.length > 0 && arsFactor === null;
  const expenses = round2(expenseList.reduce((s, m) => s + (m.amount || 0), 0) * (arsFactor ?? 0));
  const result = round2(totals.ownerNet - expenses);

  const byChannel = [...channels.entries()]
    .map(([platform, gross]) => ({
      platform: platform as BookingPlatform,
      label: PLATFORM_LABELS[platform] || platform,
      gross: round2(gross),
    }))
    .sort((a, b) => b.gross - a.gross);

  return {
    units,
    totals,
    byChannel,
    expenses,
    expensesCount: expenseList.length,
    expensesNeedRate,
    result,
    marginPct: totals.gross > 0 ? Math.round((result / totals.gross) * 100) : null,
    collected: round2(collected),
    pending: round2(pending),
    included,
  };
}
