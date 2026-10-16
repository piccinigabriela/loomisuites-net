import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Plus, Save, Tags, Trash2, Calculator, Moon, PartyPopper, Sun } from 'lucide-react';
import type { Property } from '../../types';
import { formatCurrency, formatDisplayDate, getActiveCurrency, getRelativeDate } from '../../data/initialData';
import {
  ARGENTINA_LONG_WEEKENDS,
  DAY_NAMES,
  DayPrices,
  LongWeekend,
  longWeekendNights,
  newId,
  normalizePricing,
  PricingSettings,
  quoteStay,
  Season,
  dayOfWeek,
} from '../../lib/pricing';

interface PricingViewProps {
  properties: Property[];
  pricing?: Partial<PricingSettings> | null;
  onSave: (pricing: PricingSettings) => Promise<void> | void;
  /** Recepción ve la planilla y el simulador, pero no edita */
  readOnly?: boolean;
}

const card = 'bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 sm:p-5';
const h3 = 'text-base font-bold text-stone-900 dark:text-white flex items-center gap-2';
const help = 'text-sm font-medium text-stone-800 dark:text-stone-200';
const inputCls =
  'w-full text-base font-semibold px-3 py-2 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white placeholder:text-stone-500 dark:placeholder:text-zinc-400 disabled:opacity-70';
const ghostBtn =
  'inline-flex items-center justify-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl border border-stone-300 dark:border-zinc-600 text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer';
const dangerBtn =
  'inline-flex items-center justify-center p-2 rounded-xl text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer';

/** Orden de los días para elegir las noches de fin de semana: lunes a domingo */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function longDate(date: string): string {
  return `${DAY_NAMES[dayOfWeek(date)].toLowerCase()} ${formatDisplayDate(date)}`;
}

const MoneyInput: React.FC<{
  value: number | undefined;
  onChange: (v: number) => void;
  label: string;
  disabled?: boolean;
}> = ({ value, onChange, label, disabled }) => (
  <input
    type="number"
    inputMode="decimal"
    min={0}
    aria-label={label}
    value={value ? String(value) : ''}
    placeholder="—"
    disabled={disabled}
    onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
    className={`${inputCls} text-right`}
  />
);

