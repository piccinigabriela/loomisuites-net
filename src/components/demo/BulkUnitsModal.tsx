/**
 * Cargar varias unidades de una vez: una categoría (con el nombre que use cada lugar), para cuántas personas,
 * cuántas hay y cómo se numeran. Sirve para hoteles y complejos con muchas unidades iguales.
 * Opcional: crea la categoría en Tarifas y le asigna las unidades nuevas.
 */
import React, { useMemo, useState } from 'react';
import { Layers, X } from 'lucide-react';
import type { Property } from '../../types';

type Naming = 'numeros' | 'letras' | 'lista';

const MAX_UNITS = 60;

/** Los nombres que se van a crear, según cómo numera cada lugar */
export function buildUnitNames(opts: { naming: Naming; count: number; start: string; list: string; prefix: string }): string[] {
  const prefix = opts.prefix.trim();
  const withPrefix = (code: string) => (prefix ? `${prefix} ${code}` : code);
  if (opts.naming === 'lista') {
    return opts.list
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_UNITS)
      .map(withPrefix);
  }
  const count = Math.max(0, Math.min(MAX_UNITS, Math.floor(opts.count || 0)));
  if (opts.naming === 'letras') {
    const first = (opts.start.trim().toUpperCase() || 'A').charCodeAt(0);
    const base = first >= 65 && first <= 90 ? first : 65;
    return Array.from({ length: Math.min(count, 91 - base) }, (_, i) => withPrefix(String.fromCharCode(base + i)));
  }
  const raw = opts.start.trim() || '1';
  const n = parseInt(raw, 10);
  const from = Number.isFinite(n) ? n : 1;
  const width = /^0\d/.test(raw) ? raw.length : 0; // "01" → 01, 02, 03…
  return Array.from({ length: count }, (_, i) => withPrefix(String(from + i).padStart(width, '0')));
}

interface Props {
  existingNames: string[];
  defaults: { address: string; wifiNetwork: string; wifiPassword: string };
  onSave: (units: Property[], categoryForPricing: string | null) => Promise<void> | void;
  onClose: () => void;
}

