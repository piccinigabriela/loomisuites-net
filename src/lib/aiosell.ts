/**
 * Channel manager con Aiosell: lógica pura (sin Firebase, sin red, sin React).
 * Plan completo: docs/channel-manager-aiosell.md
 *
 * Dos mitades:
 *  1. Lo que Aiosell nos manda (book / modify / cancel): se valida y se convierte en reservas y limpiezas de Loomi.
 *  2. Lo que nosotros mandamos (disponibilidad, precios y estadía mínima): se arma a partir de reservas y Tarifas.
 *
 * SUPUESTOS que hay que confirmar con Aiosell (están marcados con "SUPUESTO"):
 *  - endDate de los envíos: inclusivo (última noche) o exclusivo. Por defecto inclusivo; se cambia con `endInclusive`.
 *  - Fechas de reservas: YYYY-MM-DD (se acepta que vengan con hora y se toman los primeros 10 caracteres).
 *  - Monedas: se informa la moneda de la reserva; si no coincide con la del complejo, lo decide quien llama.
 */
import type { BookingPlatform, CleaningTask, Property, Reservation } from '../types';
import { addDays, quoteStay, type PricingSettings } from './pricing';
import { icalCleaningTaskId } from './icalCore';
import { buildCleaningChecklist, type CleaningChecklistSettings } from './cleaningChecklist';

/* ------------------------------------------------------------------ */
/* 1. Aiosell → Loomi                                                  */
/* ------------------------------------------------------------------ */

export interface AiosellRoom {
  roomCode: string;
  rateplanCode: string;
  guestName: string;
  adults: number;
  children: number;
  /** Suma de sellRate de las noches (0 si no vinieron precios por noche) */
  total: number;
}

export interface AiosellBooking {
  action: 'book' | 'modify';
  hotelCode: string;
  channel: string;
  bookingId: string;
  cmBookingId?: string;
  bookedOn?: string;
  /** YYYY-MM-DD */
  checkin: string;
  checkout: string;
  specialRequests?: string;
  /** true = paga en el alojamiento */
  pah: boolean;
  amountAfterTax: number;
  currency: string;
  guest: { name: string; email: string; phone: string };
  rooms: AiosellRoom[];
}

export interface AiosellCancel {
  action: 'cancel';
  hotelCode: string;
  channel: string;
  bookingId: string;
}

export type AiosellPush = AiosellBooking | AiosellCancel;

export type ParseResult = { ok: true; push: AiosellPush } | { ok: false; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}/;

function asString(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return '';
}

function asNumber(v: unknown): number {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : 0;
}

function asDate(v: unknown): string {
  const s = asString(v);
  return DATE_RE.test(s) ? s.slice(0, 10) : '';
}