const MinNightsInput: React.FC<{ value: number; onChange: (v: number) => void; disabled?: boolean }> = ({
  value,
  onChange,
  disabled,
}) => (
  <label className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
    <span>Mínimo de noches</span>
    <input
      type="number"
      min={1}
      max={30}
      value={value || 1}
      disabled={disabled}
      onChange={(e) => onChange(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
      className={`${inputCls} w-20 text-center`}
    />
  </label>
);

/** Tabla de precios por tipo: entre semana y fin de semana */
const PriceTable: React.FC<{
  types: PricingSettings['types'];
  precios: Record<string, DayPrices>;
  onChange: (typeId: string, field: keyof DayPrices, v: number) => void;
  disabled?: boolean;
}> = ({ types, precios, onChange, disabled }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-stone-900 dark:text-white">
          <th className="py-2 pr-2 font-bold">Tipo</th>
          <th className="py-2 px-1 font-bold w-28">Entre semana</th>
          <th className="py-2 pl-1 font-bold w-28">Fin de semana</th>
        </tr>
      </thead>
      <tbody>
        {types.map((t) => (
          <tr key={t.id} className="border-t border-stone-200 dark:border-zinc-800">
            <td className="py-2 pr-2 font-semibold text-stone-900 dark:text-white">{t.name || 'Sin nombre'}</td>
            <td className="py-2 px-1">
              <MoneyInput
                label={`${t.name} entre semana`}
                value={precios[t.id]?.semana}
                onChange={(v) => onChange(t.id, 'semana', v)}
                disabled={disabled}
              />
            </td>
            <td className="py-2 pl-1">
              <MoneyInput
                label={`${t.name} fin de semana`}
                value={precios[t.id]?.finde}
                onChange={(v) => onChange(t.id, 'finde', v)}
                disabled={disabled}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Administración → Tarifas: planilla de precios por tipo, temporada y fin de semana largo. */
export const PricingView: React.FC<PricingViewProps> = ({ properties, pricing, onSave, readOnly = false }) => {
  const saved = useMemo(() => normalizePricing(pricing), [pricing]);
  const [draft, setDraft] = useState<PricingSettings>(saved);
  const [saving, setSaving] = useState(false);
  const [newLw, setNewLw] = useState({ name: '', desde: '', hasta: '' });
  const [sim, setSim] = useState({ propertyId: properties[0]?.id || '', checkIn: getRelativeDate(7), checkOut: getRelativeDate(10) });

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  // Si llega una versión nueva guardada (otro dispositivo) y no hay cambios sin guardar, se toma
  useEffect(() => {
    if (!dirty) setDraft(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);
  useEffect(() => {
    if (!sim.propertyId && properties[0]) setSim((s) => ({ ...s, propertyId: properties[0].id }));
  }, [properties, sim.propertyId]);

  const update = (fn: (p: PricingSettings) => PricingSettings) => setDraft((prev) => fn(structuredClone(prev)));
  const currency = getActiveCurrency();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  const unassigned = properties.filter((p) => !draft.assignments[p.id]);
  const seasonsOverlap = draft.seasons.some((a, i) =>
    draft.seasons.some((b, j) => j > i && a.desde && b.desde && a.desde <= b.hasta && b.desde <= a.hasta)
  );
  const badSeason = draft.seasons.some((s) => s.desde && s.hasta && s.hasta < s.desde);
  const quote = quoteStay(draft, properties.find((p) => p.id === sim.propertyId), sim.checkIn, sim.checkOut);
  const today = getRelativeDate(0);
  const upcomingLw = [...draft.longWeekends].sort((a, b) => a.desde.localeCompare(b.desde));
  const missingArgentina = ARGENTINA_LONG_WEEKENDS.filter(
    (w) => w.hasta >= today && !draft.longWeekends.some((x) => x.id === w.id)
  );

  return (
    <div className="space-y-4 max-w-3xl mx-auto font-sans pb-24">
      <div className={card}>
        <span className="text-xs tracking-widest text-[#E67E22] uppercase font-bold flex items-center gap-1.5">
          <Tags className="w-4 h-4" /> Tarifas
        </span>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight mt-1">Planilla de precios por noche</h2>
        <p className={`${help} mt-1`}>
          Cada noche se cobra según cuándo cae: primero los fines de semana largos, después las temporadas y, si no, la tarifa
          normal. Al cargar una reserva, el total se calcula solo (y lo podés cambiar a mano). Precios en {currency}.
        </p>
        {readOnly && (
          <p className="mt-2 text-sm font-bold text-stone-900 dark:text-white">Solo Administración puede cambiar las tarifas.</p>
        )}
      </div>

      {/* Tipos de alojamiento */}
      <div className={card}>
        <h3 className={h3}>
          <Tags className="w-4 h-4 text-[#E67E22]" /> Tipos de alojamiento
        </h3>
        <p className={`${help} mt-1`}>Por ejemplo "Depto 2 personas" y "Depto 4 personas". Después asignás cada unidad a su tipo.</p>
        <div className="mt-3 space-y-2">
          {draft.types.map((t, i) => (
            <div key={t.id} className="flex items-center gap-2">
              <input
                aria-label="Nombre del tipo"
                value={t.name}
                placeholder="Nombre del tipo"
                disabled={readOnly}
                onChange={(e) =>
                  update((p) => {
                    p.types[i].name = e.target.value;
                    return p;
                  })
                }
                className={inputCls}
              />
              {!readOnly && (
                <button
                  type="button"
                  title="Borrar tipo"
                  aria-label={`Borrar ${t.name}`}
                  className={dangerBtn}
                  onClick={() =>
                    update((p) => {
                      p.types = p.types.filter((x) => x.id !== t.id);
                      for (const k of Object.keys(p.assignments)) if (p.assignments[k] === t.id) delete p.assignments[k];
                      return p;
                    })
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <button
              type="button"
              className={ghostBtn}
              onClick={() =>
                update((p) => {
                  p.types.push({ id: newId('tipo'), name: '' });
                  return p;
                })
              }
            >
              <Plus className="w-4 h-4" /> Agregar tipo
            </button>
          )}
        </div>

        {draft.types.length > 0 && properties.length > 0 && (
          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-zinc-800 space-y-2">
            <p className="text-sm font-bold text-stone-900 dark:text-white">Cada unidad, ¿de qué tipo es?</p>
            {properties.map((prop) => (
              <label key={prop.id} className="grid grid-cols-[1fr_1.4fr] gap-2 items-center">
                <span className="text-sm font-semibold text-stone-900 dark:text-white truncate">{prop.name}</span>
                <select
                  value={draft.assignments[prop.id] || ''}
                  disabled={readOnly}
                  onChange={(e) =>
                    update((p) => {
                      if (e.target.value) p.assignments[prop.id] = e.target.value;
                      else delete p.assignments[prop.id];
                      return p;
                    })
                  }
                  className={inputCls}
                >
                  <option value="">Sin tipo (usa su precio base)</option>
                  {draft.types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || 'Sin nombre'}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {unassigned.length > 0 && (
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                {unassigned.length === 1 ? '1 unidad no tiene tipo' : `${unassigned.length} unidades no tienen tipo`}: se
                cobra su precio base de siempre.
              </p>
            )}
          </div>
        )}
      </div>

      {draft.types.length > 0 && (
        <>
          {/* Fin de semana */}
          <div className={card}>
            <h3 className={h3}>
              <Moon className="w-4 h-4 text-[#E67E22]" /> Noches de fin de semana
            </h3>
            <p className={`${help} mt-1`}>Las noches de estos días se cobran con precio de fin de semana.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {WEEK_ORDER.map((d) => {
                const on = draft.weekendNights.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={readOnly}
                    aria-pressed={on}
                    onClick={() =>
                      update((p) => {
                        p.weekendNights = on ? p.weekendNights.filter((x) => x !== d) : [...p.weekendNights, d];
                        return p;
                      })
                    }
                    className={`px-3 py-2 rounded-xl text-sm font-bold border cursor-pointer ${
                      on
                        ? 'bg-[#E67E22] border-[#E67E22] text-white'
                        : 'border-stone-300 dark:border-zinc-600 text-stone-900 dark:text-white'
                    }`}
                  >
                    {DAY_NAMES[d]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Normal */}
          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className={h3}>
                <Sun className="w-4 h-4 text-[#E67E22]" /> Tarifa normal
              </h3>
              <MinNightsInput
                value={draft.normal.minNights}
                disabled={readOnly}
                onChange={(v) =>
                  update((p) => {
                    p.normal.minNights = v;
                    return p;
                  })
                }
              />
            </div>
            <p className={`${help} mt-1`}>La que vale cuando no es temporada ni fin de semana largo.</p>
            <div className="mt-2">
              <PriceTable
                types={draft.types}
                precios={draft.normal.precios}
                disabled={readOnly}
                onChange={(tid, field, v) =>
                  update((p) => {
                    p.normal.precios[tid] = { ...(p.normal.precios[tid] || { semana: 0, finde: 0 }), [field]: v };
                    return p;
                  })
                }
              />
            </div>
          </div>

          {/* Temporadas */}
          <div className={card}>
            <h3 className={h3}>
              <CalendarRange className="w-4 h-4 text-[#E67E22]" /> Temporadas
            </h3>
            <p className={`${help} mt-1`}>
              Por ejemplo temporada alta o vacaciones de invierno. Las fechas son la primera y la última noche que se cobran así.
            </p>
            <div className="mt-3 space-y-4">
              {draft.seasons.map((s, i) => (
                <div key={s.id} className="rounded-xl border border-stone-300 dark:border-zinc-700 p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      aria-label="Nombre de la temporada"
                      value={s.name}
                      placeholder="Nombre (ej: Temporada alta)"
                      disabled={readOnly}
                      onChange={(e) =>
                        update((p) => {
                          p.seasons[i].name = e.target.value;
                          return p;
                        })
                      }
                      className={inputCls}
                    />
                    {!readOnly && (
                      <button
                        type="button"
                        className={dangerBtn}
                        aria-label={`Borrar ${s.name || 'temporada'}`}
                        onClick={() =>
                          update((p) => {
                            p.seasons = p.seasons.filter((x) => x.id !== s.id);
                            return p;
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-sm font-bold text-stone-900 dark:text-white space-y-1">
                      <span>Primera noche</span>
                      <input
                        type="date"
                        value={s.desde}
                        disabled={readOnly}
                        onChange={(e) =>
                          update((p) => {
                            p.seasons[i].desde = e.target.value;
                            return p;
                          })
                        }
                        className={inputCls}
                      />
                    </label>
                    <label className="text-sm font-bold text-stone-900 dark:text-white space-y-1">
                      <span>Última noche</span>
                      <input
                        type="date"
                        value={s.hasta}
                        disabled={readOnly}
                        onChange={(e) =>
                          update((p) => {
                            p.seasons[i].hasta = e.target.value;
                            return p;
                          })
                        }
                        className={inputCls}
                      />
                    </label>
                  </div>
                  <MinNightsInput
                    value={s.minNights}
                    disabled={readOnly}
                    onChange={(v) =>
                      update((p) => {
                        p.seasons[i].minNights = v;
                        return p;
                      })
                    }
                  />
                  <PriceTable
                    types={draft.types}
                    precios={s.precios}
                    disabled={readOnly}
                    onChange={(tid, field, v) =>
                      update((p) => {
                        p.seasons[i].precios[tid] = { ...(p.seasons[i].precios[tid] || { semana: 0, finde: 0 }), [field]: v };
                        return p;
                      })
                    }
                  />
                </div>
              ))}
              {badSeason && (
                <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                  Hay una temporada con la última noche antes que la primera.
                </p>
              )}
              {seasonsOverlap && (
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  Hay temporadas que se superponen: en esas noches vale la que está primero en la lista.
                </p>
              )}
              {!readOnly && (
                <button
                  type="button"
                  className={ghostBtn}
                  onClick={() =>
                    update((p) => {
                      const s: Season = {
                        id: newId('temp'),
                        name: p.seasons.length === 0 ? 'Temporada alta' : '',
                        desde: '',
                        hasta: '',
                        minNights: 1,
                        precios: {},
                      };
                      p.seasons.push(s);
                      return p;
                    })
                  }
                >
                  <Plus className="w-4 h-4" /> Agregar temporada
                </button>
              )}
            </div>
          </div>

          {/* Fines de semana largos */}
          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className={h3}>
                <PartyPopper className="w-4 h-4 text-[#E67E22]" /> Fines de semana largos
              </h3>
              <MinNightsInput
                value={draft.longWeekendMinNights}
                disabled={readOnly}
                onChange={(v) =>
                  update((p) => {
                    p.longWeekendMinNights = v;
                    return p;
                  })
                }
              />
            </div>
            <p className={`${help} mt-1`}>
              Un precio por noche para todos. Se cobra desde la noche anterior al primer día libre hasta la noche anterior al
              último (ej. sábado a lunes: noches de viernes, sábado y domingo).
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-stone-900 dark:text-white">
                    <th className="py-2 pr-2 font-bold">Tipo</th>
                    <th className="py-2 pl-1 font-bold w-36">Precio por noche</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.types.map((t) => (
                    <tr key={t.id} className="border-t border-stone-200 dark:border-zinc-800">
                      <td className="py-2 pr-2 font-semibold text-stone-900 dark:text-white">{t.name || 'Sin nombre'}</td>
                      <td className="py-2 pl-1">
                        <MoneyInput
                          label={`${t.name} fin de semana largo`}
                          value={draft.longWeekendPrices[t.id]}
                          disabled={readOnly}
                          onChange={(v) =>
                            update((p) => {
                              p.longWeekendPrices[t.id] = v;
                              return p;
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm font-bold text-stone-900 dark:text-white">Fechas</p>
            <ul className="mt-1 divide-y divide-stone-200 dark:divide-zinc-800">
              {upcomingLw.map((w: LongWeekend) => {
                const past = w.hasta < today;
                const n = longWeekendNights(w);
                return (
                  <li key={w.id} className={`py-2 flex items-center justify-between gap-2 ${past ? 'opacity-70' : ''}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-stone-900 dark:text-white">
                        {w.name} {past && '(ya pasó)'}
                      </p>
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                        Libre del {longDate(w.desde)} al {longDate(w.hasta)} · noches {formatDisplayDate(n.primera)} a{' '}
                        {formatDisplayDate(n.ultima)}
                      </p>
                    </div>
                    {!readOnly && (
                      <button
                        type="button"
                        className={dangerBtn}
                        aria-label={`Sacar ${w.name}`}
                        onClick={() =>
                          update((p) => {
                            p.longWeekends = p.longWeekends.filter((x) => x.id !== w.id);
                            return p;
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {!readOnly && (
              <div className="mt-3 rounded-xl border border-dashed border-stone-300 dark:border-zinc-600 p-3 space-y-2">
                <p className="text-sm font-bold text-stone-900 dark:text-white">Agregar un fin de semana largo</p>
                <input
                  aria-label="Nombre del fin de semana largo"
                  value={newLw.name}
                  placeholder="Nombre (ej: Fiesta del pueblo)"
                  onChange={(e) => setNewLw({ ...newLw, name: e.target.value })}
                  className={inputCls}
                />
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-sm font-bold text-stone-900 dark:text-white space-y-1">
                    <span>Primer día libre</span>
                    <input type="date" value={newLw.desde} onChange={(e) => setNewLw({ ...newLw, desde: e.target.value })} className={inputCls} />
                  </label>
                  <label className="text-sm font-bold text-stone-900 dark:text-white space-y-1">
                    <span>Último día libre</span>
                    <input type="date" value={newLw.hasta} onChange={(e) => setNewLw({ ...newLw, hasta: e.target.value })} className={inputCls} />
                  </label>
                </div>
                <button
                  type="button"
                  className={ghostBtn}
                  disabled={!newLw.desde || !newLw.hasta || newLw.hasta < newLw.desde}
                  onClick={() => {
                    update((p) => {
                      p.longWeekends.push({
                        id: newId('finde'),
                        name: newLw.name.trim() || 'Fin de semana largo',
                        desde: newLw.desde,
                        hasta: newLw.hasta,
                      });
                      return p;
                    });
                    setNewLw({ name: '', desde: '', hasta: '' });
                  }}
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
                {missingArgentina.length > 0 && (
                  <button
                    type="button"
                    className={`${ghostBtn} ml-2`}
                    onClick={() =>
                      update((p) => {
                        p.longWeekends.push(...missingArgentina.map((w) => ({ ...w })));
                        return p;
                      })
                    }
                  >
                    Volver a poner los feriados de Argentina
                  </button>
                )}
              </div>
            )}
            <p className={`${help} mt-3`}>
              Los días no laborables turísticos de 2027 todavía no salieron por decreto; cuando salgan, agregalos acá.
            </p>
          </div>
        </>
      )}

      {/* Simulador */}
      {properties.length > 0 && (
        <div className={card}>
          <h3 className={h3}>
            <Calculator className="w-4 h-4 text-[#E67E22]" /> Probar un precio
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <label className="text-sm font-bold text-stone-900 dark:text-white space-y-1">
              <span>Unidad</span>
              <select value={sim.propertyId} onChange={(e) => setSim({ ...sim, propertyId: e.target.value })} className={inputCls}>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold text-stone-900 dark:text-white space-y-1">
              <span>Entrada</span>
              <input type="date" value={sim.checkIn} onChange={(e) => setSim({ ...sim, checkIn: e.target.value })} className={inputCls} />
            </label>
            <label className="text-sm font-bold text-stone-900 dark:text-white space-y-1">
              <span>Salida</span>
              <input type="date" value={sim.checkOut} onChange={(e) => setSim({ ...sim, checkOut: e.target.value })} className={inputCls} />
            </label>
          </div>
          {quote.nights.length === 0 ? (
            <p className={`${help} mt-3`}>Elegí una salida posterior a la entrada.</p>
          ) : (
            <div className="mt-3 space-y-1">
              {quote.groups.map((g) => (
                <div key={g.label + g.price} className="flex justify-between gap-2 text-sm font-semibold text-stone-900 dark:text-white">
                  <span>
                    {g.count} {g.count === 1 ? 'noche' : 'noches'} · {g.label} × {formatCurrency(g.price)}
                  </span>
                  <span className="whitespace-nowrap shrink-0">{formatCurrency(g.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between gap-2 pt-2 border-t border-stone-200 dark:border-zinc-800 text-base font-bold text-stone-900 dark:text-white">
                <span>Total alojamiento ({quote.nights.length} {quote.nights.length === 1 ? 'noche' : 'noches'})</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
              {!quote.fromTable && (
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  Esta unidad no tiene tipo: se usa su precio base.
                </p>
              )}
              {quote.belowMinimum && (
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  Ojo: el mínimo es de {quote.minNights} noches ({quote.minNightsPeriod}).
                </p>
              )}
              {quote.missingPrices && (
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  Faltan precios en la planilla para algunas noches: se usó la tarifa normal o el precio base.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Barra de guardar */}
      {!readOnly && dirty && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[#18191E] border-t border-stone-300 dark:border-zinc-700 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-stone-900 dark:text-white">Tenés cambios sin guardar</span>
            <div className="flex gap-2">
              <button type="button" className={ghostBtn} onClick={() => setDraft(saved)}>
                Descartar
              </button>
              <button
                type="button"
                disabled={saving || badSeason}
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl bg-[#E67E22] hover:bg-[#D35400] disabled:opacity-50 text-white cursor-pointer"
              >
                <Save className="w-4 h-4" /> {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
