/**
 * Importador del backup .json de la app anterior de alojamientos (formato "version 2":
 * { reservas: [{ depto, huesped, checkin, checkout, precio, plataforma, estado, destino, senia, saldo, ... }],
 *   ical: { D02: url }, icalBk: { D02: url }, plataformas: [{ id, comision, comisionBooking }] }).
 *
 * Convierte todo a reservas de Loomi Suite sin inventar datos: lo que el archivo no trae queda vacío.
 */
import { BookingPlatform, CurrencyCode, Property, Reservation, ReservationPayment, ReservationStatus } from '../types';

export interface LegacyReservation {
  id: string;
  depto: string;
  huesped?: string | null;
  nac?: string | null;
  checkin: string;
  checkout: string;
  precio?: number | null;
  plataforma?: string | null;
  estado?: string | null;
  notas?: string | null;
  creado?: string | null;
  destino?: string | null;
  senia?: number | null;
  saldo?: number | null;
  limpio?: boolean | null;
  early?: boolean | null;
  late?: boolean | null;
  tel?: string | null;
}

export interface LegacyBackup {
  version?: number;
  fecha?: string;
  reservas: LegacyReservation[];
  ical?: Record<string, string>;
  icalBk?: Record<string, string>;
  plataformas?: Array<{ id: string; nombre?: string; comision?: number; comisionBooking?: number }>;
}

export function isLegacyBackup(data: any): data is LegacyBackup {
  return (
    Boolean(data) &&
    Array.isArray(data.reservas) &&
    data.reservas.length > 0 &&
    typeof data.reservas[0] === 'object' &&
    'depto' in data.reservas[0] &&
    'checkin' in data.reservas[0]
  );
}

export interface LegacyUnitSummary {
  code: string;
  count: number;
  activeCount: number;
  medianNightPrice: number;
  airbnbUrl?: string;
  bookingUrl?: string;
}

const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');

const nightsBetween = (a: string, b: string) => {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};

const isCancelledState = (estado?: string | null) => {
  const e = (estado || '').toLowerCase();
  return e.startsWith('cancel') || e.replace(/[\s-]/g, '') === 'nonshow' || e.replace(/[\s-]/g, '') === 'noshow';
};

