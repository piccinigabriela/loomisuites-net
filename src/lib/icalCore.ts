/**
 * Núcleo de la sincronización iCal (Airbnb, Booking, otro portal, Google Calendar).
 *
 * No depende de Firebase: lo usan tanto la app (src/lib/icalSync.ts) como la función
 * programada del servidor (server-sync/). La lógica de qué se crea, se actualiza o se
 * cancela vive solo acá; cada lado aporta cómo leer los calendarios y cómo escribir.
 *
 * Idempotencia: los IDs son deterministas (la reserva sale del UID del evento y la tarea
 * de limpieza sale del ID de la reserva). La creación se hace con "crear solo si no existe",
 * así que si la app y el servidor sincronizan al mismo tiempo, el resultado es el mismo.
 */
import type { Property, Reservation, CleaningTask } from '../types';

export type IcalPortal = 'airbnb' | 'booking' | 'vrbo' | 'google';

export interface IcalEvent {
  uid: string;
  summary: string;
  start: string;
  end: string;
}

/** Fecha local YYYY-MM-DD del dispositivo (no UTC). */
export function getLocalDateString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Fecha YYYY-MM-DD en una zona horaria dada (el servidor corre en UTC). */
export function getDateStringInTimeZone(timeZone: string, date: Date = new Date()): string {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Hash corto, determinista y alfanumérico. */
export function shortHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash >>> 0).toString(36);
}

/** ID de la reserva importada: siempre el mismo para el mismo evento del mismo portal y unidad. */
export function icalReservationId(portal: IcalPortal, propertyId: string, eventUid: string): string {
  return `ical-${portal}-${propertyId}-${shortHash(eventUid)}`;
}

/** ID de la tarea de limpieza de una reserva importada (determinista: evita limpiezas repetidas). */
export function icalCleaningTaskId(reservationId: string): string {
  return `clean-${reservationId}`;
}

/** Enlaces iCal cargados en una unidad, en el mismo orden de siempre. */
export function propertyFeeds(property: Property): Array<{ portal: IcalPortal; url: string }> {
  const all: Array<{ portal: IcalPortal; url?: string }> = [
    { portal: 'airbnb', url: property.icalAirbnbUrl },
    { portal: 'booking', url: property.icalBookingUrl },
    { portal: 'vrbo', url: property.icalOtherUrl },
    { portal: 'google', url: property.icalGoogleUrl },
  ];
  return all
    .filter((f) => Boolean(f.url && f.url.trim()))
    .map((f) => ({ portal: f.portal, url: (f.url as string).trim() }));
}

export function propertyHasFeeds(property: Property): boolean {
  return propertyFeeds(property).length > 0;
}

/** Valida que el texto descargado sea un calendario iCal. */
export function assertIcalText(text: string): string {
  if (!text.includes('BEGIN:VCALENDAR')) {
    throw new Error('El contenido obtenido no es un archivo iCalendar válido');
  }
  return text;
}

/** Convierte el texto iCalendar en una lista de eventos. */
export function parseIcal(text: string): IcalEvent[] {
  // Unfold folded lines (RFC 5545: CRLF or LF followed by space or tab)
  const unfoldedText = text.replace(/\r?\n[ \t]/g, '');
  const lines = unfoldedText.split(/\r?\n/);

  const events: IcalEvent[] = [];
  let inEvent = false;
  let currentEventLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEventLines = [];
    } else if (trimmed === 'END:VEVENT') {
      if (inEvent) {
        inEvent = false;
        let uid = '';
        let summary = '';
        let dtStartStr = '';
        let dtEndStr = '';

        for (const eline of currentEventLines) {
          if (eline.startsWith('UID:') || eline.startsWith('UID;')) {
            uid = eline.substring(eline.indexOf(':') + 1).trim();
          } else if (eline.startsWith('SUMMARY:') || eline.startsWith('SUMMARY;')) {
            summary = eline.substring(eline.indexOf(':') + 1).trim();
          } else if (eline.startsWith('DTSTART:') || eline.startsWith('DTSTART;')) {
            dtStartStr = eline.substring(eline.indexOf(':') + 1).trim();
          } else if (eline.startsWith('DTEND:') || eline.startsWith('DTEND;')) {
            dtEndStr = eline.substring(eline.indexOf(':') + 1).trim();
          }
        }

        const parseIcalDate = (dStr: string): string | null => {
          const match = dStr.match(/\d{8}/);
          if (!match) return null;
          const yyyy = match[0].substring(0, 4);
          const mm = match[0].substring(4, 6);
          const dd = match[0].substring(6, 8);
          return `${yyyy}-${mm}-${dd}`;
        };

        const start = parseIcalDate(dtStartStr);
        let end = parseIcalDate(dtEndStr);

        if (start) {
          if (!end || end <= start) {
            const sDate = new Date(start + 'T00:00:00Z');
            sDate.setUTCDate(sDate.getUTCDate() + 1);
            end = sDate.toISOString().split('T')[0];
          }

          events.push({
            uid: uid || `no-uid-${start}-${end}`,
            summary: summary,
            start,
            end,
          });
        }
      }
    } else if (inEvent) {
      currentEventLines.push(line);
    }
  }

  return events;
}

