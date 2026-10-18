/**
 * Equipo: invitaciones y accesos reales para Recepción y Limpieza.
 *
 * - invites/{mail en minúsculas}: lo crea el dueño; lo lee y lo acepta la persona invitada.
 * - memberships/{uid}: se crea al aceptar (las reglas lo validan contra la invitación).
 *   Dice a qué complejo pertenece la persona y con qué rol. El dueño lo borra para quitar el acceso.
 * - tenants/{uid}/staff/llegadas: próximos ingresos sin datos sensibles, para Limpieza.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';
import type { StaffArrivalsDoc } from './staffArrivals';

export type StaffRole = 'recepcion' | 'limpieza';

export const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  recepcion: 'Recepción',
  limpieza: 'Limpieza',
};

export interface Invite {
  email: string;
  tenantId: string;
  role: StaffRole;
  complexName: string;
  invitedAt?: any;
}

export interface Membership {
  tenantId: string;
  role: StaffRole;
  email: string;
  name: string;
  complexName: string;
  joinedAt?: any;
}

export type AccessInfo =
  | { kind: 'loading' }
  | { kind: 'owner' }
  | { kind: 'staff'; uid: string; membership: Membership }
  | { kind: 'invited'; invite: Invite };

export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/** Decide cómo entra este usuario: dueño de su complejo, personal de otro, o con una invitación pendiente. */
export async function resolveAccess(user: User): Promise<AccessInfo> {
  try {
    const m = await getDoc(doc(db, 'memberships', user.uid));
    if (m.exists()) return { kind: 'staff', uid: user.uid, membership: m.data() as Membership };
  } catch (err) {
    // Sin reglas nuevas o sin acceso: sigue como dueño (comportamiento de siempre)
    console.warn('Sin acceso a memberships:', err);
  }
  const email = normalizeEmail(user.email || '');
  if (email) {
    try {
      const inv = await getDoc(doc(db, 'invites', email));
      if (inv.exists()) {
        const data = inv.data() as Invite;
        if (data.tenantId !== user.uid) return { kind: 'invited', invite: data };
      }
    } catch (err) {
      console.warn('Sin acceso a invites:', err);
    }
  }
  return { kind: 'owner' };
}

/** Acepta la invitación: crea el acceso y borra la invitación, todo junto. */
export async function acceptInvite(user: User, invite: Invite): Promise<Membership> {
  const membership: Membership = {
    tenantId: invite.tenantId,
    role: invite.role,
    email: normalizeEmail(user.email || ''),
    name: user.displayName || '',
    complexName: invite.complexName || '',
  };
  const batch = writeBatch(db);
  batch.set(doc(db, 'memberships', user.uid), { ...membership, joinedAt: serverTimestamp() });
  batch.delete(doc(db, 'invites', normalizeEmail(user.email || '')));
  await batch.commit();
  return membership;
}

/** La persona invitada rechaza la invitación. */
export async function declineInvite(user: User): Promise<void> {
  await deleteDoc(doc(db, 'invites', normalizeEmail(user.email || '')));
}

/** El dueño invita a alguien por mail. */
export async function createInvite(ownerUid: string, email: string, role: StaffRole, complexName: string): Promise<void> {
  const id = normalizeEmail(email);
  await setDoc(doc(db, 'invites', id), {
    email: id,
    tenantId: ownerUid,
    role,
    complexName: complexName || '',
    invitedAt: serverTimestamp(),
  });
}

export async function cancelInvite(email: string): Promise<void> {
  await deleteDoc(doc(db, 'invites', normalizeEmail(email)));
}

/** El dueño le quita el acceso a alguien de su equipo. */
export async function removeMember(memberUid: string): Promise<void> {
  await deleteDoc(doc(db, 'memberships', memberUid));
}

export function subscribeToTeam(
  ownerUid: string,
  onData: (data: { members: Array<Membership & { uid: string }>; invites: Invite[] }) => void,
  onError?: (err: unknown) => void
): () => void {
  let members: Array<Membership & { uid: string }> = [];
  let invites: Invite[] = [];
  const emit = () => onData({ members, invites });
  const u1 = onSnapshot(
    query(collection(db, 'memberships'), where('tenantId', '==', ownerUid)),
    (snap) => {
      members = snap.docs.map((d) => ({ ...(d.data() as Membership), uid: d.id }));
      emit();
    },
    (err) => onError?.(err)
  );
  const u2 = onSnapshot(
    query(collection(db, 'invites'), where('tenantId', '==', ownerUid)),
    (snap) => {
      invites = snap.docs.map((d) => d.data() as Invite);
      emit();
    },
    (err) => onError?.(err)
  );
  return () => {
    u1();
    u2();
  };
}

/** Si el dueño borra el acceso mientras la persona tiene la app abierta, se entera al instante. */
export function subscribeToMembership(uid: string, onChange: (m: Membership | null) => void): () => void {
  return onSnapshot(
    doc(db, 'memberships', uid),
    (snap) => onChange(snap.exists() ? (snap.data() as Membership) : null),
    () => onChange(null)
  );
}

/**
 * tenants/{uid}/staff/complejo: lo único del complejo que necesita Limpieza
 * (Limpieza no lee tenants/{uid}: ahí hay tarifas, comisión, teléfonos del equipo y plantillas).
 * Va en un documento aparte de "llegadas" porque la sincronización del servidor reescribe ese entero.
 */
export interface StaffComplexDoc {
  complexName: string;
  checkinHour: string;
  checkoutHour: string;
  /** Fecha de alta del complejo: el personal usa la prueba gratis del complejo, no la de su cuenta */
  trialStart?: any;
}

export async function saveStaffComplex(tenantUid: string, data: StaffComplexDoc): Promise<void> {
  if (!tenantUid) return;
  const clean: Record<string, any> = {
    complexName: data.complexName,
    checkinHour: data.checkinHour,
    checkoutHour: data.checkoutHour,
    updatedAt: serverTimestamp(),
  };
  if (data.trialStart) clean.trialStart = data.trialStart;
  await setDoc(doc(db, 'tenants', tenantUid, 'staff', 'complejo'), clean);
}

export function subscribeToStaffComplex(tenantUid: string, onData: (d: StaffComplexDoc | null) => void): () => void {
  return onSnapshot(
    doc(db, 'tenants', tenantUid, 'staff', 'complejo'),
    (snap) => onData(snap.exists() ? (snap.data() as StaffComplexDoc) : null),
    () => onData(null)
  );
}

export async function saveStaffArrivals(tenantUid: string, data: StaffArrivalsDoc): Promise<void> {
  if (!tenantUid) return;
  await setDoc(doc(db, 'tenants', tenantUid, 'staff', 'llegadas'), { ...data, updatedAt: serverTimestamp() });
}

export function subscribeToStaffArrivals(tenantUid: string, onData: (d: StaffArrivalsDoc | null) => void): () => void {
  return onSnapshot(
    doc(db, 'tenants', tenantUid, 'staff', 'llegadas'),
    (snap) => onData(snap.exists() ? (snap.data() as StaffArrivalsDoc) : null),
    () => onData(null)
  );
}
