/**
 * Sincronización iCal del lado del servidor. Usa la misma lógica que la app (src/lib/icalCore.ts);
 * acá solo está cómo se leen los datos y cómo se escribe con permisos de servidor.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { Property, Reservation, CleaningTask } from '../../src/types';
import {
  assertIcalText,
  candidateReservationIds,
  fetchAllFeeds,
  getDateStringInTimeZone,
  IcalSyncWriter,
  propertyHasFeeds,
  runIcalSync,
  SyncResult,
} from '../../src/lib/icalCore';

export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
const CONFIG_DOC = 'sistema/icalSync';

export type Modo = 'prueba' | 'real';

let dbInstance: Firestore | null = null;

/** Base de datos de Loomi (la que tiene nombre propio, no la "(default)"). */
export function getDb(): Firestore {
  if (dbInstance) return dbInstance;
  const app = getApps()[0] || initializeApp({ projectId: firebaseConfig.projectId });
  const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
  dbInstance = getFirestore(app, databaseId);
  return dbInstance;
}

/** Modo guardado en Firestore (sistema/icalSync). Si no existe, es "prueba": no escribe nada. */
export async function getModo(db: Firestore): Promise<Modo> {
  const snap = await db.doc(CONFIG_DOC).get();
  return snap.exists && snap.get('modo') === 'real' ? 'real' : 'prueba';
}

export async function setModo(db: Firestore, modo: Modo, quien: string): Promise<void> {
  await db.doc(CONFIG_DOC).set({ modo, cambiadoEn: new Date().toISOString(), cambiadoPor: quien }, { merge: true });
}

/** Descarga un iCal desde el servidor: directo (sin CORS) y, si falla, por el mismo proxy que usa la app. */
export async function fetchIcalTextServer(url: string): Promise<string> {
  const clean = url.trim();
  if (!clean) throw new Error('URL vacía');
  const direct = clean.replace(/^webcal:\/\//i, 'https://');

  let directError = '';
  try {
    const res = await fetch(direct, {
      headers: { 'User-Agent': 'LoomiSuite-iCal/1.0 (+https://loomisuite.net)', Accept: 'text/calendar, */*' },
      signal: AbortSignal.timeout(20000),
    });
    if (res.ok) {
      const text = await res.text();
      if (text.includes('BEGIN:VCALENDAR')) return text;
      directError = 'respuesta sin calendario';
    } else {
      directError = `HTTP ${res.status}`;
    }
  } catch (err: any) {
    directError = err?.message || String(err);
  }

  const proxyUrl = 'https://ical.loomisuite.net/proxy?url=' + encodeURIComponent(clean);
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) {
    throw new Error(`Error en respuesta del proxy iCal (${res.status}); directo: ${directError}`);
  }
  return assertIcalText(await res.text());
}

export interface Cuenta {
  uid: string;
  properties: Property[];
}

/** Cuentas que tienen al menos una unidad con enlaces iCal cargados. */
export async function cuentasConIcal(db: Firestore): Promise<Cuenta[]> {
  const snap = await db.collectionGroup('properties').get();
  const porCuenta = new Map<string, Property[]>();
  for (const d of snap.docs) {
    const tenantRef = d.ref.parent.parent;
    if (!tenantRef || tenantRef.parent.id !== 'tenants') continue;
    const list = porCuenta.get(tenantRef.id) || [];
    list.push({ ...(d.data() as Property), id: d.id });
    porCuenta.set(tenantRef.id, list);
  }
  const cuentas: Cuenta[] = [];
  for (const [uid, properties] of porCuenta) {
    if (properties.some(propertyHasFeeds)) cuentas.push({ uid, properties });
  }
  return cuentas;
}

export async function propiedadesDeCuenta(db: Firestore, uid: string): Promise<Property[]> {
  const snap = await db.collection(`tenants/${uid}/properties`).get();
  return snap.docs.map((d) => ({ ...(d.data() as Property), id: d.id }));
}

