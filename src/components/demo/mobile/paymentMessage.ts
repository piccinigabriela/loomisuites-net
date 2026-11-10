import type { WelcomeGuideData } from '../../../types';

export type PayMethod = 'transfer' | 'mercadopago' | 'paypal' | 'payoneer' | 'other';

export type PaymentSettings = NonNullable<WelcomeGuideData['directBookingSettings']>;

export const PAY_METHOD_LABEL: Record<PayMethod, string> = {
  transfer: '🏦 Transferencia',
  mercadopago: '💳 Mercado Pago',
  paypal: '🅿️ PayPal',
  payoneer: '🌐 Payoneer',
  other: '🔗 Otro link',
};

/** Nombre del medio para los botones: el "otro link" usa el nombre que cargó el dueño (dLocal Go, Ualá Bis…) */
export function payMethodLabel(m: PayMethod, s?: Partial<PaymentSettings>): string {
  const name = (s?.otherPayName || '').trim();
  return m === 'other' && name ? `🔗 ${name}` : PAY_METHOD_LABEL[m];
}

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
  if (clean(s.otherPayLink)) list.push('other');
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
  /** 'seña' cambia la frase del monto ("la seña es de…"); por defecto es el saldo */
  concept?: 'saldo' | 'seña';
}): string {
  const { guestFirstName, complexName, unitName, dates, balanceText, methods, settings, concept = 'saldo' } = opts;
  const s = settings || {};
  const amountPart = balanceText ? (concept === 'seña' ? `, la seña es de ${balanceText}` : `, queda un saldo de ${balanceText}`) : '';
  const head = `¡Hola ${guestFirstName}! Te escribo de ${complexName}. Por tu reserva en ${unitName} del ${dates}${amountPart}.`;

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
  if (methods.includes('other') && clean(s.otherPayLink)) blocks.push(`🔗 ${clean(s.otherPayName) || 'Link de pago'}:\n${normalizeLink(s.otherPayLink)}`);

  return `${head}\n\nPodés ${concept === 'seña' ? 'pagarla' : 'pagarlo'} así:\n\n${blocks.join('\n\n')}\n\nCuando lo hagas, mandame el comprobante por acá. ¡Gracias!`;
}

/** Aviso (no bloqueante) si lo que parece un CBU no tiene 22 dígitos. */
export function cbuWarning(v?: string): string {
  const t = clean(v).replace(/\s/g, '');
  if (!t) return '';
  return /^\d+$/.test(t) && t.length !== 22 ? `Tiene ${t.length} dígitos; el CBU/CVU lleva 22.` : '';
}
