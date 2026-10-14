import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Link2, Upload } from 'lucide-react';
import { CurrencyCode, DemoState, Property, Reservation } from '../../types';
import { formatCurrency, toLocalDateStr } from '../../data/initialData';
import {
  LegacyBackup,
  convertLegacyBackup,
  suggestPropertyForCode,
  summarizeLegacyUnits,
} from '../../lib/legacyBackupImport';

export interface LegacyImportPayload {
  newProperties: Property[];
  updatedProperties: Property[];
  reservations: Reservation[];
}

interface LegacyBackupImportProps {
  data: LegacyBackup;
  fileName: string;
  demoState: DemoState;
  onBack: () => void;
  onImport: (payload: LegacyImportPayload) => Promise<void> | void;
}

const NEW_UNIT = '__new__';
const SKIP_UNIT = '__skip__';
const CURRENCIES: CurrencyCode[] = ['ARS', 'USD', 'BRL', 'EUR'];

export const LegacyBackupImport: React.FC<LegacyBackupImportProps> = ({
  data,
  fileName,
  demoState,
  onBack,
  onImport,
}) => {
  const properties = demoState.properties || [];
  const settlementCurrency: CurrencyCode = demoState.currencySettings?.settlementCurrency || 'USD';
  const units = useMemo(() => summarizeLegacyUnits(data), [data]);

  const [mapping, setMapping] = useState<Record<string, string>>(() =>
    Object.fromEntries(units.map((u) => [u.code, suggestPropertyForCode(u.code, properties) || NEW_UNIT]))
  );
  const [fileCurrency, setFileCurrency] = useState<CurrencyCode>('USD');
  const [rateInput, setRateInput] = useState<string>(() => {
    const r = demoState.currencySettings?.rates?.USD;
    return r ? String(r) : '';
  });
  const [includeCancelled, setIncludeCancelled] = useState(true);
  const [loadCalendars, setLoadCalendars] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsRate = fileCurrency !== settlementCurrency;
  const rate = needsRate ? parseFloat(rateInput.replace(',', '.')) || 0 : 1;
  const today = toLocalDateStr(new Date());

  // Ids definitivos de las unidades nuevas (estables mientras se mira la vista previa)
  const newUnitIds = useMemo(
    () => Object.fromEntries(units.map((u) => [u.code, `prop-import-${u.code.replace(/[^A-Za-z0-9]/g, '')}-${Date.now()}`])),
    [units]
  );

  const unitMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const u of units) {
      const target = mapping[u.code];
      if (!target || target === SKIP_UNIT) continue;
      m[u.code] = target === NEW_UNIT ? newUnitIds[u.code] : target;
    }
    return m;
  }, [units, mapping, newUnitIds]);

  const preview = useMemo(
    () =>
      convertLegacyBackup(data, {
        unitMap,
        fileCurrency,
        settlementCurrency,
        rate: rate || 1,
        includeCancelled,
        today,
      }),
    [data, unitMap, fileCurrency, settlementCurrency, rate, includeCancelled, today]
  );

  const existingKeys = useMemo(
    () => new Set((demoState.reservations || []).map((r) => `${r.propertyId}_${r.checkIn}_${r.checkOut}`)),
    [demoState.reservations]
  );
  const existingIds = useMemo(() => new Set((demoState.reservations || []).map((r) => r.id)), [demoState.reservations]);
  const toImport = preview.reservations.filter(
    (r) => !existingIds.has(r.id) && !existingKeys.has(`${r.propertyId}_${r.checkIn}_${r.checkOut}`)
  );
  const alreadyThere = preview.reservations.length - toImport.length;
  const upcoming = toImport.filter((r) => r.status !== 'cancelled' && r.checkOut >= today).length;
  const grossTotal = toImport.filter((r) => r.status !== 'cancelled').reduce((s, r) => s + r.totalAmount, 0);

  const handleImport = async () => {
    setError(null);
    if (needsRate && rate <= 0) {
      setError(`Ingresá cuántos ${settlementCurrency} vale 1 ${fileCurrency} para convertir los montos.`);
      return;
    }
    if (Object.keys(unitMap).length === 0) {
      setError('Elegí al menos una unidad para importar.');
      return;
    }

    const toSettlement = (v: number) => Math.round(v * (rate || 1));
    const newProperties: Property[] = [];
    const updatedProperties: Property[] = [];

    for (const u of units) {
      const target = mapping[u.code];
      if (!target || target === SKIP_UNIT) continue;
      const airbnbUrl = loadCalendars ? u.airbnbUrl : undefined;
      const bookingUrl = loadCalendars ? u.bookingUrl : undefined;

      if (target === NEW_UNIT) {
        newProperties.push({
          id: newUnitIds[u.code],
          name: u.code,
          type: 'Departamento',
          address: demoState.welcomeGuide?.locationAddress || '',
          city: '',
          neighborhood: '',
          bedrooms: 1,
          bathrooms: 1,
          maxGuests: 2,
          basePrice: toSettlement(u.medianNightPrice),
          cleaningFee: 0,
          imageUrl: '',
          rating: 0,
          reviewsCount: 0,
          status: 'active',
          syncStatus: { airbnb: Boolean(airbnbUrl), booking: Boolean(bookingUrl), vrbo: false },
          smartLock: { enabled: false, brand: '' },
          wifiNetwork: demoState.welcomeGuide?.wifiNetwork || '',
          wifiPassword: demoState.welcomeGuide?.wifiPassword || '',
          ...(airbnbUrl ? { icalAirbnbUrl: airbnbUrl } : {}),
          ...(bookingUrl ? { icalBookingUrl: bookingUrl } : {}),
        });
      } else if (airbnbUrl || bookingUrl) {
        const prop = properties.find((p) => p.id === target);
        if (prop) {
          updatedProperties.push({
            ...prop,
            icalAirbnbUrl: prop.icalAirbnbUrl || airbnbUrl,
            icalBookingUrl: prop.icalBookingUrl || bookingUrl,
            syncStatus: {
              ...prop.syncStatus,
              airbnb: Boolean(prop.icalAirbnbUrl || airbnbUrl),
              booking: Boolean(prop.icalBookingUrl || bookingUrl),
            },
          });
        }
      }
    }

    setIsImporting(true);
    try {
      await onImport({ newProperties, updatedProperties, reservations: toImport });
    } catch (err: any) {
      setError(`No se pudo completar la importación: ${err?.message || 'error desconocido'}`);
      setIsImporting(false);
    }
  };

  const labelCls = 'block text-xs font-bold text-stone-800 dark:text-stone-100 mb-1';
  const selectCls =
    'w-full text-xs font-semibold p-2.5 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-stone-900 dark:text-stone-100 cursor-pointer';

  return (
    <div className="space-y-5 text-stone-900 dark:text-stone-100">
      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs leading-relaxed">
        <p className="font-bold text-emerald-900 dark:text-emerald-200">
          Reconocimos el backup de tu sistema anterior ({fileName})
        </p>
        <p className="text-emerald-900 dark:text-emerald-100 mt-1">
          {data.reservas.length} reservas en {units.length} unidades. Revisá cómo se cargan y tocá Importar. Si una reserva ya
          está en Loomi (misma unidad y mismas fechas), no se duplica.
        </p>
      </div>

      {/* 1. Unidades */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold">1. ¿A qué unidad de Loomi corresponde cada una?</h4>
        <div className="space-y-2">
          {units.map((u) => (
            <div
              key={u.code}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr] gap-2 items-center p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/60"
            >
              <div className="text-xs">
                <span className="font-bold text-sm">{u.code}</span>
                <span className="text-stone-700 dark:text-stone-300">
                  {' '}
                  · {u.count} {u.count === 1 ? 'reserva' : 'reservas'}
                  {u.medianNightPrice > 0 && ` · ${u.medianNightPrice} ${fileCurrency}/noche aprox.`}
                </span>
                {(u.airbnbUrl || u.bookingUrl) && (
                  <span className="flex items-center gap-1 mt-0.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Link2 className="w-3 h-3" />
                    {[u.airbnbUrl && 'Airbnb', u.bookingUrl && 'Booking'].filter(Boolean).join(' + ')}
                  </span>
                )}
              </div>
              <select
                value={mapping[u.code] || NEW_UNIT}
                onChange={(e) => setMapping({ ...mapping, [u.code]: e.target.value })}
                className={selectCls}
              >
                <option value={NEW_UNIT}>➕ Crear unidad nueva «{u.code}»</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    Usar «{p.name}»
                  </option>
                ))}
                <option value={SKIP_UNIT}>No importar esta unidad</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Moneda */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold">2. ¿En qué moneda están los precios del archivo?</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Moneda del archivo</label>
            <select
              value={fileCurrency}
              onChange={(e) => {
                const c = e.target.value as CurrencyCode;
                setFileCurrency(c);
                const r = demoState.currencySettings?.rates?.[c];
                setRateInput(r ? String(r) : '');
              }}
              className={selectCls}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {needsRate ? (
            <div>
              <label className={labelCls}>
                1 {fileCurrency} = ¿cuántos {settlementCurrency}?
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                placeholder="Ej: 1250"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-stone-900 dark:text-stone-100"
              />
            </div>
          ) : (
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 self-end pb-2">
              ✓ Coincide con tu moneda de liquidación ({settlementCurrency}).
            </p>
          )}
        </div>
        {needsRate && (
          <p className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-2.5">
            Tu complejo liquida en {settlementCurrency} y el archivo está en {fileCurrency}: los totales se convierten con esta
            cotización. Si preferís llevar todo en {fileCurrency}, cambiá la moneda de liquidación en Rendimiento Financiero
            antes de importar.
          </p>
        )}
      </div>

      {/* 3. Opciones */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold">3. Opciones</h4>
        <label className="flex items-start gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={loadCalendars}
            onChange={(e) => setLoadCalendars(e.target.checked)}
            className="mt-0.5 cursor-pointer"
          />
          <span>
            <strong>Cargar los calendarios de Airbnb y Booking</strong> de cada unidad (los que tenías en tu app anterior), para
            que Loomi siga sincronizando.
          </span>
        </label>
        <label className="flex items-start gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={includeCancelled}
            onChange={(e) => setIncludeCancelled(e.target.checked)}
            className="mt-0.5 cursor-pointer"
          />
          <span>
            <strong>Incluir canceladas y no-shows</strong> (quedan como canceladas, no ocupan el calendario).
          </span>
        </label>
      </div>

      {/* Resumen */}
      <div className="p-3.5 rounded-2xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-800/80 text-xs space-y-1.5">
        <p className="font-bold text-sm">Se van a importar {toImport.length} reservas</p>
        <ul className="space-y-1 text-stone-800 dark:text-stone-200">
          <li>• {upcoming} próximas o en curso (se les crea la limpieza del día de salida).</li>
          <li>
            • {preview.paidByPlatformCount} de Airbnb/Booking marcadas como cobradas por la plataforma (el neto que te llegó
            queda en la nota del pago).
          </li>
          {includeCancelled && <li>• {preview.cancelledCount} canceladas o no-show.</li>}
          <li>• Facturación total: {formatCurrency(grossTotal, settlementCurrency)}.</li>
          {alreadyThere > 0 && <li>• {alreadyThere} ya estaban en Loomi y se omiten.</li>}
          {preview.skipped > 0 && <li>• {preview.skipped} se omiten (unidad no importada o fechas inválidas).</li>}
        </ul>
        <p className="text-stone-700 dark:text-stone-300 pt-1">
          El archivo no trae cantidad de huéspedes, mail ni tarifa de limpieza: quedan para completar si los necesitás. Los PIN de
          acceso de tu app anterior no se copian.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={isImporting}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-600 text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={isImporting || toImport.length === 0}
          className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isImporting ? (
            <>
              <Upload className="w-4 h-4 animate-pulse" /> Importando…
            </>
          ) : (
            <>
              <Check className="w-4 h-4" /> Importar {toImport.length} reservas
            </>
          )}
        </button>
      </div>
    </div>
  );
};
