import type { Reservation } from '../../../types';
import { toLocalDateStr } from '../../../data/initialData';

export function formatShortDateRange(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return '';
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const pIn = checkIn.split('-');
  const pOut = checkOut.split('-');
  if (pIn.length === 3 && pOut.length === 3) {
    const dIn = parseInt(pIn[2], 10);
    const mIn = parseInt(pIn[1], 10) - 1;
    const dOut = parseInt(pOut[2], 10);
    const mOut = parseInt(pOut[1], 10) - 1;
    if (mIn === mOut) {
      return `${dIn} al ${dOut} ${months[mIn] || ''}`;
    }
    return `${dIn} ${months[mIn] || ''} al ${dOut} ${months[mOut] || ''}`;
  }
  return `${checkIn} al ${checkOut}`;
}

/** Suma n días a una fecha YYYY-MM-DD (hora local, sin saltos por cambio de horario). */
export function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return toLocalDateStr(new Date(y, m - 1, d + n));
}

/** Días de a hasta b (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000);
}

/** "Vie 16 oct" */
export function shortDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const txt = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
    .format(new Date(y, m - 1, d))
    .replace(/[.,]/g, '');
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

/** Pagado hasta ahora: pagos registrados, o el total si está marcada como paga. */
export function getPaidAmount(res: Reservation): number {
  const fromPayments = (res.payments || []).reduce((s, p) => s + (p.amountSettlement || 0), 0);
  return fromPayments || (res.paymentStatus === 'paid' ? res.totalAmount : 0);
}

/** Saldo a cobrar real: total menos lo registrado (nunca negativo). */
export function getBalance(res: Reservation): number {
  return Math.max(0, (res.totalAmount || 0) - getPaidAmount(res));
}

export function isSettled(res: Reservation): boolean {
  return res.paymentStatus === 'paid' || getBalance(res) <= 0;
}

/** Orden del directorio: lo que viene (o está en curso) primero por ingreso; lo pasado, lo más reciente primero. */
export function compareForDirectory(todayStr: string) {
  return (a: Reservation, b: Reservation) => {
    const aUp = a.checkIn >= todayStr || (a.checkIn <= todayStr && a.checkOut >= todayStr);
    const bUp = b.checkIn >= todayStr || (b.checkIn <= todayStr && b.checkOut >= todayStr);
    if (aUp && !bUp) return -1;
    if (!aUp && bUp) return 1;
    if (aUp && bUp) return a.checkIn.localeCompare(b.checkIn);
    return b.checkOut.localeCompare(a.checkOut);
  };
}