/** Valida lo que manda Aiosell y lo deja en un formato simple. Nunca tira error: devuelve { ok: false, error }. */
export function parseAiosellPush(body: unknown): ParseResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'El cuerpo no es un objeto' };
  const b = body as Record<string, unknown>;
  const action = asString(b.action).toLowerCase();
  if (action !== 'book' && action !== 'modify' && action !== 'cancel') {
    return { ok: false, error: `Acción desconocida: "${action}"` };
  }
  const hotelCode = asString(b.hotelCode);
  const bookingId = asString(b.bookingId);
  const channel = asString(b.channel);
  if (!hotelCode) return { ok: false, error: 'Falta hotelCode' };
  if (!bookingId) return { ok: false, error: 'Falta bookingId' };

  if (action === 'cancel') return { ok: true, push: { action, hotelCode, channel, bookingId } };

  const checkin = asDate(b.checkin);
  const checkout = asDate(b.checkout);
  if (!checkin || !checkout) return { ok: false, error: 'Faltan o son inválidas las fechas checkin/checkout' };
  if (checkout <= checkin) return { ok: false, error: 'checkout tiene que ser posterior a checkin' };
  if (!Array.isArray(b.rooms) || b.rooms.length === 0) return { ok: false, error: 'Falta rooms' };

  const rooms: AiosellRoom[] = [];
  for (const raw of b.rooms) {
    const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const roomCode = asString(r.roomCode);
    if (!roomCode) return { ok: false, error: 'Una habitación no trae roomCode' };
    const occ = (r.occupancy && typeof r.occupancy === 'object' ? r.occupancy : {}) as Record<string, unknown>;
    const prices = Array.isArray(r.prices) ? r.prices : [];
    const total = prices.reduce<number>((s, p) => s + asNumber((p as Record<string, unknown> | null)?.sellRate), 0);
    rooms.push({
      roomCode,
      rateplanCode: asString(r.rateplanCode),
      guestName: asString(r.guestName),
      adults: Math.max(0, Math.round(asNumber(occ.adults))),
      children: Math.max(0, Math.round(asNumber(occ.children))),
      total: Math.round(total * 100) / 100,
    });
  }

  const g = (b.guest && typeof b.guest === 'object' ? b.guest : {}) as Record<string, unknown>;
  const amount = (b.amount && typeof b.amount === 'object' ? b.amount : {}) as Record<string, unknown>;
  const guestName = [asString(g.firstName), asString(g.lastName)].filter(Boolean).join(' ');

  return {
    ok: true,
    push: {
      action,
      hotelCode,
      channel,
      bookingId,
      cmBookingId: asString(b.cmBookingId) || undefined,
      bookedOn: asString(b.bookedOn) || undefined,
      checkin,
      checkout,
      specialRequests: asString(b.specialRequests) || undefined,
      pah: b.pah === true || asString(b.pah).toLowerCase() === 'true',
      amountAfterTax: asNumber(amount.amountAfterTax),
      currency: asString(amount.currency).toUpperCase(),
      guest: { name: guestName, email: asString(g.email), phone: asString(g.phone) },
      rooms,
    },
  };
}

/** Canal de Aiosell → plataforma de Loomi. Lo que no es Airbnb, Booking o Vrbo/Expedia va como origen propio (platform 'direct'). */
export function channelToPlatform(channel: string): { platform: BookingPlatform; label: string; known: boolean } {
  const c = channel.toLowerCase();
  if (c.includes('airbnb')) return { platform: 'airbnb', label: 'Airbnb', known: true };
  if (c.includes('booking')) return { platform: 'booking', label: 'Booking.com', known: true };
  if (c.includes('vrbo') || c.includes('homeaway') || c.includes('expedia')) {
    return { platform: 'vrbo', label: channel || 'Vrbo', known: true };
  }
  return { platform: 'direct', label: channel || 'Channel manager', known: false };
}

/** Id de la reserva en Loomi: siempre el mismo para la misma reserva de Aiosell (así un reintento no duplica). */
export function channelReservationId(hotelCode: string, bookingId: string, roomIndex = 0, roomCount = 1): string {
  const base = `cm-${hotelCode}-${bookingId}`;
  return roomCount > 1 ? `${base}-${roomIndex + 1}` : base;
}

export interface ChannelReservationContext {
  /** roomCode → id de la unidad de Loomi (null/undefined si no está conectada) */
  unitForRoom: (roomCode: string) => string | null | undefined;
  nowIso: string;
  cleaningChecklist?: CleaningChecklistSettings | null;
}

export interface ChannelReservationResult {
  items: Array<{ reservation: Reservation; cleaningTask: CleaningTask }>;
  /** roomCode que no corresponden a ninguna unidad conectada: quien llama decide qué hacer (avisar, no perder la reserva) */
  unknownRooms: string[];
  /** Moneda de los importes, tal como la mandó Aiosell */
  currency: string;
}

function nightsBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

