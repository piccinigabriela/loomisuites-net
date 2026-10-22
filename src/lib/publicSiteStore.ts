/**
 * Lectura y escritura de Tu Web en Firestore (ver src/lib/publicSite.ts para el modelo).
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { BusyRange, PublicSiteDoc, PublicSitePhoto } from './publicSite';

const SITE_FIELDS = [
  'enabled',
  'name',
  'tagline',
  'description',
  'city',
  'address',
  'mapsUrl',
  'whatsapp',
  'checkinHour',
  'checkoutHour',
  'currency',
  'theme',
  'units',
  'pricing',
  'updatedAt',
];

export async function fetchPublicSite(slug: string): Promise<PublicSiteDoc | null> {
  if (!slug || !db) return null;
  const snap = await getDoc(doc(db, 'publicSites', slug));
  return snap.exists() ? (snap.data() as PublicSiteDoc) : null;
}

export async function fetchSitePhotos(slug: string): Promise<PublicSitePhoto[]> {
  if (!slug || !db) return [];
  const snap = await getDocs(collection(db, 'publicSites', slug, 'photos'));
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<PublicSitePhoto, 'id'>), id: d.id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Dominio propio → nombre del link (siteDomains/{host}, lo carga la administración de Loomi) */
export async function resolveSiteDomain(hostname: string): Promise<string> {
  if (!hostname || !db) return '';
  const host = hostname.toLowerCase().replace(/^www\./, '');
  try {
    const snap = await getDoc(doc(db, 'siteDomains', host));
    return snap.exists() ? String(snap.get('slug') || '') : '';
  } catch {
    return '';
  }
}

/**
 * Reserva un nombre de link para este complejo. Devuelve '' si salió bien o el motivo si no.
 * Un nombre ya usado por otro complejo no se puede leer: la creación falla y se informa como ocupado.
 */
export async function claimSlug(uid: string, slug: string): Promise<string> {
  if (!db) return 'Sin conexión.';
  try {
    const site = await getDoc(doc(db, 'publicSites', slug));
    if (site.exists()) return 'Ese nombre ya lo usa otro complejo. Probá con otro.';
  } catch {
    // seguimos: la creación de abajo decide
  }
  try {
    await setDoc(doc(db, 'siteOwners', slug), { uid });
    return '';
  } catch (err: any) {
    if (err?.code === 'permission-denied') return 'Ese nombre ya lo usa otro complejo. Probá con otro.';
    return 'No se pudo guardar. Revisá la conexión y probá de nuevo.';
  }
}

/** Publica los datos de la página. Reemplaza cada campo entero (sin mezclar tarifas viejas). No toca las fechas ocupadas. */
export async function publishSite(slug: string, data: Omit<PublicSiteDoc, 'busy' | 'busyUpdatedAt' | 'updatedAt'>): Promise<void> {
  if (!slug || !db) return;
  await setDoc(
    doc(db, 'publicSites', slug),
    { ...JSON.parse(JSON.stringify(data)), updatedAt: serverTimestamp() },
    { mergeFields: SITE_FIELDS }
  );
}

/** Actualiza solo las fechas ocupadas (lo puede hacer también Recepción). No crea la página si no existe. */
export async function publishSiteBusy(slug: string, busy: Record<string, BusyRange[]>): Promise<void> {
  if (!slug || !db) return;
  await updateDoc(doc(db, 'publicSites', slug), { busy, busyUpdatedAt: serverTimestamp() });
}

export async function addSitePhoto(slug: string, photo: Omit<PublicSitePhoto, 'id'>): Promise<string> {
  if (!db) throw new Error('Sin conexión');
  const ref = doc(collection(db, 'publicSites', slug, 'photos'));
  await setDoc(ref, photo);
  return ref.id;
}

export async function updateSitePhoto(slug: string, id: string, data: Partial<Pick<PublicSitePhoto, 'order' | 'unitId'>>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'publicSites', slug, 'photos', id), data);
}

export async function deleteSitePhoto(slug: string, id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'publicSites', slug, 'photos', id));
}

/** Borra la página, sus fotos y el nombre (queda libre para otro). */
export async function releaseSite(slug: string): Promise<void> {
  if (!slug || !db) return;
  const photos = await getDocs(collection(db, 'publicSites', slug, 'photos'));
  for (const p of photos.docs) await deleteDoc(p.ref);
  await deleteDoc(doc(db, 'publicSites', slug)).catch(() => {});
  await deleteDoc(doc(db, 'siteOwners', slug)).catch(() => {});
}

/** Pasa la página a un nombre nuevo (ya reservado con claimSlug): copia datos y fotos, y libera el viejo. */
export async function moveSite(oldSlug: string, newSlug: string): Promise<void> {
  if (!db || !oldSlug || !newSlug || oldSlug === newSlug) return;
  const old = await getDoc(doc(db, 'publicSites', oldSlug));
  if (old.exists()) {
    const data = old.data() as PublicSiteDoc;
    await setDoc(doc(db, 'publicSites', newSlug), { ...data, updatedAt: serverTimestamp() });
  }
  const photos = await getDocs(collection(db, 'publicSites', oldSlug, 'photos'));
  let batch = writeBatch(db);
  let n = 0;
  for (const p of photos.docs) {
    batch.set(doc(db, 'publicSites', newSlug, 'photos', p.id), p.data());
    // Cada foto pesa hasta ~900 KB: de a 5 para no pasar el límite de un lote
    if (++n % 5 === 0) {
      await batch.commit();
      batch = writeBatch(db);
    }
  }
  if (n % 5 !== 0) await batch.commit();
  await releaseSite(oldSlug);
}
