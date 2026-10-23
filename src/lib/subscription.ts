import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'firebase/auth';

export interface SubscriptionDoc {
  status?: string;
  activeUntil?: any;
  /** 'propietario' (sin personal fijo) o 'complejo' (con recepción y limpieza). Se carga a mano al activar. */
  plan?: 'propietario' | 'complejo';
  /** Diseños especiales de Tu Web habilitados (de pago) */
  webDesigns?: string[];
  [key: string]: any;
}

/** grace: venció el plan pero todavía está dentro de los días de gracia (sigue usando la app, con aviso) */
export type AccessState = 'active' | 'trial' | 'grace' | 'expired';

export interface AccessStatus {
  state: AccessState;
  /** Prueba: días que quedan · Activo con fecha: días hasta el vencimiento · Gracia: días hasta que se pause */
  daysLeft: number;
  /** Vencimiento del plan, si tiene */
  until?: Date;
}

export function subscribeToSubscription(
  uid: string,
  callback: (sub: SubscriptionDoc | null) => void
): () => void {
  if (!uid || !db) {
    callback(null);
    return () => {};
  }

  const subRef = doc(db, 'subscriptions', uid);
  return onSnapshot(
    subRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as SubscriptionDoc);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Error listening to subscription doc:', err);
      callback(null);
    }
  );
}

export function getAccessStatus(user: User | null, sub: SubscriptionDoc | null, trialStart?: any, graceDays = 0): AccessStatus {
  const now = Date.now();

  // Suspendido a mano desde el panel de clientes: sin acceso, aunque la prueba siga corriendo
  if (sub?.status === 'suspended') return { state: 'expired', daysLeft: 0 };

  // Check active subscription
  if (sub?.status === 'active') {
    if (!sub.activeUntil) {
      return { state: 'active', daysLeft: 0 };
    }

    let untilTime: number | null = null;
    if (typeof sub.activeUntil?.toDate === 'function') {
      untilTime = sub.activeUntil.toDate().getTime();
    } else if (sub.activeUntil instanceof Date) {
      untilTime = sub.activeUntil.getTime();
    } else if (typeof sub.activeUntil === 'string' || typeof sub.activeUntil === 'number') {
      untilTime = new Date(sub.activeUntil).getTime();
    }

    if (untilTime === null || isNaN(untilTime)) {
      return { state: 'active', daysLeft: 0 };
    }
    const DAY = 24 * 60 * 60 * 1000;
    const until = new Date(untilTime);
    if (untilTime > now) {
      return { state: 'active', daysLeft: Math.ceil((untilTime - now) / DAY), until };
    }
    // Venció: unos días de gracia con aviso antes de pausar la cuenta
    const graceEnd = untilTime + graceDays * DAY;
    if (graceEnd > now) {
      return { state: 'grace', daysLeft: Math.max(1, Math.ceil((graceEnd - now) / DAY)), until };
    }
    return { state: 'expired', daysLeft: 0, until };
  }

  // Fallback to 7-day free trial based on user creationTime
  // El personal usa la fecha de alta del complejo; el dueño, la de su cuenta
  const creationTimeStr = user?.metadata?.creationTime;
  const creationDate =
    trialStart && typeof trialStart.toDate === 'function'
      ? trialStart.toDate()
      : trialStart
      ? new Date(trialStart)
      : creationTimeStr
      ? new Date(creationTimeStr)
      : new Date();
  const startTime = isNaN(creationDate.getTime()) ? now : creationDate.getTime();

  const trialDurationMs = 7 * 24 * 60 * 60 * 1000;
  const trialEndTime = startTime + trialDurationMs;
  const msLeft = trialEndTime - now;

  if (msLeft <= 0) {
    return { state: 'expired', daysLeft: 0 };
  }

  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  return { state: 'trial', daysLeft: Math.max(1, daysLeft) };
}