/** Convierte un book o modify en reservas (una por habitación) y su limpieza al check-out. */
export function bookingToReservations(b: AiosellBooking, ctx: ChannelReservationContext): ChannelReservationResult {
  const { platform, label } = channelToPlatform(b.channel);
  const items: ChannelReservationResult['items'] = [];
  const unknownRooms: string[] = [];
  const count = b.rooms.length;
  const nights = nightsBetween(b.checkin, b.checkout);

  b.rooms.forEach((room, i) => {
    const propertyId = ctx.unitForRoom(room.roomCode);
    if (!propertyId) {
      unknownRooms.push(room.roomCode);
      return;
    }
    const id = channelReservationId(b.hotelCode, b.bookingId, i, count);
    const total = room.total > 0 ? room.total : Math.round((b.amountAfterTax / count) * 100) / 100;
    const people = room.adults + room.children;
    const guestName = b.guest.name || room.guestName || `Reserva ${label}`;
    const specialNotes = b.specialRequests
      ? `${b.specialRequests}\n(Reserva por channel manager: ${label})`
      : `Reserva por channel manager: ${label}`;

    const reservation: Reservation = {
      id,
      propertyId,
      guestName,
      guestEmail: b.guest.email,
      guestPhone: b.guest.phone,
      checkIn: b.checkin,
      checkOut: b.checkout,
      nights,
      guestsCount: Math.max(1, people),
      platform,
      ...(platform === 'direct' ? { origin: '' } : {}),
      totalAmount: total,
      cleaningFee: 0,
      commissionPaid: 0,
      netRevenue: total,
      status: 'confirmed',
      // pah = paga en el alojamiento; si no, cobra el canal
      paymentStatus: b.pah ? 'pending' : 'paid',
      pinCode: '',
      createdAt: ctx.nowIso,
      specialNotes,
      source: 'channel',
      channelBookingId: b.bookingId,
      channelHotelCode: b.hotelCode,
      channelName: label,
      channelRoomIndex: i,
    };

    const cleaningTask: CleaningTask = {
      id: icalCleaningTaskId(id),
      propertyId,
      reservationId: id,
      date: b.checkout,
      scheduledTime: '11:00 - 13:30',
      cleanerName: 'Sin asignar',
      cleanerPhone: '',
      status: 'pending',
      checklist: buildCleaningChecklist(ctx.cleaningChecklist, propertyId),
      notes: `Generado automáticamente por la reserva de ${guestName} (${label})`,
    };

    items.push({ reservation, cleaningTask });
  });

  return { items, unknownRooms, currency: b.currency };
}

const MODIFY_FIELDS = [
  'propertyId',
  'checkIn',
  'checkOut',
  'nights',
  'guestsCount',
  'totalAmount',
  'netRevenue',
  'paymentStatus',
] as const;

/**
 * Qué cambia en una reserva que ya existe cuando llega un modify: solo fechas, unidad, personas e importes.
 * No toca pagos cargados, extras, notas ni PIN. Devuelve {} si no hay nada para cambiar.
 */
export function modificationPatch(existing: Reservation, next: Reservation): Partial<Reservation> {
  const patch: Record<string, unknown> = {};
  for (const f of MODIFY_FIELDS) {
    if (existing[f] !== next[f]) patch[f] = next[f];
  }
  // Un pago ya registrado en Loomi no se pisa con el estado que informa el canal
  if (existing.payments && existing.payments.length > 0) delete patch.paymentStatus;
  return patch as Partial<Reservation>;
}

/* ------------------------------------------------------------------ */
/* 1b. Qué hacer con cada aviso (lo usa functions/api/channel/aiosell.js) */
/* ------------------------------------------------------------------ */

export type ChannelOp =
  | { op: 'create'; reservation: Reservation; cleaningTask: CleaningTask }
  | {
      op: 'update';
      /** attach = reserva que ya estaba en Loomi (a mano o por iCal) y queda atada al canal; modify = cambio que mandó el canal */
      kind: 'attach' | 'modify';
      id: string;
      patch: Partial<Reservation>;
      taskMoves: Array<{ id: string; patch: Partial<CleaningTask> }>;
    }
  | { op: 'cancel'; id: string; deleteTaskIds: string[] }
  /** Limpieza nueva para una reserva que ya existe (reactivada) */
  | { op: 'createTask'; cleaningTask: CleaningTask };

