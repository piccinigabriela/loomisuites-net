import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cbuWarning, type PaymentSettings } from './paymentMessage';

type Fields = Pick<PaymentSettings, 'bankAlias' | 'cbu' | 'bankName' | 'accountHolder' | 'mercadoPagoLink' | 'paypalLink' | 'payoneerLink'>;

interface PaymentSettingsSheetProps {
  settings?: Partial<PaymentSettings>;
  onSave: (fields: Fields) => Promise<void> | void;
  onClose: () => void;
}

const INPUT =
  'w-full text-base p-3 rounded-2xl border-2 border-stone-400 dark:border-zinc-500 bg-white dark:bg-[#111215] text-stone-900 dark:text-gray-100 placeholder-stone-600 dark:placeholder-gray-400 focus:outline-none focus:border-[#A8480F] dark:focus:border-[#FFB27F]';

export const PaymentSettingsSheet: React.FC<PaymentSettingsSheetProps> = ({ settings, onSave, onClose }) => {
  const [f, setF] = useState<Fields>({
    bankAlias: settings?.bankAlias || '',
    cbu: settings?.cbu || '',
    bankName: settings?.bankName || '',
    accountHolder: settings?.accountHolder || '',
    mercadoPagoLink: settings?.mercadoPagoLink || '',
    paypalLink: settings?.paypalLink || '',
    payoneerLink: settings?.payoneerLink || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => setF((prev) => ({ ...prev, [k]: e.target.value }));
  const warn = cbuWarning(f.cbu);

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const trim = (v?: string) => (v || '').trim();
      await onSave({
        bankAlias: trim(f.bankAlias),
        cbu: trim(f.cbu).replace(/\s/g, ''),
        bankName: trim(f.bankName),
        accountHolder: trim(f.accountHolder),
        mercadoPagoLink: trim(f.mercadoPagoLink),
        paypalLink: trim(f.paypalLink),
        payoneerLink: trim(f.payoneerLink),
      });
      onClose();
    } catch {
      setError('No se pudo guardar. Probá de nuevo.');
      setBusy(false);
    }
  };

  // Función de render (no componente): así el input no se remonta ni pierde el foco al escribir
  const renderField = ({
    id,
    label,
    k,
    placeholder,
    type = 'text',
    mono,
    hint,
  }: {
    id: string;
    label: string;
    k: keyof Fields;
    placeholder?: string;
    type?: string;
    mono?: boolean;
    hint?: string;
  }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={type === 'url' ? 'url' : undefined}
        autoCapitalize="none"
        autoCorrect="off"
        value={f[k] || ''}
        onChange={set(k)}
        placeholder={placeholder}
        className={`${INPUT} ${mono ? 'font-mono' : ''}`}
      />
      {hint && <p className="text-xs font-semibold text-stone-800 dark:text-gray-200">{hint}</p>}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Datos de cobro"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#1A1B20] text-stone-900 dark:text-gray-100 rounded-t-[28px] sm:rounded-[28px] p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold">💰 Datos de cobro</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-10 h-10 rounded-full bg-[#E8E2D8] dark:bg-zinc-700 text-stone-900 dark:text-gray-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm font-semibold text-stone-900 dark:text-gray-100">
          Con esto armamos el mensaje para pedir el pago. Solo se envía lo que cargues acá.
        </p>

        <div className="space-y-3 p-3 rounded-2xl border-2 border-stone-300 dark:border-zinc-600">
          <h4 className="text-sm font-extrabold">🏦 Transferencia bancaria</h4>
          {renderField({ id: 'pay-alias', label: 'Alias', k: 'bankAlias', placeholder: 'Ej: MI.COMPLEJO.MP', mono: true })}
          <div className="space-y-1.5">
            {renderField({ id: 'pay-cbu', label: 'CBU / CVU (22 dígitos)', k: 'cbu', placeholder: '0000000000000000000000', mono: true })}
            {warn && (
              <p role="alert" className="text-xs font-extrabold text-red-800 dark:text-red-300">
                ⚠️ {warn}
              </p>
            )}
          </div>
          {renderField({ id: 'pay-bank', label: 'Banco', k: 'bankName', placeholder: 'Ej: Banco Nación' })}
          {renderField({ id: 'pay-holder', label: 'Titular', k: 'accountHolder', placeholder: 'Nombre de la cuenta' })}
        </div>

        {renderField({ id: 'pay-mp', label: '💳 Mercado Pago (link de cobro)', k: 'mercadoPagoLink', type: 'url', mono: true, placeholder: 'https://link.mercadopago.com.ar/...' })}
        {renderField({ id: 'pay-paypal', label: '🅿️ PayPal (link PayPal.me)', k: 'paypalLink', type: 'url', mono: true, placeholder: 'https://paypal.me/...' })}
        {renderField({ id: 'pay-payoneer', label: '🌐 Payoneer (link de pago)', k: 'payoneerLink', type: 'url', mono: true, placeholder: 'Pegá el link que te genera Payoneer' })}

        {error && (
          <p role="alert" className="text-sm font-bold text-red-800 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={busy}
          className="w-full py-3 rounded-2xl text-sm font-extrabold bg-[#A8480F] text-white dark:bg-[#FFB27F] dark:text-stone-900 cursor-pointer disabled:opacity-60"
        >
          {busy ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};
