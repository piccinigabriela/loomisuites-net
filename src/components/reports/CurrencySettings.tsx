/**
 * Moneda de liquidación y cotizaciones (antes estaba arriba de Rendimiento financiero; ahora es una tarjeta de Informes).
 */
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { CurrencyCode, DemoState } from '../../types';
import { toLocalDateStr } from '../../data/initialData';

export type CurrencySettingsValue = {
  settlementCurrency: CurrencyCode;
  rates: Partial<Record<CurrencyCode, number>>;
  ratesUpdatedAt?: string;
};

const ALL: { code: CurrencyCode; label: string }[] = [
  { code: 'ARS', label: 'Pesos argentinos (ARS)' },
  { code: 'USD', label: 'Dólares (USD)' },
  { code: 'BRL', label: 'Reales (BRL)' },
  { code: 'EUR', label: 'Euros (EUR)' },
];

const field =
  'w-full min-h-[44px] px-3 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-base font-semibold text-stone-900 dark:text-white focus:outline-none focus:border-[#E67E22]';

export const CurrencySettings: React.FC<{ demoState: DemoState; onSave?: (s: CurrencySettingsValue) => void }> = ({ demoState, onSave }) => {
  const current = demoState.currencySettings?.settlementCurrency || 'USD';
  const rates = demoState.currencySettings?.rates || {};
  const updatedAt = demoState.currencySettings?.ratesUpdatedAt || '';
  const ratesKey = JSON.stringify(rates);

  const [pendingCurrency, setPendingCurrency] = useState<CurrencyCode | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInputs(Object.fromEntries(ALL.map((c) => [c.code, rates[c.code] !== undefined ? String(rates[c.code]) : ''])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, ratesKey]);

  const changeCurrency = (code: CurrencyCode) => {
    if (code === current) return setPendingCurrency(null);
    if (demoState.reservations?.length && pendingCurrency !== code) return setPendingCurrency(code);
    setPendingCurrency(null);
    onSave?.({ settlementCurrency: code, rates: {}, ratesUpdatedAt: '' });
  };

  const saveRates = () => {
    const next: Partial<Record<CurrencyCode, number>> = {};
    for (const c of ALL) {
      if (c.code === current) continue;
      const v = parseFloat(String(inputs[c.code] || '').replace(',', '.'));
      if (!isNaN(v) && v > 0) next[c.code] = v;
    }
    const now = new Date();
    onSave?.({ settlementCurrency: current, rates: next, ratesUpdatedAt: `${toLocalDateStr(now)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] p-5 sm:p-6 space-y-3">
        <h3 className="text-lg font-bold">Moneda de liquidación</h3>
        <p className="text-base text-stone-800 dark:text-stone-200">Todos los totales, tarifas e informes se muestran en esta moneda. Cambiarla no convierte los montos ya cargados.</p>
        <select value={pendingCurrency || current} onChange={(e) => changeCurrency(e.target.value as CurrencyCode)} className={`${field} max-w-sm cursor-pointer`} aria-label="Moneda de liquidación">
          {ALL.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        {pendingCurrency && (
          <div className="rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100 p-4 space-y-3">
            <p className="text-base font-semibold">
              Vas a pasar de {current} a {pendingCurrency}. Los montos que ya cargaste no se convierten y vas a tener que volver a cargar las cotizaciones.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => changeCurrency(pendingCurrency)} className="min-h-[44px] px-5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] font-bold cursor-pointer">
                Cambiar igual
              </button>
              <button type="button" onClick={() => setPendingCurrency(null)} className="min-h-[44px] px-5 rounded-xl border-2 border-current font-bold cursor-pointer">
                Dejar como está
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] p-5 sm:p-6 space-y-4">
        <h3 className="text-lg font-bold">Cotizaciones</h3>
        <p className="text-base text-stone-800 dark:text-stone-200">Para pasar a {current} los pagos y gastos en otra moneda.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {ALL.filter((c) => c.code !== current).map((c) => (
            <label key={c.code} className="space-y-1">
              <span className="block text-sm font-bold">1 {c.code} =</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={inputs[c.code] || ''}
                  onChange={(e) => setInputs({ ...inputs, [c.code]: e.target.value })}
                  className={field}
                />
                <span className="text-sm font-bold shrink-0">{current}</span>
              </div>
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={saveRates} className="min-h-[44px] px-5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] font-bold cursor-pointer">
            Guardar cotizaciones
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-base font-bold text-emerald-800 dark:text-emerald-200">
              <Check className="w-4 h-4" /> Guardadas
            </span>
          )}
          {updatedAt && !saved && <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">Última actualización: {updatedAt}</span>}
        </div>
      </div>
    </div>
  );
};
