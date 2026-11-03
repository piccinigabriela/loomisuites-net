/**
 * El checklist de limpieza que arma cada dueño: tareas de todas las limpiezas y tareas extra por unidad.
 * Arriba de la Agenda de limpiezas. Se guarda en tenants/{uid}.cleaningChecklist (ver src/lib/cleaningChecklist.ts).
 */
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ListChecks, Plus, Trash2 } from 'lucide-react';
import type { Property } from '../../types';
import {
  DEFAULT_CLEANING_ITEMS,
  MAX_ITEMS,
  MAX_ITEM_LENGTH,
  generalItems,
  unitItems,
  type CleaningChecklistSettings,
} from '../../lib/cleaningChecklist';

const ItemList: React.FC<{
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}> = ({ items, onChange, placeholder }) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (!t || items.length >= MAX_ITEMS) return;
    onChange([...items, t.slice(0, MAX_ITEM_LENGTH)]);
    setDraft('');
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const btn =
    'w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer';
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={it}
            maxLength={MAX_ITEM_LENGTH}
            onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))}
            className="flex-1 min-w-0 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-base text-stone-900 dark:text-white focus:outline-none focus:border-[#E67E22]"
          />
          <button type="button" className={`${btn} hidden sm:flex`} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button type="button" className={`${btn} hidden sm:flex`} onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Bajar">
            <ArrowDown className="w-4 h-4" />
          </button>
          <button type="button" className={btn} onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label="Borrar tarea">
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-1.5 pt-1">
        <input
          value={draft}
          maxLength={MAX_ITEM_LENGTH}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-0 rounded-xl border border-dashed border-stone-400 dark:border-zinc-500 bg-transparent px-3.5 py-2.5 text-base text-stone-900 dark:text-white placeholder:text-stone-600 dark:placeholder:text-stone-300 focus:outline-none focus:border-[#E67E22]"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || items.length >= MAX_ITEMS}
          className="shrink-0 h-11 px-4 rounded-xl bg-[#E67E22] hover:bg-[#d35400] text-[#111] text-sm font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>
    </div>
  );
};

export const CleaningChecklistEditor: React.FC<{
  settings?: CleaningChecklistSettings;
  properties: Property[];
  /** Limpiezas que todavía no empezaron (para actualizarlas también) */
  pendingCount: number;
  onSave: (settings: CleaningChecklistSettings, applyToPending: boolean) => Promise<void>;
}> = ({ settings, properties, pendingCount, onSave }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [units, setUnits] = useState<Record<string, string[]>>({});
  const [unitId, setUnitId] = useState('');
  const [applyPending, setApplyPending] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const savedItems = generalItems(settings);
  const unitsWithExtras = properties.filter((p) => unitItems(settings, p.id).length > 0).length;
  const isDefault = !settings || !Array.isArray(settings.items);

  const startEdit = () => {
    setItems(savedItems);
    setUnits(Object.fromEntries(properties.map((p) => [p.id, unitItems(settings, p.id)])));
    setUnitId(properties[0]?.id || '');
    setApplyPending(true);
    setError('');
    setOpen(true);
  };

  const dirty = useMemo(() => {
    if (!open) return false;
    const now = JSON.stringify([items.map((s) => s.trim()).filter(Boolean), properties.map((p) => (units[p.id] || []).map((s) => s.trim()).filter(Boolean))]);
    const before = JSON.stringify([savedItems, properties.map((p) => unitItems(settings, p.id))]);
    return now !== before;
  }, [open, items, units, properties, settings, savedItems]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave({ items, units }, applyPending && pendingCount > 0);
      setOpen(false);
    } catch {
      setError('No se pudo guardar. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const unit = properties.find((p) => p.id === unitId);

  return (
    <section className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-zinc-800 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="w-11 h-11 rounded-xl bg-[#E67E22]/15 flex items-center justify-center shrink-0">
          <ListChecks className="w-5 h-5 text-[#C25E0B] dark:text-[#F5A35C]" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">Tu checklist de limpieza</h3>
          <p className="text-base text-stone-800 dark:text-stone-100">
            {isDefault ? 'Tareas de siempre' : `${savedItems.length} ${savedItems.length === 1 ? 'tarea' : 'tareas'} en cada limpieza`}
            {unitsWithExtras > 0 && ` · ${unitsWithExtras} ${unitsWithExtras === 1 ? 'unidad' : 'unidades'} con tareas propias`}
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={startEdit}
            className="shrink-0 min-h-[44px] px-5 rounded-2xl border-2 border-[#E67E22] text-stone-900 dark:text-white text-base font-bold hover:bg-[#E67E22]/10 cursor-pointer"
          >
            Editar
          </button>
        )}
      </div>

      {open && (
        <div className="mt-6 space-y-7">
          <div>
            <h4 className="text-base font-bold text-stone-900 dark:text-white">En todas las limpiezas</h4>
            <p className="text-sm text-stone-800 dark:text-stone-200 mb-3">Lo que se hace en cada salida, en el orden en que lo ve Limpieza.</p>
            <ItemList items={items} onChange={setItems} placeholder="Nueva tarea, por ejemplo: Revisar el control del aire" />
            {isDefault && (
              <p className="mt-2 text-sm text-stone-800 dark:text-stone-200">Hoy son las tareas que trae Loomi: cambialas como quieras.</p>
            )}
            {!isDefault && (
              <button
                type="button"
                onClick={() => setItems([...DEFAULT_CLEANING_ITEMS])}
                className="mt-2 text-sm font-semibold text-[#C25E0B] dark:text-[#F5A35C] underline underline-offset-4 cursor-pointer"
              >
                Volver a las tareas que trae Loomi
              </button>
            )}
          </div>

          {properties.length > 0 && (
            <div>
              <h4 className="text-base font-bold text-stone-900 dark:text-white">Tareas propias de una unidad</h4>
              <p className="text-sm text-stone-800 dark:text-stone-200 mb-3">
                Lo que es distinto en cada lugar. Se suman al final, solo en las limpiezas de esa unidad.
              </p>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full sm:w-auto mb-3 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-base font-semibold text-stone-900 dark:text-white cursor-pointer"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {(units[p.id] || []).filter((s) => s.trim()).length ? ` (${(units[p.id] || []).filter((s) => s.trim()).length})` : ''}
                  </option>
                ))}
              </select>
              {unit && (
                <ItemList
                  key={unit.id}
                  items={units[unit.id] || []}
                  onChange={(list) => setUnits((prev) => ({ ...prev, [unit.id]: list }))}
                  placeholder="Por ejemplo: Regar las plantas de la galería"
                />
              )}
            </div>
          )}

          {pendingCount > 0 && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={applyPending}
                onChange={(e) => setApplyPending(e.target.checked)}
                className="mt-1 w-5 h-5 accent-[#E67E22]"
              />
              <span className="text-base text-stone-900 dark:text-stone-100">
                {pendingCount === 1
                  ? 'Usarlo también en la limpieza que ya está agendada y todavía no empezó'
                  : `Usarlo también en las ${pendingCount} limpiezas que ya están agendadas y todavía no empezaron`}
              </span>
            </label>
          )}

          {error && <p className="text-base font-bold text-red-700 dark:text-red-300">{error}</p>}

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="min-h-[48px] px-5 rounded-2xl border-2 border-stone-400 dark:border-zinc-500 text-stone-900 dark:text-white text-base font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="min-h-[48px] px-6 rounded-2xl bg-[#E67E22] hover:bg-[#d35400] text-[#111] text-base font-bold disabled:opacity-40 cursor-pointer"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