export function summarizeLegacyUnits(data: LegacyBackup): LegacyUnitSummary[] {
  const byCode = new Map<string, LegacyReservation[]>();
  for (const r of data.reservas) {
    const code = (r.depto || 'Sin unidad').trim();
    byCode.set(code, [...(byCode.get(code) || []), r]);
  }
  return [...byCode.entries()]
    .map(([code, list]) => {
      const prices = list
        .filter((r) => !isCancelledState(r.estado) && (r.precio || 0) > 0)
        .map((r) => Number(r.precio))
        .sort((a, b) => a - b);
      const median = prices.length ? prices[Math.floor(prices.length / 2)] : 0;
      return {
        code,
        count: list.length,
        activeCount: list.filter((r) => !isCancelledState(r.estado)).length,
        medianNightPrice: median,
        airbnbUrl: data.ical?.[code] || undefined,
        bookingUrl: data.icalBk?.[code] || undefined,
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}

/** Sugiere a qué unidad existente corresponde un código como "D02" (por nombre o número). */
export function suggestPropertyForCode(code: string, properties: Property[]): string | '' {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');
  const exact = properties.find((p) => norm(p.name) === norm(code));
  if (exact) return exact.id;
  const num = (code.match(/\d+/) || [])[0];
  if (!num) return '';
  const n = String(Number(num));
  const byNumber = properties.filter((p) => {
    const nums = (p.name.match(/\d+/g) || []).map((x) => String(Number(x)));
    return nums.includes(n);
  });
  return byNumber.length === 1 ? byNumber[0].id : '';
}

export interface LegacyConvertOptions {
  /** código del archivo → id de unidad de Loomi */
  unitMap: Record<string, string>;
  fileCurrency: CurrencyCode;
  settlementCurrency: CurrencyCode;
  /** cuántas unidades de la moneda de liquidación vale 1 unidad de la moneda del archivo */
  rate: number;
  includeCancelled: boolean;
  today: string; // YYYY-MM-DD local
}

export interface LegacyConvertResult {
  reservations: Reservation[];
  skipped: number;
  cancelledCount: number;
  paidByPlatformCount: number;
}

export function convertLegacyBackup(data: LegacyBackup, opts: LegacyConvertOptions): LegacyConvertResult {
  const rate = opts.fileCurrency === opts.settlementCurrency ? 1 : opts.rate;
  const toSettlement = (v: number) => Math.round(v * rate * 100) / 100;

  const commissionByPlatform = new Map<string, number>();
  for (const p of data.plataformas || []) {
    commissionByPlatform.set(p.id, ((p.comision || 0) + (p.comisionBooking || 0)) / 100);
  }

  const out: Reservation[] = [];
  let skipped = 0;
  let cancelledCount = 0;
  let paidByPlatformCount = 0;

  for (const r of data.reservas) {
    const propertyId = opts.unitMap[(r.depto || 'Sin unidad').trim()];
    if (!propertyId || !isValidDate(r.checkin) || !isValidDate(r.checkout)) {
      skipped++;
      continue;
    }
    const nights = nightsBetween(r.checkin, r.checkout);
    if (nights <= 0) {
      skipped++;
      continue;
    }

    const cancelled = isCancelledState(r.estado);
    if (cancelled && !opts.includeCancelled) {
      skipped++;
      continue;
    }
    if (cancelled) cancelledCount++;

    const rawPlatform = (r.plataforma || '').trim();
    const lowerPlatform = rawPlatform.toLowerCase();
    let platform: BookingPlatform = 'direct';
    let airbnbFeeMode: Reservation['airbnbFeeMode'];
    if (lowerPlatform.startsWith('airbnb')) {
      platform = 'airbnb';
      airbnbFeeMode = lowerPlatform.includes('15') ? 'simplified_15' : 'traditional_3';
    } else if (lowerPlatform.startsWith('booking')) {
      platform = 'booking';
    } else if (lowerPlatform.startsWith('vrbo')) {
      platform = 'vrbo';
    }

    let commissionRate = commissionByPlatform.get(rawPlatform);
    if (commissionRate === undefined) {
      commissionRate =
        platform === 'airbnb' ? (airbnbFeeMode === 'simplified_15' ? 0.15 : 0.03) : platform === 'direct' ? 0 : 0.15;
    }

    const nightPrice = Number(r.precio) || 0;
    const totalAmount = toSettlement(nightPrice * nights);
    const commissionPaid = Math.round(totalAmount * commissionRate * 100) / 100;
    const netRevenue = Math.round((totalAmount - commissionPaid) * 100) / 100;

    let status: ReservationStatus = 'confirmed';
    if (cancelled) status = 'cancelled';
    else if (r.checkout < opts.today) status = 'checked_out';

    // Pagos: solo lo que el archivo registra; Airbnb siempre cobra por adelantado en la plataforma
    const payments: ReservationPayment[] = [];
    const destino = (r.destino || '').trim();
    const methodFor = (): ReservationPayment['method'] => {
      const d = destino.toLowerCase();
      if (d === 'efectivo') return 'efectivo';
      if (d.includes('transfer')) return 'transferencia';
      if (d.includes('tarjeta')) return 'tarjeta';
      if (d.includes('mercado')) return 'mercadopago';
      if (d === 'payoneer') return 'plataforma';
      return platform === 'direct' ? 'otro' : 'plataforma';
    };
    const saldo = Number(r.saldo) || 0;
    const senia = Number(r.senia) || 0;
    if (!cancelled && totalAmount > 0) {
      if (platform !== 'direct' && (saldo > 0 || platform === 'airbnb')) {
        // Cobrado por la plataforma: el huésped pagó el total; el neto que llegó va en la nota
        payments.push({
          id: `legacy-pay-${r.id}`,
          date: r.checkin,
          amount: totalAmount,
          currency: opts.settlementCurrency,
          rate: 1,
          amountSettlement: totalAmount,
          method: 'plataforma',
          note: `Importado: cobrado por ${rawPlatform.replace(/15$/, '') || 'la plataforma'}${
            saldo > 0 ? ` · neto recibido ${saldo} ${opts.fileCurrency}${destino ? ` (${destino})` : ''}` : ''
          }`,
        });
        paidByPlatformCount++;
      } else {
        if (senia > 0) {
          payments.push({
            id: `legacy-senia-${r.id}`,
            date: (r.creado || r.checkin).slice(0, 10),
            amount: senia,
            currency: opts.fileCurrency,
            rate,
            amountSettlement: toSettlement(senia),
            method: methodFor(),
            note: `Importado: seña${destino ? ` (${destino})` : ''}`,
          });
        }
        if (saldo > 0) {
          payments.push({
            id: `legacy-saldo-${r.id}`,
            date: r.checkin,
            amount: saldo,
            currency: opts.fileCurrency,
            rate,
            amountSettlement: toSettlement(saldo),
            method: methodFor(),
            note: `Importado: pago registrado${destino ? ` (${destino})` : ''}`,
          });
        }
      }
    }
    const paid = payments.reduce((s, p) => s + p.amountSettlement, 0);
    const paymentStatus: Reservation['paymentStatus'] =
      totalAmount <= 0 && !cancelled
        ? 'paid'
        : payments.length === 0
          ? 'pending'
          : paid >= totalAmount - 0.5
            ? 'paid'
            : 'deposit_only';

    const notes: string[] = [];
    if (r.notas && r.notas.trim()) notes.push(r.notas.trim());
    if (r.nac && r.nac.trim()) notes.push(`Nacionalidad: ${r.nac.trim()}`);
    const estado = (r.estado || '').trim();
    if (estado && !/^confirmad/i.test(estado)) notes.push(`Estado en la app anterior: ${estado}`);

    out.push({
      id: `legacy-${r.id}`,
      propertyId,
      guestName: (r.huesped || '').trim() || 'Sin nombre',
      guestEmail: '',
      guestPhone: (r.tel || '').trim(),
      checkIn: r.checkin,
      checkOut: r.checkout,
      nights,
      guestsCount: 1,
      platform,
      totalAmount,
      cleaningFee: 0,
      commissionPaid,
      netRevenue,
      status,
      paymentStatus,
      pinCode: '',
      specialNotes: notes.join('\n'),
      createdAt: (r.creado || '').slice(0, 10) || opts.today,
      earlyCheckIn: r.early === true,
      lateCheckOut: r.late === true,
      airbnbFeeMode,
      payments,
      source: 'manual',
    });
  }

  return { reservations: out, skipped, cancelledCount, paidByPlatformCount };
}
