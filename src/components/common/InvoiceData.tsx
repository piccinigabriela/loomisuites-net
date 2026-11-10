import React, { useState } from 'react';
import { Check, Copy, FileText } from 'lucide-react';
import type { PreCheckin, Reservation } from '../../types';

/**
 * Ficha de la reserva → "Datos para facturar" (10/11). Loomi no factura: deja cada dato listo para copiar y pegar
 * en el facturador de ARCA ("Comprobantes en línea") o el que use el anfitrión. El documento sale del pre check-in.
 */
const ddmmyyyy = (iso: string) => {
  const [y, m, d] = (iso || '').slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};
const nightsBetween = (a: string, b: string) =>
  Math.max(0, Math.round((Date.parse(`${b.slice(0, 10)}T12:00:00Z`) - Date.parse(`${a.slice(0, 10)}T12:00:00Z`)) / 86400000));
/** Importe como lo pide ARCA: sin símbolo ni puntos de miles, con coma decimal */
const plainAmount = (n: number) => (Math.round((n || 0) * 100) / 100).toFixed(2).replace('.', ',');

export const InvoiceData: React.FC<{
  reservation: Reservation;
  unitName: string;
  precheckin?: PreCheckin;
  /** Total pagado (en la moneda de liquidación) */
  paid: number;
  currency: string;
}> = ({ reservation, unitName, precheckin, paid, currency }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState('');

  const nights = nightsBetween(reservation.checkIn, reservation.checkOut);
  const doc = precheckin?.docNumber?.trim()
    ? `${precheckin.docType === 'pasaporte' ? 'Pasaporte' : precheckin.docType === 'otro' ? 'Documento' : 'DNI'} ${precheckin.docNumber.trim()}`
    : '';
  const rows: Array<[string, string]> = [
    ['Nombre', (precheckin?.fullName || reservation.guestName || '').trim()],
    ['Documento', doc],
    ['Condición frente al IVA', 'Consumidor final'],
    ['Concepto', `Alojamiento en ${unitName || 'la unidad'}, del ${ddmmyyyy(reservation.checkIn)} al ${ddmmyyyy(reservation.checkOut)} (${nights} ${nights === 1 ? 'noche' : 'noches'})`],
    ['Período desde', ddmmyyyy(reservation.checkIn)],
    ['Período hasta', ddmmyyyy(reservation.checkOut)],
    [`Importe total (${currency})`, plainAmount(reservation.totalAmount)],
  ];
  if (paid > 0 && paid < reservation.totalAmount) rows.push([`Pagado hasta hoy (${currency})`, plainAmount(paid)]);

  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1800);
  };
  const all = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');

  return (
    <div className="bg-white dark:bg-[#1A1B20] border-2 border-stone-200 dark:border-zinc-700 rounded-2xl p-4 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2.5 text-left cursor-pointer"
      >
        <FileText className="w-5 h-5 text-[#A94F12] dark:text-[#F0A46F]" />
        <span className="text-[14px] font-bold text-stone-900 dark:text-stone-50">Datos para facturar</span>
        <span className="ml-auto text-[13px] font-bold text-[#8F3B08] dark:text-[#FFB27F]">{open ? 'Cerrar' : 'Ver'}</span>
      </button>

      {open && (
        <>
          <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-200">
            Copiá cada dato en el facturador de ARCA o en el que uses. Loomi no factura.
          </p>
          <ul className="flex flex-col gap-1.5">
            {rows.map(([k, v]) => (
              <li key={k} className="flex items-center gap-2 rounded-xl bg-stone-50 dark:bg-zinc-800/70 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <span className="block text-[12px] font-bold text-stone-800 dark:text-stone-200">{k}</span>
                  <span className="block text-[14px] font-semibold text-stone-900 dark:text-stone-50 break-words">
                    {v || (k === 'Documento' ? 'Sin dato: llega con el pre check-in' : '—')}
                  </span>
                </div>
                {v && (
                  <button
                    type="button"
                    onClick={() => copy(k, v)}
                    aria-label={`Copiar ${k}`}
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-stone-300 dark:border-zinc-600 text-stone-900 dark:text-stone-50 cursor-pointer"
                  >
                    {copied === k ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => copy('__all', all)}
            className="self-start min-h-[40px] px-4 rounded-xl border-2 border-stone-400 dark:border-zinc-500 text-[13px] font-bold text-stone-900 dark:text-stone-50 cursor-pointer"
          >
            {copied === '__all' ? '¡Copiado!' : 'Copiar todo'}
          </button>
        </>
      )}
    </div>
  );
};