export interface ChannelPlanInput {
  push: AiosellPush;
  ctx: ChannelReservationContext;
  /** Reservas de Loomi con este channelHotelCode + channelBookingId */
  byBooking: Reservation[];
  /** Reservas de las unidades de la reserva con el mismo check-in (para atar en vez de duplicar) */
  candidates: Reservation[];
  /** Limpiezas de las reservas de byBooking y candidates */
  tasks: CleaningTask[];
}

export interface ChannelPlan {
  ops: ChannelOp[];
  unknownRooms: string[];
  /** Una línea por cambio, en castellano, para el registro */
  summary: string[];
}

const GENERIC_NAME = /^(reserva\b|reserved\b|not available|airbnb\b|booking\b|$)/i;
const BLOCK_NAME = /^bloqueado\b/i;

function roomIndexOf(r: Reservation): number {
  if (typeof r.channelRoomIndex === 'number') return r.channelRoomIndex;
  const base = `cm-${r.channelHotelCode}-${r.channelBookingId}-`;
  const n = r.id.startsWith(base) ? Number(r.id.slice(base.length)) : NaN;
  return Number.isInteger(n) && n > 0 ? n - 1 : 0;
}

/** Datos del canal que se suman a una reserva que ya estaba en Loomi, sin pisar lo que cargó el dueño. */
function attachPatch(existing: Reservation, next: Reservation): Partial<Reservation> {
  const patch: Partial<Reservation> = {
    channelBookingId: next.channelBookingId,
    channelHotelCode: next.channelHotelCode,
    channelName: next.channelName,
    channelRoomIndex: next.channelRoomIndex,
  };
  if (GENERIC_NAME.test((existing.guestName || '').trim()) && next.guestName && !GENERIC_NAME.test(next.guestName)) {
    patch.guestName = next.guestName;
  }
  if (!existing.guestEmail && next.guestEmail) patch.guestEmail = next.guestEmail;
  if (!existing.guestPhone && next.guestPhone) patch.guestPhone = next.guestPhone;
  if (existing.source === 'ical' && next.guestsCount > (existing.guestsCount || 0)) patch.guestsCount = next.guestsCount;
  if (!(existing.totalAmount > 0) && next.totalAmount > 0) {
    patch.totalAmount = next.totalAmount;
    patch.netRevenue = next.netRevenue;
  }
  return patch;
}

/** Limpiezas pendientes de una reserva que hay que mover si cambia la salida o la unidad */
function moveTasks(tasks: CleaningTask[], reservationId: string, next: { checkOut: string; propertyId: string }) {
  return tasks
    .filter((t) => t.reservationId === reservationId && t.status === 'pending')
    .map((t) => {
      const patch: Partial<CleaningTask> = {};
      if (t.date !== next.checkOut) patch.date = next.checkOut;
      if (t.propertyId !== next.propertyId) patch.propertyId = next.propertyId;
      return { id: t.id, patch };
    })
    .filter((m) => Object.keys(m.patch).length > 0);
}

const pendingTaskIds = (tasks: CleaningTask[], reservationId: string) =>
  tasks.filter((t) => t.reservationId === reservationId && t.status === 'pending').map((t) => t.id);

