import { Property, Reservation, CleaningTask } from '../types';
import { saveReservationDoc, saveCleaningTaskDoc } from './tenantStore';

/**
 * Short deterministic alphanumeric hash
 */
function shortHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash >>> 0).toString(36);
}

/**
 * Fetches iCal feed via proxy endpoint
 */
export async function fetchIcalText(url: string): Promise<string> {
  if (!url || !url.trim()) throw new Error('URL vacía');
  const proxyUrl = 'https://ical.loomisuite.net/proxy?url=' + encodeURIComponent(url.trim());
  const res = await fetch(proxyUrl);
  if (!res.ok) {
    throw new Error(`Error en respuesta del proxy iCal (${res.status})`);
  }
  const text = await res.text();
  if (!text.includes('BEGIN:VCALENDAR')) {
    throw new Error('El contenido obtenido no es un archivo iCalendar válido');
  }
  return text;
}

/**
 * Parses iCalendar text into array of VEVENT items
 */
export function parseIcal(text: string): Array<{ uid: string; summary: string; start: string; end: string }> {
  // Unfold folded lines (RFC 5545: CRLF or LF followed by space or tab)
  const unfoldedText = text.replace(/\r?\n[ \t]/g, '');
  const lines = unfoldedText.split(/\r?\n/);

  const events: Array<{ uid: string; summary: string; start: string; end: string }> = [];
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
          if (!end) {
            const sDate = new Date(start + 'T00:00:00Z');
            sDate.setUTCDate(sDate.getUTCDate() + 1);
            end = sDate.toISOString().split('T')[0];
          }

          if (end > start) {
            events.push({
              uid: uid || `no-uid-${start}-${end}`,
              summary: summary || 'Reserva iCal',
              start,
              end,
            });
          }
        }
      }
    } else if (inEvent) {
      currentEventLines.push(line);
    }
  }

  return events;
}

export interface SyncResult {
  agregadas: number;
  actualizadas: number;
  canceladas: number;
  errores: Array<{ propertyId: string; propertyName: string; portal: string; error: string }>;
  conflictos: Array<{ propertyId: string; unitName: string; resA: Reservation; resB: Reservation }>;
}

/**
 * Synchronizes external portal calendars with Loomi Suite
 */