export const BulkUnitsModal: React.FC<Props> = ({ existingNames, defaults, onSave, onClose }) => {
  const [category, setCategory] = useState('');
  const [guests, setGuests] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [count, setCount] = useState(5);
  const [naming, setNaming] = useState<Naming>('numeros');
  const [start, setStart] = useState('101');
  const [list, setList] = useState('');
  const [prefix, setPrefix] = useState('');
  const [toPricing, setToPricing] = useState(true);
  const [saving, setSaving] = useState(false);

  const names = useMemo(() => buildUnitNames({ naming, count, start, list, prefix }), [naming, count, start, list, prefix]);
  const taken = useMemo(() => {
    const existing = new Set(existingNames.map((n) => n.trim().toLowerCase()));
    const seen = new Set<string>();
    const out: string[] = [];
    for (const n of names) {
      const k = n.toLowerCase();
      if (existing.has(k) || seen.has(k)) out.push(n);
      seen.add(k);
    }
    return out;
  }, [names, existingNames]);

  const problem = !category.trim()
    ? 'Poné el nombre de la categoría.'
    : names.length === 0
    ? 'Falta decir cuántas son y cómo se llaman.'
    : taken.length
    ? `Ya existe${taken.length === 1 ? '' : 'n'}: ${taken.slice(0, 5).join(', ')}${taken.length > 5 ? '…' : ''}`
    : '';

  const save = async () => {
    if (problem || saving) return;
    setSaving(true);
    const stamp = Date.now();
    const cat = category.trim();
    const units: Property[] = names.map((name, i) => ({
      id: `prop-${stamp}-${i}`,
      name,
      type: cat,
      address: defaults.address,
      city: '',
      neighborhood: '',
      bedrooms,
      bathrooms,
      maxGuests: guests,
      basePrice: 0,
      cleaningFee: 0,
      imageUrl: '',
      rating: 0,
      reviewsCount: 0,
      status: 'active',
      syncStatus: { airbnb: false, booking: false, vrbo: false },
      smartLock: { enabled: false, brand: '' },
      wifiNetwork: defaults.wifiNetwork,
      wifiPassword: defaults.wifiPassword,
    }));
    try {
      await onSave(units, toPricing ? cat : null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const label = 'block text-sm font-bold text-stone-900 dark:text-white mb-1.5';
  const input =
    'w-full min-h-[46px] px-3.5 rounded-xl border-2 border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-base font-semibold text-stone-900 dark:text-white focus:outline-none focus:border-[#E67E22]';
  const help = 'mt-1 text-xs font-medium text-stone-700 dark:text-stone-300';
  const seg = (on: boolean) =>
    `flex-1 min-h-[42px] px-3 rounded-lg text-sm font-bold cursor-pointer ${
      on ? 'bg-[#E67E22] text-white' : 'text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800'
    }`;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#18191E] rounded-t-3xl sm:rounded-3xl border border-stone-200 dark:border-zinc-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cargar varias unidades"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 sm:px-6 py-4 bg-white dark:bg-[#18191E] border-b border-stone-200 dark:border-zinc-700">
          <h3 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white">
            <Layers className="w-5 h-5 text-[#E67E22]" /> Cargar varias unidades
          </h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="w-10 h-10 rounded-full flex items-center justify-center text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          <div>
            <label className={label} htmlFor="bulk-cat">
              Categoría
            </label>
            <input id="bulk-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={input} placeholder="Ej: Doble Standard, Twin Superior, Depto 2 ambientes" />
            <p className={help}>Con el nombre que usen en el lugar.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label} htmlFor="bulk-guests">
                Personas
              </label>
              <input id="bulk-guests" type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))} className={input} />
            </div>
            <div>
              <label className={label} htmlFor="bulk-bed">
                Dormitorios
              </label>
              <input id="bulk-bed" type="number" min={0} max={10} value={bedrooms} onChange={(e) => setBedrooms(Math.max(0, Number(e.target.value) || 0))} className={input} />
            </div>
            <div>
              <label className={label} htmlFor="bulk-bath">
                Baños
              </label>
              <input id="bulk-bath" type="number" min={0} max={10} value={bathrooms} onChange={(e) => setBathrooms(Math.max(0, Number(e.target.value) || 0))} className={input} />
            </div>
          </div>

          <div>
            <span className={label}>¿Cómo se llaman?</span>
            <div className="flex gap-1 p-1 rounded-xl border-2 border-stone-300 dark:border-zinc-600">
              <button type="button" className={seg(naming === 'numeros')} onClick={() => setNaming('numeros')}>
                Números
              </button>
              <button type="button" className={seg(naming === 'letras')} onClick={() => setNaming('letras')}>
                Letras
              </button>
              <button type="button" className={seg(naming === 'lista')} onClick={() => setNaming('lista')}>
                A mano
              </button>
            </div>
          </div>

          {naming === 'lista' ? (
            <div>
              <label className={label} htmlFor="bulk-list">
                Nombres, separados por coma
              </label>
              <textarea
                id="bulk-list"
                value={list}
                onChange={(e) => setList(e.target.value)}
                rows={3}
                className={`${input} py-2.5`}
                placeholder="Ej: 101, 102, 105, 201, Suite Jardín"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label} htmlFor="bulk-count">
                  Cuántas
                </label>
                <input id="bulk-count" type="number" min={1} max={MAX_UNITS} value={count} onChange={(e) => setCount(Number(e.target.value) || 0)} className={input} />
              </div>
              <div>
                <label className={label} htmlFor="bulk-start">
                  {naming === 'letras' ? 'Desde la letra' : 'Desde el número'}
                </label>
                <input id="bulk-start" value={start} onChange={(e) => setStart(e.target.value)} className={input} placeholder={naming === 'letras' ? 'A' : '101'} />
              </div>
            </div>
          )}

          <div>
            <label className={label} htmlFor="bulk-prefix">
              Antes del número (opcional)
            </label>
            <input id="bulk-prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} className={input} placeholder="Ej: Hab., Depto, Cabaña" />
          </div>

          <div className="rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 p-4">
            <p className="text-sm font-bold text-stone-900 dark:text-white mb-2">
              {names.length ? `Se van a crear ${names.length}:` : 'Vista previa'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {names.map((n) => (
                <span
                  key={n}
                  className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${
                    taken.includes(n) ? 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200' : 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-white border border-stone-200 dark:border-zinc-700'
                  }`}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={toPricing} onChange={(e) => setToPricing(e.target.checked)} className="mt-1 w-5 h-5 accent-[#E67E22] cursor-pointer" />
            <span className="text-sm font-semibold text-stone-900 dark:text-white">
              Crear la categoría en Tarifas y asignarle estas unidades, para ponerle precio una sola vez
            </span>
          </label>

          {problem && <p className="text-sm font-bold text-red-700 dark:text-red-300">{problem}</p>}
        </div>

        <div className="sticky bottom-0 flex gap-3 px-5 sm:px-6 py-4 bg-white dark:bg-[#18191E] border-t border-stone-200 dark:border-zinc-700">
          <button type="button" onClick={onClose} className="flex-1 min-h-[48px] rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-base font-bold text-stone-900 dark:text-white cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!!problem || saving}
            className="flex-[2] min-h-[48px] rounded-xl bg-[#E67E22] hover:bg-[#D35400] disabled:opacity-50 text-white text-base font-bold cursor-pointer"
          >
            {saving ? 'Creando…' : names.length ? `Crear ${names.length} ${names.length === 1 ? 'unidad' : 'unidades'}` : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};
