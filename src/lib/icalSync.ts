import { doc, runTransaction, updateDoc, deleteDoc } from 'firebase/firestore';
import { Property, Reservation, CleaningTask } from '../types';
import { db } from './firebase';
import {
  assertIcalText,
  fetchAllFeeds,
  getLocalDateString,
  IcalSyncWriter,
  parseIcal,
  runIcalSync,
  SyncResult,
} from './icalCore';

export { parseIcal };
export type { SyncResult };

/**
 * Descarga un calendario iCal a través del proxy (el navegador no puede leer Airbnb/Booking directo por CORS).
 */
export async function fetchIcalText(url: string): Promise<string> {
  if (!url || !url.trim()) throw new Error('URL vacía');
  const proxyUrl = 'https://ical.loomisuite.net/proxy?url=' + encodeURIComponent(url.trim());
  const res = await fetch(proxyUrl);
  if (!res.ok) {
    throw new Error(`Error en respuesta del proxy iCal (${res.status})`);
  }
  return assertIcalText(await res.text());
}

function isNotFound(err: any): boolean {
  return err?.code === 'not-found' || /no document to update/i.test(err?.message || '');
}

/** Escritura desde la app. Repetible: si el servidor ya hizo el cambio, no se duplica nada. */
function webWriter(uid: string): IcalSyncWriter {
  return {
    async createIfAbsent(reservation: Reservation, cleaningTask: CleaningTask) {
      const resRef = doc(db, 'tenants', uid, 'reservations', reservation.id);
      const taskRef = doc(db, 'tenants', uid, 'cleaningTasks', cleaningTask.id);
      return runTransaction(db, async (tx) => {
        const snap = await tx.get(resRef);
        if (snap.exists()) return false;
        tx.set(resRef, reservation);
        tx.set(taskRef, cleaningTask);
        return true;
      });
    },
    async updateDates(reservationId, data) {
      try {
        await updateDoc(doc(db, 'tenants', uid, 'reservations', reservationId), data);
      } catch (err) {
        if (!isNotFound(err)) throw err; // si la borraron a mano, no la revivimos
      }
    },
    async cancel(reservationId, pendingCleaningTaskIds) {
      try {
        await updateDoc(doc(db, 'tenants', uid, 'reservations', reservationId), { status: 'cancelled' });
      } catch (err) {
        if (!isNotFound(err)) throw err;
      }
      for (const taskId of pendingCleaningTaskIds) {
        try {
          await deleteDoc(doc(db, 'tenants', uid, 'cleaningTasks', taskId));
        } catch (err) {
          console.warn('Error borrando tarea de limpieza de reserva cancelada:', err);
        }
      }
    },
  };
}

/**
 * Sincroniza los calendarios de los portales desde la app (respaldo de la sincronización del servidor).
 */
export async function syncCalendars(
  uid: string,
  properties: Property[],
  reservations: Reservation[],
  cleaningTasks: CleaningTask[] = []
): Promise<SyncResult> {
  const feeds = await fetchAllFeeds(properties, fetchIcalText);
  return runIcalSync({
    properties,
    reservations,
    cleaningTasks,
    feeds,
    today: getLocalDateString(),
    writer: webWriter(uid),
  });
}