export async function syncCalendars(
  uid: string,
  properties: Property[],
  reservations: Reservation[]
): Promise<SyncResult> {
  const todayStr = new Date().toISOString().split('T')[0];
  let agregadas = 0;
  let actualizadas = 0;
  let canceladas = 0;
  const errores: Array<{ propertyId: string; propertyName: string; portal: string; error: string }> = [];

  // Local working copy of reservations to update state sequentially
  let workingReservations = [...reservations];

  for (const property of properties) {
    const portalConfigs: Array<{ portal: 'airbnb' | 'booking' | 'vrbo'; url?: string }> = [
      { portal: 'airbnb', url: property.icalAirbnbUrl },
      { portal: 'booking', url: property.icalBookingUrl },
      { portal: 'vrbo', url: property.icalOtherUrl },
    ];

    for (const { portal, url } of portalConfigs) {
      if (!url || !url.trim()) continue;

      let allEvents: Array<{ uid: string; summary: string; start: string; end: string }> = [];
      try {
        const text = await fetchIcalText(url);
        allEvents = parseIcal(text);
      } catch (err: any) {
        errores.push({
          propertyId: property.id,
          propertyName: property.name,
          portal,
          error: err?.message || String(err),
        });
        // Si falla, NO tocar ninguna reserva existente de esa unidad/portal
        continue;
      }

      // Considerar solo eventos que terminan hoy o después
      const activeEvents = allEvents.filter((ev) => ev.end >= todayStr);
      const fetchedResIds = new Set<string>();

      for (const event of activeEvents) {
        const resId = `ical-${portal}-${property.id}-${shortHash(event.uid)}`;
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

          if (!manualDuplicate) {
            const sumUpper = (event.summary || '').toUpperCase();
            const isBlocked = sumUpper.includes('NOT AVAILABLE') || sumUpper.includes('BLOCKED');
            const portalName = portal === 'airbnb' ? 'Airbnb' : portal === 'booking' ? 'Booking' : 'otro portal';
            const guestName = isBlocked ? `Bloqueado en ${portalName}` : `Reserva ${portalName}`;

            const startMs = new Date(event.start).getTime();
            const endMs = new Date(event.end).getTime();
            const nights = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));

            const newRes: Reservation = {
              id: resId,
              propertyId: property.id,
              guestName,
              guestEmail: '',
              guestPhone: '',
              checkIn: event.start,
              checkOut: event.end,
              nights,
              guestsCount: 1,
              platform: portal,
              totalAmount: 0,
              cleaningFee: 0,
              commissionPaid: 0,
              netRevenue: 0,
              status: 'confirmed',
              paymentStatus: 'paid',
              pinCode: '',
              createdAt: new Date().toISOString(),
              specialNotes: `Importada automáticamente desde ${portalName}`,
              source: 'ical',
              icalUid: event.uid,
              icalSource: portal,
            };

            await saveReservationDoc(uid, newRes);

            const newCleaningTask: CleaningTask = {
              id: `clean-ical-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
                { id: 'c4', task: 'Comprobación de cerradura inteligente', completed: false },
              ],
              notes: `Generado automáticamente por importación de ${guestName}`,
            };

            await saveCleaningTaskDoc(uid, newCleaningTask);

            workingReservations = [newRes, ...workingReservations];
            agregadas++;
          }
        } else if (existingRes.source === 'ical') {
          // Si la reserva ya existe con source 'ical' y cambiaron las fechas: actualizar SOLO checkIn, checkOut y nights
          if (existingRes.checkIn !== event.start || existingRes.checkOut !== event.end) {
            const startMs = new Date(event.start).getTime();
            const endMs = new Date(event.end).getTime();
            const nights = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));

            const updatedRes: Reservation = {
              ...existingRes,
              checkIn: event.start,
              checkOut: event.end,
              nights,
            };

            await saveReservationDoc(uid, updatedRes);

            workingReservations = workingReservations.map((r) => (r.id === resId ? updatedRes : r));
            actualizadas++;
          }
        }
      }

      // Cancelaciones: las reservas existentes de esa unidad con source 'ical', ese mismo icalSource, no canceladas y con checkOut >= hoy
      const existingFutureIcalRes = workingReservations.filter(
        (r) =>
          r.propertyId === property.id &&
          r.source === 'ical' &&
          r.icalSource === portal &&
          r.status !== 'cancelled' &&
          r.checkOut >= todayStr
      );

      // Protección: si el calendario vino sin ningún evento y había 3 o más reservas futuras de ese portal, no cancelar nada
      if (activeEvents.length === 0 && existingFutureIcalRes.length >= 3) {
        console.warn(
          `Calendario de ${portal} en ${property.name} vino vacío; se ignoró cancelación masiva de seguridad`
        );
      } else {
        for (const existingRes of existingFutureIcalRes) {
          if (!fetchedResIds.has(existingRes.id)) {
            const cancelledRes: Reservation = {
              ...existingRes,
              status: 'cancelled',
            };
            await saveReservationDoc(uid, cancelledRes);

            workingReservations = workingReservations.map((r) => (r.id === existingRes.id ? cancelledRes : r));
            canceladas++;
          }
        }
      }
    }
  }

  // Superposiciones / Conflictos
  const conflictos: Array<{ propertyId: string; unitName: string; resA: Reservation; resB: Reservation }> = [];
  const activeByProp = new Map<string, Reservation[]>();

  for (const r of workingReservations) {
    if (r.status === 'cancelled') continue;
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
          conflictos.push({
            propertyId: propId,
            unitName,
            resA: a,
            resB: b,
          });
        }
      }
    }
  }

  return { agregadas, actualizadas, canceladas, errores, conflictos };
}