// ---------------------------------------------------------------------------
// Descarga de calendarios
// ---------------------------------------------------------------------------

export type FeedResult =
  | { property: Property; portal: IcalPortal; ok: true; events: IcalEvent[] }
  | { property: Property; portal: IcalPortal; ok: false; error: string };

/** Descarga y lee todos los enlaces iCal de las unidades. Un error en un enlace no frena a los demás. */
export async function fetchAllFeeds(
  properties: Property[],
  fetchText: (url: string) => Promise<string>
): Promise<FeedResult[]> {
  const results: FeedResult[] = [];
  for (const property of properties) {
    for (const { portal, url } of propertyFeeds(property)) {
      try {
        const text = await fetchText(url);
        results.push({ property, portal, ok: true, events: parseIcal(text) });
      } catch (err: any) {
        results.push({ property, portal, ok: false, error: err?.message || String(err) });
      }
    }
  }
  return results;
}

/** Fechas bloqueadas (no son reservas): Airbnb las publica como "Not available" o "Blocked". */
export function isBlockedSummary(summary: string): boolean {
  const sumUpper = (summary || '').toUpperCase();
  return sumUpper.includes('NOT AVAILABLE') || sumUpper.includes('BLOCKED');
}

/** IDs de reserva que podría tocar la sincronización (sirve al servidor para leer solo lo necesario). */
export function candidateReservationIds(feeds: FeedResult[], today: string): string[] {
  const ids = new Set<string>();
  for (const feed of feeds) {
    if (feed.ok === false) continue;
    for (const ev of (feed as { events: IcalEvent[] }).events) {
      if (ev.end < today) continue;
      if (feed.portal === 'airbnb' && isBlockedSummary(ev.summary) && !feed.property.importAirbnbBlocks) continue;
      ids.add(icalReservationId(feed.portal, feed.property.id, ev.uid));
    }
  }
  return [...ids];
}

// ---------------------------------------------------------------------------
// Aplicar cambios
// ---------------------------------------------------------------------------

/** Cómo escribe cada lado (app o servidor). Todas las operaciones deben poder repetirse sin efectos extra. */
export interface IcalSyncWriter {
  /** Crea reserva + limpieza solo si la reserva no existe. Devuelve false si ya estaba (otra sincronización la creó). */
  createIfAbsent(reservation: Reservation, cleaningTask: CleaningTask): Promise<boolean>;
  /** Cambia solo las fechas y noches de una reserva existente. */
  updateDates(reservationId: string, data: { checkIn: string; checkOut: string; nights: number }): Promise<void>;
  /** Pasa las limpiezas pendientes indicadas a otra fecha (nuevo día de salida). */
  moveCleaningTasks(taskIds: string[], date: string): Promise<void>;
  /** Marca la reserva como cancelada y borra sus limpiezas pendientes. */
  cancel(reservationId: string, pendingCleaningTaskIds: string[]): Promise<void>;
}

export type IcalChange =
  | {
      tipo: 'nueva';
      propertyId: string;
      unitName: string;
      portal: IcalPortal;
      reservation: Reservation;
      cleaningTask: CleaningTask;
      /** false si al escribir ya existía (la creó otra sincronización al mismo tiempo) */
      aplicada?: boolean;
    }
  | {
      tipo: 'fechas';
      propertyId: string;
      unitName: string;
      portal: IcalPortal;
      reservationId: string;
      guestName: string;
      antes: { checkIn: string; checkOut: string };
      despues: { checkIn: string; checkOut: string; nights: number };
      /** Limpiezas pendientes que se pasan al nuevo día de salida */
      cleaningTaskIds: string[];
    }
  | {
      tipo: 'cancelada';
      propertyId: string;
      unitName: string;
      portal: IcalPortal;
      reservationId: string;
      guestName: string;
      checkIn: string;
      checkOut: string;
      cleaningTaskIds: string[];
    };