/**
 * Decide qué escribir en Loomi por un aviso de Aiosell. Pura: no lee ni escribe nada.
 * - book: crea una reserva por habitación. Si en esa unidad ya hay una reserva no cancelada del mismo canal con las mismas
 *   fechas (cargada a mano o traída por iCal) y sin canal asignado, la ata en vez de duplicar (Aiosell manda las reservas
 *   futuras al conectar un complejo). Un book repetido (reintento) se trata como modify.
 * - modify: cambia fechas, unidad, personas e importes de cada habitación (modificationPatch) y mueve su limpieza pendiente.
 *   Si la reserva no estaba, se trata como book. Habitaciones que ya no vienen: se cancelan.
 * - cancel: cancela todas las habitaciones de esa reserva y borra sus limpiezas pendientes. Si no estaba, no hace nada.
 */
export function planChannelPush(input: ChannelPlanInput): ChannelPlan {
  const { push, ctx, tasks } = input;
  const ops: ChannelOp[] = [];
  const summary: string[] = [];
  const live = input.byBooking.filter((r) => r.status !== 'cancelled');

  if (push.action === 'cancel') {
    for (const r of live) {
      ops.push({ op: 'cancel', id: r.id, deleteTaskIds: pendingTaskIds(tasks, r.id) });
      summary.push(`Cancelada: ${r.guestName} (${r.checkIn} a ${r.checkOut})`);
    }
    if (!live.length) summary.push(`Cancelación de ${push.bookingId}: no había reserva activa en Loomi`);
    return { ops, unknownRooms: [], summary };
  }

  const built = bookingToReservations(push, ctx);
  const used = new Set<string>();

  for (const { reservation: next, cleaningTask } of built.items) {
    const index = next.channelRoomIndex ?? 0;
    const existing =
      input.byBooking.find((r) => roomIndexOf(r) === index && r.status !== 'cancelled') ||
      input.byBooking.find((r) => r.id === next.id);

    if (existing) {
      used.add(existing.id);
      if (existing.status === 'cancelled') {
        // Volvió una reserva que el canal había cancelado: se reactiva con los datos nuevos
        const patch: Partial<Reservation> = { ...modificationPatch(existing, next), status: 'confirmed' };
        ops.push({ op: 'update', kind: 'modify', id: existing.id, patch, taskMoves: [] });
        if (!tasks.some((t) => t.reservationId === existing.id && t.status === 'pending')) {
          ops.push({ op: 'createTask', cleaningTask: { ...cleaningTask, id: icalCleaningTaskId(existing.id), reservationId: existing.id, propertyId: next.propertyId } });
        }
        summary.push(`Reactivada: ${existing.guestName} (${next.checkIn} a ${next.checkOut})`);
        continue;
      }
      const patch = modificationPatch(existing, next);
      if (Object.keys(patch).length) {
        ops.push({ op: 'update', kind: 'modify', id: existing.id, patch, taskMoves: moveTasks(tasks, existing.id, next) });
        summary.push(`Modificada: ${existing.guestName} (${next.checkIn} a ${next.checkOut})`);
      } else {
        summary.push(`Sin cambios: ${existing.guestName} (${next.checkIn} a ${next.checkOut})`);
      }
      continue;
    }

    // ¿Ya estaba en Loomi sin canal (a mano o por iCal)? Se ata.
    const match =
      next.platform !== 'direct'
        ? input.candidates.find(
            (r) =>
              !used.has(r.id) &&
              r.propertyId === next.propertyId &&
              r.status !== 'cancelled' &&
              r.checkIn === next.checkIn &&
              r.checkOut === next.checkOut &&
              r.platform === next.platform &&
              !r.channelBookingId &&
              !BLOCK_NAME.test(r.guestName || '')
          )
        : undefined;
    if (match) {
      used.add(match.id);
      ops.push({ op: 'update', kind: 'attach', id: match.id, patch: attachPatch(match, next), taskMoves: [] });
      summary.push(`Atada a la que ya estaba: ${match.guestName} (${next.checkIn} a ${next.checkOut})`);
      continue;
    }

    ops.push({ op: 'create', reservation: next, cleaningTask });
    summary.push(`Nueva: ${next.guestName} (${next.checkIn} a ${next.checkOut})`);
  }

  // Habitaciones que estaban y ya no vienen en el modify
  if (push.action === 'modify' && built.unknownRooms.length === 0) {
    for (const r of live) {
      if (used.has(r.id)) continue;
      ops.push({ op: 'cancel', id: r.id, deleteTaskIds: pendingTaskIds(tasks, r.id) });
      summary.push(`Cancelada (ya no viene en la reserva): ${r.guestName}`);
    }
  }

  for (const code of built.unknownRooms) summary.push(`Habitación ${code} sin unidad conectada en Loomi: no se cargó`);
  return { ops, unknownRooms: built.unknownRooms, summary };
}

