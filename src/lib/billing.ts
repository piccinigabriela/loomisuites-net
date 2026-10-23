/**
 * Cobro del abono de Loomi a cada cliente.
 *
 * - config/billing (la edita solo la administración desde el Panel de clientes; la leen los usuarios con sesión):
 *   precios de los planes en pesos (se ajustan por IPC), datos de transferencia, mail de Payoneer, descuento y días de gracia.
 *   Los datos bancarios NO van en el código: el repo es público.
 * - paymentNotices/{id}: el cliente avisa "Ya pagué" desde Mi plan; la administración lo ve en el Panel y renueva.
 * - Payoneer: el monto en dólares sale del precio en pesos ÷ dólar MEP del día, menos el descuento.
 */
import { addDoc, collection, doc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export type PlanId = 'propietario' | 'complejo';
export type PayMethod = 'transferencia' | 'payoneer';

export interface BillingConfig {
  plans: Record<PlanId, { name: string; price: number }>;
  holder: string;
  cuit: string;
  alias: string;
  cbu: string;
  account: string;
  bank: string;
  payoneerEmail: string;
  /** Descuento por pagar en dólares por Payoneer (%) */
  payoneerDiscount: number;
  /** Días con acceso después del vencimiento, antes de pausar la cuenta */
  graceDays: number;
  /** Dólar MEP de respaldo, si no se puede leer la cotización del día */
  mepFallback: number;
}

export const DEFAULT_BILLING: BillingConfig = {
  plans: {
    propietario: { name: 'Loomi', price: 45000 },
    complejo: { name: 'Loomi Suite', price: 60000 },
  },
  holder: '',
  cuit: '',
  alias: '',
  cbu: '',
  account: '',
  bank: '',
  payoneerEmail: '',
  payoneerDiscount: 10,
  graceDays: 5,
  mepFallback: 0,
};

export function normalizeBilling(raw: any): BillingConfig {
  const d = DEFAULT_BILLING;
  const r = raw || {};
  const plan = (id: PlanId) => ({
    name: String(r.plans?.[id]?.name || d.plans[id].name),
    price: Number(r.plans?.[id]?.price) > 0 ? Number(r.plans[id].price) : d.plans[id].price,
  });
  const num = (v: any, def: number) => (Number.isFinite(Number(v)) && v !== '' && v !== null && v !== undefined ? Number(v) : def);
  return {
    plans: { propietario: plan('propietario'), complejo: plan('complejo') },
    holder: String(r.holder || ''),
    cuit: String(r.cuit || ''),
    alias: String(r.alias || ''),
    cbu: String(r.cbu || ''),
    account: String(r.account || ''),
    bank: String(r.bank || ''),
    payoneerEmail: String(r.payoneerEmail || ''),
    payoneerDiscount: Math.min(50, Math.max(0, num(r.payoneerDiscount, d.payoneerDiscount))),
    graceDays: Math.min(30, Math.max(0, Math.round(num(r.graceDays, d.graceDays)))),
    mepFallback: Math.max(0, num(r.mepFallback, 0)),
  };
}

export function subscribeToBilling(onData: (c: BillingConfig) => void): () => void {
  if (!db) {
    onData(DEFAULT_BILLING);
    return () => {};
  }
  return onSnapshot(
    doc(db, 'config', 'billing'),
    (snap) => onData(normalizeBilling(snap.exists() ? snap.data() : null)),
    () => onData(DEFAULT_BILLING)
  );
}

export async function saveBillingConfig(c: BillingConfig): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'config', 'billing'), { ...JSON.parse(JSON.stringify(c)), updatedAt: serverTimestamp() });
}

// ---------------------------------------------------------------------------
// Dólar MEP del día (dolarapi.com, "bolsa" = MEP). Se guarda el último valor por si un día no responde.

const MEP_CACHE = 'loomi_mep';

export interface MepQuote {
  rate: number;
  /** De dónde salió: hoy, último valor guardado o el de respaldo de la administración */
  source: 'hoy' | 'guardado' | 'respaldo';
  date: string;
}

export async function fetchMep(fallback: number): Promise<MepQuote | null> {
  // Primero la función de Loomi (functions/api/mep.js); si no está (local), directo a dolarapi
  for (const url of ['/api/mep', 'https://dolarapi.com/v1/dolares/bolsa']) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      const rate = Number(data?.rate ?? data?.venta);
      if (rate > 0) {
        const q: MepQuote = { rate, source: 'hoy', date: String(data?.date || data?.fechaActualizacion || new Date().toISOString()) };
        try {
          localStorage.setItem(MEP_CACHE, JSON.stringify(q));
        } catch {}
        return q;
      }
    } catch {}
  }
  try {
    const saved = JSON.parse(localStorage.getItem(MEP_CACHE) || 'null');
    if (saved && Number(saved.rate) > 0) return { ...saved, source: 'guardado' };
  } catch {}
  return fallback > 0 ? { rate: fallback, source: 'respaldo', date: '' } : null;
}

/** Monto en dólares por Payoneer: precio en pesos ÷ MEP, menos el descuento, redondeado a dólares enteros */
export function usdAmount(priceArs: number, mep: number, discountPct: number): number {
  if (!(priceArs > 0) || !(mep > 0)) return 0;
  return Math.round((priceArs / mep) * (1 - discountPct / 100));
}

// ---------------------------------------------------------------------------
// Avisos de pago

export interface PaymentNotice {
  id: string;
  uid: string;
  complexName: string;
  email: string;
  plan: PlanId;
  method: PayMethod;
  amount: number;
  currency: 'ARS' | 'USD';
  /** MEP usado (solo Payoneer) */
  rate: number;
  createdAt?: any;
  handled?: boolean;
}

export async function sendPaymentNotice(n: Omit<PaymentNotice, 'id' | 'createdAt' | 'handled'>): Promise<void> {
  if (!db) throw new Error('Sin conexión');
  await addDoc(collection(db, 'paymentNotices'), { ...n, createdAt: serverTimestamp() });
}

/** Avisos del propio cliente (para mostrar "ya avisaste") */
export async function fetchMyNotices(uid: string): Promise<PaymentNotice[]> {
  if (!db || !uid) return [];
  const snap = await getDocs(query(collection(db, 'paymentNotices'), where('uid', '==', uid)));
  return snap.docs.map((d) => ({ ...(d.data() as Omit<PaymentNotice, 'id'>), id: d.id }));
}

/** Para la administración: avisos sin resolver */
export async function fetchPendingNotices(): Promise<PaymentNotice[]> {
  if (!db) return [];
  const snap = await getDocs(collection(db, 'paymentNotices'));
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<PaymentNotice, 'id'>), id: d.id }))
    .filter((n) => !n.handled)
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
}

export async function markNoticeHandled(id: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'paymentNotices', id), { handled: true });
}

export function formatArs(n: number): string {
  return `$ ${Math.round(n || 0).toLocaleString('es-AR')}`;
}