export interface SyncResult {
  agregadas: number;
  actualizadas: number;
  canceladas: number;
  errores: Array<{ propertyId: string; propertyName: string; portal: string; error: string }>;
  conflictos: Array<{ propertyId: string; unitName: string; resA: Reservation; resB: Reservation }>;
  /** Detalle de cada cambio (en modo prueba: lo que se haría) */
  cambios: IcalChange[];
  /** Calendarios que vinieron vacíos y se ignoraron para no cancelar todo de golpe */
  avisos: string[];
  /** Reservas como quedaron después de sincronizar (las que se pasaron más los cambios) */
  reservasResultantes?: Reservation[];
}

export interface RunIcalSyncInput {
  properties: Property[];
  reservations: Reservation[];
  cleaningTasks: CleaningTask[];
  feeds: FeedResult[];
  /** Fecha de hoy YYYY-MM-DD en la zona del complejo */
  today: string;
  /** Sin writer = modo prueba: calcula todo y no escribe nada */
  writer?: IcalSyncWriter | null;
  nowIso?: string;
}

function nightsBetween(start: string, end: string): number {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));
}

/**
 * Compara los calendarios descargados con las reservas y aplica (o, en modo prueba, solo lista)
 * los cambios. Misma lógica que tenía la app:
 * - eventos que terminan hoy o después;
 * - bloqueos de Airbnb solo si la unidad tiene importAirbnbBlocks;
 * - no duplica una reserva manual con exactamente las mismas fechas;
 * - si cambian las fechas, actualiza solo checkIn, checkOut y noches;
 * - cancela las reservas importadas que desaparecieron del calendario (salvo calendario vacío con 3+ reservas);
 * - si un enlace falla, no toca las reservas de esa unidad/portal.
 */
