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

export type AccessState = 'active' | 'trial' | 'expired';

export interface AccessStatus {
  state: AccessState;
  daysLeft: number;
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

export function getAccessStatus(user: User | null, sub: SubscriptionDoc | null, trialStart?: any): AccessStatus {
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

    if (untilTime === null || isNaN(untilTime) || untilTime > now) {
      return { state: 'active', daysLeft: 0 };
    }
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