function isNotFound(err: any): boolean {
  return err?.code === 5 || /NOT_FOUND|No document to update/i.test(err?.message || '');
}

/** Escritura con permisos de servidor. Repetible: si la app ya hizo el cambio, no se duplica nada. */
export function adminWriter(db: Firestore, uid: string): IcalSyncWriter {
  const resCol = db.collection(`tenants/${uid}/reservations`);
  const taskCol = db.collection(`tenants/${uid}/cleaningTasks`);
  return {
    async createIfAbsent(reservation, cleaningTask) {
      const resRef = resCol.doc(reservation.id);
      const taskRef = taskCol.doc(cleaningTask.id);
      return db.runTransaction(async (tx) => {
        const snap = await tx.get(resRef);
        if (snap.exists) return false;
        tx.set(resRef, reservation);
        tx.set(taskRef, cleaningTask);
        return true;
      });
    },
    async updateDates(reservationId, data) {
      try {
        await resCol.doc(reservationId).update(data);
      } catch (err) {
        if (!isNotFound(err)) throw err; // si la borraron a mano, no la revivimos
      }
    },
    async cancel(reservationId, pendingCleaningTaskIds) {
      try {
        await resCol.doc(reservationId).update({ status: 'cancelled' });
      } catch (err) {
        if (!isNotFound(err)) throw err;
      }
      for (const id of pendingCleaningTaskIds) {
        await taskCol.doc(id).delete();
      }
    },
  };
}

export interface ResultadoCuenta extends SyncResult {
  uid: string;
  modo: Modo;
  hoy: string;
}

/**
 * Sincroniza una cuenta. En modo "prueba" solo calcula y devuelve lo que cambiaría.
 * Lee solo lo necesario: reservas que terminan hoy o después, las que podría tocar y las limpiezas pendientes.
 */
export async function sincronizarCuenta(
  db: Firestore,
  uid: string,
  properties: Property[],
  modo: Modo
): Promise<ResultadoCuenta> {
  const hoy = getDateStringInTimeZone(ZONA_HORARIA);
  const feeds = await fetchAllFeeds(properties, fetchIcalTextServer);

  const resCol = db.collection(`tenants/${uid}/reservations`);
  const futuras = await resCol.where('checkOut', '>=', hoy).get();
  const reservations = new Map<string, Reservation>();
  for (const d of futuras.docs) reservations.set(d.id, { ...(d.data() as Reservation), id: d.id });

  // Reservas importadas que vuelven a aparecer pero en la base tienen fechas viejas
  const faltantes = candidateReservationIds(feeds, hoy).filter((id) => !reservations.has(id));
  for (let i = 0; i < faltantes.length; i += 100) {
    const snaps = await db.getAll(...faltantes.slice(i, i + 100).map((id) => resCol.doc(id)));
    for (const d of snaps) {
      if (d.exists) reservations.set(d.id, { ...(d.data() as Reservation), id: d.id });
    }
  }

  const tareasSnap = await db.collection(`tenants/${uid}/cleaningTasks`).where('status', '==', 'pending').get();
  const cleaningTasks = tareasSnap.docs.map((d) => ({ ...(d.data() as CleaningTask), id: d.id }));

  const result = await runIcalSync({
    properties,
    reservations: [...reservations.values()],
    cleaningTasks,
    feeds,
    today: hoy,
    writer: modo === 'real' ? adminWriter(db, uid) : null,
  });

  if (modo === 'real') {
    // Estado para la app: así sabe que el servidor está sincronizando y no repite el trabajo
    await db.doc(`tenants/${uid}/sync/ical`).set({
      ultimaCorrida: new Date().toISOString(),
      agregadas: result.agregadas,
      actualizadas: result.actualizadas,
      canceladas: result.canceladas,
      errores: result.errores,
      avisos: result.avisos,
      conflictos: result.conflictos.length,
    });
  }

  return { ...result, uid, modo, hoy };
}
