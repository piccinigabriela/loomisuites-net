import { collection, doc, getDocs, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getAccessStatus, type SubscriptionDoc } from './subscription';

/** Única cuenta que puede ver y manejar a todos los clientes (las reglas de Firestore usan el mismo mail). */
export const ADMIN_EMAIL = 'piccini.gabriela@gmail.com';

export function isPlatformAdmin(user: { email?: string | null; emailVerified?: boolean } | null | undefined): boolean {
  return !!user && user.emailVerified === true && (user.email || '').toLowerCase() === ADMIN_EMAIL;
}

export type ClientState = 'active' | 'trial' | 'grace' | 'expired' | 'suspended';

export interface ClientRow {
  uid: string;
  complexName: string;
  ownerEmail: string;
  createdAt: Date | null;
  state: ClientState;
  /** Días que le quedan a la prueba, o días que faltan para el vencimiento si está activo con fecha */
  daysLeft: number | null;
  activeUntil: Date | null;
  plan: 'propietario' | 'complejo' | null;
  note: string;
  /** Diseños especiales de Tu Web habilitados (ver SPECIAL_THEMES) */
  webDesigns: string[];
}

function toDate(v: any): Date | null {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate();
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export async function fetchClients(graceDays = 0): Promise<ClientRow[]> {
  if (!db) return [];
  const [tenants, subs] = await Promise.all([getDocs(collection(db, 'tenants')), getDocs(collection(db, 'subscriptions'))]);
  const subMap = new Map<string, SubscriptionDoc>();
  subs.forEach((d) => subMap.set(d.id, d.data() as SubscriptionDoc));
  const now = Date.now();
  const rows: ClientRow[] = [];
  tenants.forEach((t) => {
    const data = t.data() as any;
    const sub = subMap.get(t.id) || null;
    const createdAt = toDate(data.createdAt);
    const activeUntil = toDate(sub?.activeUntil);
    let state: ClientState;
    let daysLeft: number | null = null;
    if (sub?.status === 'suspended') {
      state = 'suspended';
    } else {
      const access = getAccessStatus(null, sub, data.createdAt, graceDays);
      state = access.state;
      if (access.state === 'trial' || access.state === 'grace') daysLeft = access.daysLeft;
      if (access.state === 'active' && activeUntil) daysLeft = Math.ceil((activeUntil.getTime() - now) / 86400000);
    }
    rows.push({
      uid: t.id,
      complexName: data.complexName || '(sin nombre)',
      ownerEmail: data.ownerEmail || '',
      createdAt,
      state,
      daysLeft,
      activeUntil,
      plan: sub?.plan || null,
      note: typeof sub?.note === 'string' ? sub.note : '',
      webDesigns: Array.isArray(sub?.webDesigns) ? sub!.webDesigns.filter((x: unknown) => typeof x === 'string') : [],
    });
  });
  // Primero lo que necesita atención: vencidos, pruebas por terminar, activos
  const order: Record<ClientState, number> = { expired: 0, grace: 1, trial: 2, suspended: 3, active: 4 };
  rows.sort((a, b) => order[a.state] - order[b.state] || (a.daysLeft ?? 999) - (b.daysLeft ?? 999) || a.complexName.localeCompare(b.complexName));
  return rows;
}

/** Suma meses a una fecha sin pasarse de fin de mes (31/1 + 1 mes = 28/2) */
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from.getTime());
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return d;
}

/** Activa o renueva: cuenta los meses desde hoy, o desde el vencimiento si todavía está activo o en gracia */
export async function activateClient(row: ClientRow, months: number, plan: 'propietario' | 'complejo'): Promise<void> {
  if (!db) return;
  // Activo o en días de gracia: se suma desde el vencimiento (así los días de gracia no se regalan)
  const base =
    (row.state === 'active' || row.state === 'grace') && row.activeUntil && row.activeUntil.getTime() > Date.now() - 31 * 86400000
      ? row.activeUntil
      : new Date();
  await setDoc(
    doc(db, 'subscriptions', row.uid),
    { status: 'active', plan, activeUntil: Timestamp.fromDate(addMonths(base, months)), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function suspendClient(uid: string): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'subscriptions', uid), { status: 'suspended', updatedAt: serverTimestamp() }, { merge: true });
}

export async function saveClientNote(uid: string, note: string): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'subscriptions', uid), { note: note.slice(0, 300), updatedAt: serverTimestamp() }, { merge: true });
}

/** Habilita o saca diseños especiales de Tu Web para un cliente */
export async function saveClientWebDesigns(uid: string, webDesigns: string[]): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'subscriptions', uid), { webDesigns: webDesigns.slice(0, 10), updatedAt: serverTimestamp() }, { merge: true });
}
