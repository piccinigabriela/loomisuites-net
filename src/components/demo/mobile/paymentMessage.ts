import type { WelcomeGuideData } from '../../../types';

export type PayMethod = 'transfer' | 'mercadopago' | 'paypal' | 'payoneer';

export type PaymentSettings = NonNullable<WelcomeGuideData['directBookingSettings']>;

export const PAY_METHOD_LABEL: Record<PayMethod, string> = {
  transfer: '🏦 Transferencia',
  mercadopago: '💳 Mercado Pago',
  paypal: '🅿️ PayPal',
  payoneer: '🌐 Payoneer',
};

const clean = (v?: string) => (v || '').trim();

/** Un link sin "https://" (ej. paypal.me/tucomplejo) se completa; un alias de Mercado Pago se deja como está. */
export function normalizeLink(v?: string): string {
  const t = clean(v);
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return t.includes('/') ? `https://${t}` : t;
}

/** Métodos que el dueño ya cargó (los que están vacíos no se ofrecen). */
export function availableMethods(s?: Partial<PaymentSettings>): PayMethod[] {
  if (!s) return [];
  const list: PayMethod[] = [];
  if (clean(s.bankAlias) || clean(s.cbu)) list.push('transfer');
  if (clean(s.mercadoPagoLink)) list.push('mercadopago');
  if (clean(s.paypalLink)) list.push('paypal');
  if (clean(s.payoneerLink)) list.push('payoneer');
  return list;
}

export function composePaymentMessage(opts: {
  guestFirstName: string;
  complexName: string;
  unitName: string;
  dates: string;
  /** Saldo ya formateado (ej. "$ 120.000"); si no hay saldo, no se menciona */
  balanceText?: string;
  methods: PayMethod[];
  settings?: Partial<PaymentSettings>;
}): string {
  const { guestFirstName, complexName, unitName, dates, balanceText, methods, settings } = opts;
  const s = settings || {};
  const head = `¡Hola ${guestFirstName}! Te escribo de ${complexName}. Por tu reserva en ${unitName} del ${dates}${
    balanceText ? `, queda un saldo de ${balanceText}` : ''
  }.`;

  if (methods.length === 0) return `${head} ¿Te paso los datos para pagar?`;

  const blocks: string[] = [];
  if (methods.includes('transfer')) {
    const lines = [
      clean(s.bankAlias) && `Alias: ${clean(s.bankAlias)}`,
      clean(s.cbu) && `CBU/CVU: ${clean(s.cbu)}`,
      clean(s.bankName) && `Banco: ${clean(s.bankName)}`,
      clean(s.accountHolder) && `Titular: ${clean(s.accountHolder)}`,
    ].filter(Boolean);
    blocks.push(`🏦 Transferencia bancaria\n${lines.join('\n')}`);
  }
  if (methods.includes('mercadopago') && clean(s.mercadoPagoLink)) blocks.push(`💳 Mercado Pago:\n${normalizeLink(s.mercadoPagoLink)}`);
  if (methods.includes('paypal') && clean(s.paypalLink)) blocks.push(`🅿️ PayPal:\n${normalizeLink(s.paypalLink)}`);
  if (methods.includes('payoneer') && clean(s.payoneerLink)) blocks.push(`🌐 Payoneer:\n${normalizeLink(s.payoneerLink)}`);

  return `${head}\n\nPodés pagarlo así:\n\n${blocks.join('\n\n')}\n\nCuando lo hagas, mandame el comprobante por acá. ¡Gracias!`;
}

/** Aviso (no bloqueante) si lo que parece un CBU no tiene 22 dígitos. */
export function cbuWarning(v?: string): string {
  const t = clean(v).replace(/\s/g, '');
  if (!t) return '';
  return /^\d+$/.test(t) && t.length !== 22 ? `Tiene ${t.length} dígitos; el CBU/CVU lleva 22.` : '';
}