/* ------------------------------------------------------------------ */
/* 2. Loomi → Aiosell                                                  */
/* ------------------------------------------------------------------ */

export interface UnitRoom {
  propertyId: string;
  /** roomCode que Aiosell conoce para esa unidad */
  roomCode: string;
}

export interface RangeOptions {
  /** SUPUESTO: endDate es la última noche incluida. Si Aiosell lo toma como día de salida, pasar false. */
  endInclusive?: boolean;
}

/** Fechas (YYYY-MM-DD) de `days` noches seguidas desde `from` */
export function nightDates(from: string, days: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) out.push(addDays(from, i));
  return out;
}

/** Agrupa noches seguidas con el mismo valor. Las noches con valor null cortan el tramo y no se envían. */
function runs<T>(dates: string[], values: Array<T | null>, same: (a: T, b: T) => boolean) {
  const out: Array<{ first: string; last: string; value: T }> = [];
  let cur: { first: string; last: string; value: T } | null = null;
  dates.forEach((d, i) => {
    const v = values[i];
    if (v === null || v === undefined) {
      cur = null;
      return;
    }
    if (cur && same(cur.value, v)) {
      cur.last = d;
    } else {
      cur = { first: d, last: d, value: v };
      out.push(cur);
    }
  });
  return out;
}

function endOf(last: string, opts?: RangeOptions): string {
  return opts?.endInclusive === false ? addDays(last, 1) : last;
}

type ReservationLike = Pick<Reservation, 'propertyId' | 'checkIn' | 'checkOut' | 'status'>;

export interface AvailabilityBody {
  hotelCode: string;
  updates: Array<{ startDate: string; endDate: string; rooms: Array<{ roomCode: string; available: number }> }>;
}

/**
 * Disponibilidad por noche y por unidad (0 ocupada, 1 libre). Cuentan todas las reservas no canceladas y los bloqueos
 * (en Loomi los bloqueos de iCal también son reservas). Las unidades que tienen el mismo tramo se mandan juntas.
 */
export function availabilityUpdates(
  input: { hotelCode: string; units: UnitRoom[]; reservations: ReservationLike[]; from: string; days: number } & RangeOptions
): AvailabilityBody {
  const dates = nightDates(input.from, input.days);
  const merged = new Map<string, AvailabilityBody['updates'][number]>();

  for (const unit of input.units) {
    const free: number[] = dates.map(() => 1);
    for (const r of input.reservations) {
      if (r.propertyId !== unit.propertyId || r.status === 'cancelled') continue;
      dates.forEach((d, i) => {
        if (d >= r.checkIn && d < r.checkOut) free[i] = 0;
      });
    }
    for (const run of runs(dates, free, (a, b) => a === b)) {
      const end = endOf(run.last, input);
      const key = `${run.first}|${end}`;
      const entry = merged.get(key) || { startDate: run.first, endDate: end, rooms: [] };
      entry.rooms.push({ roomCode: unit.roomCode, available: run.value });
      merged.set(key, entry);
    }
  }

  return { hotelCode: input.hotelCode, updates: sortUpdates([...merged.values()]) };
}

function sortUpdates<T extends { startDate: string; endDate: string }>(list: T[]): T[] {
  return list.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate));
}