export async function runIcalSync(input: RunIcalSyncInput): Promise<SyncResult> {
  const { properties, cleaningTasks, feeds, today, writer } = input;
  const nowIso = input.nowIso || new Date().toISOString();

  let agregadas = 0;
  let actualizadas = 0;
  let canceladas = 0;
  const errores: SyncResult['errores'] = [];
  const cambios: IcalChange[] = [];
  const avisos: string[] = [];

  // Copia de trabajo para que cada calendario vea lo que hizo el anterior
  let workingReservations = [...input.reservations];

  // Una cancelación o un cambio de fechas puede liberar fechas que frenaban una reserva de otro portal
  // ("ya hay una reserva con las mismas fechas"). Se repite la pasada hasta que no haya más cambios:
  // así una sola corrida deja todo igual que dos corridas seguidas.
  for (let pass = 0; pass < 3; pass++) {
    const cambiosAntes = cambios.length;
    for (const feed of feeds) {
      const { property, portal } = feed;

      if (feed.ok === false) {
        if (pass === 0) errores.push({ propertyId: property.id, propertyName: property.name, portal, error: (feed as { error: string }).error });
        // Si falla, NO tocar ninguna reserva existente de esa unidad/portal
        continue;
      }

      // Considerar solo eventos que terminan hoy o después
      const activeEvents = (feed as { events: IcalEvent[] }).events.filter((ev) => ev.end >= today);
      const fetchedResIds = new Set<string>();

      for (const event of activeEvents) {
        const isBlocked = isBlockedSummary(event.summary);

        // Para Airbnb: si la unidad NO tiene importAirbnbBlocks en true, ignorar fechas bloqueadas de Airbnb
        if (portal === 'airbnb' && isBlocked && !property.importAirbnbBlocks) {
          continue;
        }

        const resId = icalReservationId(portal, property.id, event.uid);
        fetchedResIds.add(resId);

        const existingRes = workingReservations.find((r) => r.id === resId);

        if (!existingRes) {
          // Si ya hay en esa unidad una reserva no cancelada cargada a mano con exactamente las mismas fechas, no crear nada.
          const manualDuplicate = workingReservations.some(
            (r) =>
              r.propertyId === property.id &&
              r.status !== 'cancelled' &&
              r.checkIn === event.start &&
              r.checkOut === event.end
          );
          if (manualDuplicate) continue;

          const portalName =
            portal === 'airbnb' ? 'Airbnb' : portal === 'booking' ? 'Booking' : portal === 'google' ? 'Google Calendar' : 'otro portal';

          let guestName = '';
          if (portal === 'google') {
            guestName = event.summary && event.summary.trim() !== '' ? event.summary.trim() : 'Reserva Google Calendar';
          } else {
            guestName = isBlocked ? `Bloqueado en ${portalName}` : `Reserva ${portalName}`;
          }

          const platform = portal === 'google' ? 'direct' : portal;
          const specialNotes =
            portal === 'google' ? 'Importada desde Google Calendar' : `Importada automáticamente desde ${portalName}`;

          const newRes: Reservation = {
            id: resId,
            propertyId: property.id,
            guestName,
            guestEmail: '',
            guestPhone: '',
            checkIn: event.start,
            checkOut: event.end,
            nights: nightsBetween(event.start, event.end),
            guestsCount: 1,
            platform,
            totalAmount: 0,
            cleaningFee: 0,
            commissionPaid: 0,
            netRevenue: 0,
            status: 'confirmed',
            paymentStatus: 'paid',
            pinCode: '',
            createdAt: nowIso,
            specialNotes,
            source: 'ical',
            icalUid: event.uid,
            icalSource: portal,
          };

          const newCleaningTask: CleaningTask = {
            id: icalCleaningTaskId(resId),
            propertyId: property.id,
            reservationId: resId,
            date: event.end,
            scheduledTime: '11:00 - 13:30',
            cleanerName: 'Sin asignar',
            cleanerPhone: '',
            status: 'pending',
            checklist: [
              { id: 'c1', task: 'Cambio integral de sábanas y toallas limpias', completed: false },
              { id: 'c2', task: 'Sanitización de baños y reposición de amenities', completed: false },
              { id: 'c3', task: 'Limpieza profunda de cocina y vajilla', completed: false },
              { id: 'c4', task: 'Llaves en su lugar', completed: false },
            ],
            notes: `Generado automáticamente por importación de ${guestName}`,
          };

          const change: IcalChange = {
            tipo: 'nueva',
            propertyId: property.id,
            unitName: property.name,
            portal,
            reservation: newRes,
            cleaningTask: newCleaningTask,
          };

          if (writer) {
            const created = await writer.createIfAbsent(newRes, newCleaningTask);
            change.aplicada = created;
            if (created) agregadas++;
          } else {
            agregadas++;
          }
          cambios.push(change);
          workingReservations = [newRes, ...workingReservations];
        } else if (existingRes.source === 'ical') {
          // Si cambiaron las fechas: actualizar SOLO checkIn, checkOut y nights
          if (existingRes.checkIn !== event.start || existingRes.checkOut !== event.end) {
            const nights = nightsBetween(event.start, event.end);
            // Si cambió el día de salida, la limpieza pendiente se mueve con él.
            // Solo las que seguían en la salida anterior: si alguien la cambió a mano, se respeta.
            const tasksToMove =
              existingRes.checkOut !== event.end
                ? cleaningTasks
                    .filter(
                      (t) =>
                        t.reservationId === resId && t.status === 'pending' && t.date === existingRes.checkOut
                    )
                    .map((t) => t.id)
                : [];
            if (writer) {
              await writer.updateDates(resId, { checkIn: event.start, checkOut: event.end, nights });
              if (tasksToMove.length) await writer.moveCleaningTasks(tasksToMove, event.end);
            }
            cambios.push({
              tipo: 'fechas',
              propertyId: property.id,
              unitName: property.name,
              portal,
              reservationId: resId,
              guestName: existingRes.guestName,
              antes: { checkIn: existingRes.checkIn, checkOut: existingRes.checkOut },
              despues: { checkIn: event.start, checkOut: event.end, nights },
              cleaningTaskIds: tasksToMove,
            });
            const updatedRes: Reservation = { ...existingRes, checkIn: event.start, checkOut: event.end, nights };
            workingReservations = workingReservations.map((r) => (r.id === resId ? updatedRes : r));
            actualizadas++;
          }
        }
      }

      // Cancelaciones: reservas de esa unidad con source 'ical', ese mismo portal, no canceladas y con checkOut >= hoy
      const existingFutureIcalRes = workingReservations.filter(
        (r) =>
          r.propertyId === property.id &&
          r.source === 'ical' &&
          r.icalSource === portal &&
          r.status !== 'cancelled' &&
          r.checkOut >= today
      );

      // Protección: si el calendario vino sin ningún evento y había 3 o más reservas futuras de ese portal, no cancelar nada
      if (activeEvents.length === 0 && existingFutureIcalRes.length >= 3) {
        const aviso = `Calendario de ${portal} en ${property.name} vino vacío; se ignoró cancelación masiva de seguridad`;
        if (pass === 0) {
          console.warn(aviso);
          avisos.push(aviso);
        }
        continue;
      }

      for (const existingRes of existingFutureIcalRes) {
        if (fetchedResIds.has(existingRes.id)) continue;

        // Limpiezas pendientes asociadas a la reserva cancelada
        const pendingTaskIds = cleaningTasks
          .filter((t) => t.reservationId === existingRes.id && t.status === 'pending')
          .map((t) => t.id);

        if (writer) {
          await writer.cancel(existingRes.id, pendingTaskIds);
        }
        cambios.push({
          tipo: 'cancelada',
          propertyId: property.id,
          unitName: property.name,
          portal,
          reservationId: existingRes.id,
          guestName: existingRes.guestName,
          checkIn: existingRes.checkIn,
          checkOut: existingRes.checkOut,
          cleaningTaskIds: pendingTaskIds,
        });

        const cancelledRes: Reservation = { ...existingRes, status: 'cancelled' };
        workingReservations = workingReservations.map((r) => (r.id === existingRes.id ? cancelledRes : r));
        canceladas++;
      }
    }
    if (cambios.length === cambiosAntes) break;
  }

  return {
    agregadas,
    actualizadas,
    canceladas,
    errores,
    conflictos: findConflicts(properties, workingReservations, today),
    cambios,
    avisos,
    reservasResultantes: workingReservations,
  };
}

