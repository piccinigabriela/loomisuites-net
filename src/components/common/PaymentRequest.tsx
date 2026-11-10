import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import {
  payMethodLabel,
  availableMethods,
  composePaymentMessage,
  type PayMethod,
  type PaymentSettings,
} from '../demo/mobile/paymentMessage';
import { PaymentSettingsSheet } from '../demo/mobile/PaymentSettingsSheet';
import { normalizeWhatsAppPhone } from '../../lib/teamNotices';

/**
 * "Pedir pago" en la ficha de la reserva (compu): arma el mensaje de WhatsApp con los datos de cobro del dueño
 * (alias/CBU, su link de Mercado Pago, PayPal o Payoneer; los mismos del modo celular, en welcomeGuide.directBookingSettings).
 * Sin pasarela: Loomi no cobra ni toca la plata. Si la web tiene seña y la reserva no tiene pagos, ofrece pedir la seña.
 */
export const PaymentRequest: React.FC<{
  reservationId: string;
  guestName: string;
  guestPhone?: string;
  complexName: string;
  unitName: string;
  dates: string;
  /** Saldo pendiente (total menos pagos) */
  balance: number;
  /** Seña sugerida (0 = no se ofrece) */
  deposit: number;
  depositPercent: number;
  format: (n: number) => string;
  settings?: Partial<PaymentSettings>;
  /** Solo el dueño puede cambiar los datos de cobro */
  onSaveSettings?: (fields: Partial<PaymentSettings>) => Promise<void> | void;
}> = ({ reservationId, guestName, guestPhone, complexName, unitName, dates, balance, deposit, depositPercent, format, settings, onSaveSettings }) => {
  const [concept, setConcept] = useState<'seña' | 'saldo'>(deposit > 0 ? 'seña' : 'saldo');
  const [off, setOff] = useState<PayMethod[]>([]);
  const [override, setOverride] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    setConcept(deposit > 0 ? 'seña' : 'saldo');
    setOff([]);
    setOverride(null);
  }, [reservationId, deposit]);

  const available = availableMethods(settings);
  const methods = available.filter((m) => !off.includes(m));
  const amount = concept === 'seña' ? deposit : balance;
  const composed = composePaymentMessage({
    guestFirstName: (guestName || '').trim().split(' ')[0] || '',
    complexName: complexName || 'el alojamiento',
    unitName: unitName || 'la unidad',
    dates,
    balanceText: amount > 0 ? format(amount) : undefined,
    methods,
    settings,
    concept,
  });
  const text = override ?? composed;
  const phone = normalizeWhatsAppPhone(guestPhone || '');
  const canSend = phone.length >= 8;

  const chip = (on: boolean) =>
    `min-h-[40px] px-3.5 rounded-xl border-2 text-[13px] font-bold cursor-pointer ${
      on
        ? 'bg-stone-900 text-white border-stone-900 dark:bg-[#FFB27F] dark:text-stone-900 dark:border-[#FFB27F]'
        : 'bg-white text-stone-900 border-stone-400 dark:bg-transparent dark:text-stone-50 dark:border-zinc-500'
    }`;

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-orange-200 dark:border-orange-900/50 bg-[#FDF3E7] dark:bg-[#251D17] p-3.5">
      {available.length === 0 ? (
        <>
          <p className="text-[13px] font-bold text-stone-900 dark:text-stone-50">
            Todavía no cargaste tus datos de cobro (alias o CBU, o tus links de Mercado Pago, PayPal, Payoneer u otro).
          </p>
          {onSaveSettings ? (
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="min-h-[44px] rounded-xl bg-[#A8480F] text-white dark:bg-[#FFB27F] dark:text-stone-900 text-[14px] font-extrabold cursor-pointer"
            >
              Cargar datos de cobro
            </button>
          ) : (
            <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-50">Pedile a la administración que los cargue.</p>
          )}
        </>
      ) : (
        <>
          {deposit > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Qué pedir">
              <button type="button" aria-pressed={concept === 'seña'} onClick={() => { setConcept('seña'); setOverride(null); }} className={chip(concept === 'seña')}>
                Seña {depositPercent}% · {format(deposit)}
              </button>
              <button type="button" aria-pressed={concept === 'saldo'} onClick={() => { setConcept('saldo'); setOverride(null); }} className={chip(concept === 'saldo')}>
                Total · {format(balance)}
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2" role="group" aria-label="Medios de pago a incluir">
            {available.map((m) => {
              const on = !off.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setOff((prev) => (on ? [...prev, m] : prev.filter((x) => x !== m)));
                    setOverride(null);
                  }}
                  className={chip(on)}
                >
                  {on ? '✓ ' : ''}
                  {payMethodLabel(m, settings)}
                </button>
              );
            })}
          </div>

          <label htmlFor={`pay-msg-${reservationId}`} className="text-[13px] font-bold text-stone-900 dark:text-stone-50">
            Mensaje (podés editarlo)
          </label>
          <textarea
            id={`pay-msg-${reservationId}`}
            rows={8}
            value={text}
            onChange={(e) => setOverride(e.target.value)}
            className="w-full text-[14px] p-3 rounded-xl border-2 border-stone-400 dark:border-zinc-500 bg-white dark:bg-[#111215] text-stone-900 dark:text-stone-50 focus:outline-none focus:border-[#A8480F] dark:focus:border-[#FFB27F]"
          />

          <div className="flex flex-wrap gap-2">
            {canSend && (
              <a
                href={`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] px-4 rounded-xl bg-[#A8480F] text-white dark:bg-[#FFB27F] dark:text-stone-900 text-[14px] font-extrabold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Pedir pago por WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`${canSend ? '' : 'flex-1 '}min-h-[44px] px-4 rounded-xl border-2 border-stone-400 dark:border-zinc-500 bg-white dark:bg-zinc-800 text-stone-900 dark:text-stone-50 text-[14px] font-extrabold cursor-pointer`}
            >
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
          {!canSend && (
            <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-50">La reserva no tiene teléfono: copiá el mensaje y mandalo por donde hablen.</p>
          )}
          <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-50">
            Cuando llegue el comprobante, registralo abajo con "Registrar pago".
          </p>
          {onSaveSettings && (
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="self-start text-[13px] font-extrabold text-[#8F3B08] dark:text-[#FFB27F] underline underline-offset-2 cursor-pointer"
            >
              Cambiar mis datos de cobro
            </button>
          )}
        </>
      )}

      {sheet && onSaveSettings && <PaymentSettingsSheet settings={settings} onSave={onSaveSettings} onClose={() => setSheet(false)} />}
    </div>
  );
};