/** Ajuste del precio que se manda: sin ajuste = "igual que Tarifas"; percent = "Tarifas + X %" (puede ser negativo) */
export interface RateAdjustment {
  percent: number;
}

export interface RatesBody {
  hotelCode: string;
  updates: Array<{
    startDate: string;
    endDate: string;
    rates: Array<{ roomCode: string; rateplanCode: string; rate: number }>;
  }>;
}

export interface RestrictionsBody {
  hotelCode: string;
  updates: Array<{
    startDate: string;
    endDate: string;
    rooms: Array<{ roomCode: string; restrictions: { minimumStay: number } }>;
  }>;
}

interface NightSeries {
  roomCode: string;
  /** null = sin precio cargado: esa noche no se manda */
  prices: Array<number | null>;
  minNights: number[];
}

function nightSeries(
  input: { units: UnitRoom[]; properties: Property[]; pricing: PricingSettings | null | undefined; from: string; days: number },
  adjustment?: RateAdjustment | null
): NightSeries[] {
  const dates = nightDates(input.from, input.days);
  const factor = 1 + (adjustment?.percent || 0) / 100;
  const out: NightSeries[] = [];
  for (const unit of input.units) {
    const property = input.properties.find((p) => p.id === unit.propertyId);
    if (!property) continue;
    const prices: Array<number | null> = [];
    const minNights: number[] = [];
    for (const d of dates) {
      const q = quoteStay(input.pricing, property, d, addDays(d, 1));
      const price = q.nights[0]?.price || 0;
      prices.push(price > 0 ? Math.round(price * factor) : null);
      minNights.push(Math.max(1, q.minNights || 1));
    }
    out.push({ roomCode: unit.roomCode, prices, minNights });
  }
  return out;
}

/** Precios por noche y por unidad, con el mismo cálculo de Tarifas (`quoteStay`). Noches seguidas con igual precio van en un tramo. */
export function rateUpdates(
  input: {
    hotelCode: string;
    units: UnitRoom[];
    properties: Property[];
    pricing: PricingSettings | null | undefined;
    from: string;
    days: number;
    rateplanCode?: string;
    adjustment?: RateAdjustment | null;
  } & RangeOptions
): RatesBody {
  const dates = nightDates(input.from, input.days);
  const plan = input.rateplanCode || 'STD';
  const merged = new Map<string, RatesBody['updates'][number]>();
  for (const s of nightSeries(input, input.adjustment)) {
    for (const run of runs(dates, s.prices, (a, b) => a === b)) {
      const end = endOf(run.last, input);
      const key = `${run.first}|${end}`;
      const entry = merged.get(key) || { startDate: run.first, endDate: end, rates: [] };
      entry.rates.push({ roomCode: s.roomCode, rateplanCode: plan, rate: run.value });
      merged.set(key, entry);
    }
  }
  return { hotelCode: input.hotelCode, updates: sortUpdates([...merged.values()]) };
}

/** Estadía mínima por noche y por unidad (la de la temporada o el fin de semana largo de esa noche). */
export function minimumStayUpdates(
  input: {
    hotelCode: string;
    units: UnitRoom[];
    properties: Property[];
    pricing: PricingSettings | null | undefined;
    from: string;
    days: number;
  } & RangeOptions
): RestrictionsBody {
  const dates = nightDates(input.from, input.days);
  const merged = new Map<string, RestrictionsBody['updates'][number]>();
  for (const s of nightSeries(input)) {
    for (const run of runs(dates, s.minNights, (a, b) => a === b)) {
      const end = endOf(run.last, input);
      const key = `${run.first}|${end}`;
      const entry = merged.get(key) || { startDate: run.first, endDate: end, rooms: [] };
      entry.rooms.push({ roomCode: s.roomCode, restrictions: { minimumStay: run.value } });
      merged.set(key, entry);
    }
  }
  return { hotelCode: input.hotelCode, updates: sortUpdates([...merged.values()]) };
}