/** Superposiciones (posibles dobles reservas), solo reservas con checkOut >= hoy. */
export function findConflicts(
  properties: Property[],
  reservations: Reservation[],
  today: string
): SyncResult['conflictos'] {
  const conflictos: SyncResult['conflictos'] = [];
  const activeByProp = new Map<string, Reservation[]>();

  for (const r of reservations) {
    if (r.status === 'cancelled' || r.checkOut < today) continue;
    const list = activeByProp.get(r.propertyId) || [];
    list.push(r);
    activeByProp.set(r.propertyId, list);
  }

  for (const [propId, list] of activeByProp.entries()) {
    const propObj = properties.find((p) => p.id === propId);
    const unitName = propObj?.name || 'Unidad';

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (a.checkIn < b.checkOut && b.checkIn < a.checkOut) {
          conflictos.push({ propertyId: propId, unitName, resA: a, resB: b });
        }
      }
    }
  }

  return conflictos;
}

/** Texto legible de un cambio (para el modo prueba y los registros). */
export function describeChange(c: IcalChange): string {
  const portal = c.portal === 'vrbo' ? 'otro portal' : c.portal;
  if (c.tipo === 'nueva') {
    const r = c.reservation;
    const extra = c.aplicada === false ? ' (ya la había creado otra sincronización)' : '';
    return `NUEVA     · ${c.unitName} · ${portal} · ${r.checkIn} → ${r.checkOut} (${r.nights} noches) · "${r.guestName}" + limpieza el ${c.cleaningTask.date}${extra}`;
  }
  if (c.tipo === 'fechas') {
    const limpieza = c.cleaningTaskIds.length ? ` (la limpieza pasa al ${c.despues.checkOut})` : '';
    return `FECHAS    · ${c.unitName} · ${portal} · "${c.guestName}" ${c.antes.checkIn} → ${c.antes.checkOut} pasa a ${c.despues.checkIn} → ${c.despues.checkOut}${limpieza}`;
  }
  const limpieza = c.cleaningTaskIds.length ? ` y se borra${c.cleaningTaskIds.length > 1 ? 'n' : ''} ${c.cleaningTaskIds.length} limpieza(s) pendiente(s)` : '';
  return `CANCELADA · ${c.unitName} · ${portal} · "${c.guestName}" ${c.checkIn} → ${c.checkOut}${limpieza}`;
}
